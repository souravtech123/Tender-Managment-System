const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
require('dotenv').config();

let dbInstance = null;

// Mock pool to match the 'pg' API
const pool = {
  query: async (text, params) => {
    if (!dbInstance) {
      throw new Error("Database not initialized");
    }
    
    // SQLite uses $1, $2, etc., as named parameters instead of positional arrays.
    // We convert the array [a, b] into { $1: a, $2: b }
    let sqliteParams = {};
    if (Array.isArray(params)) {
      params.forEach((param, index) => {
        sqliteParams[`$${index + 1}`] = param;
      });
    }

    // Convert ILIKE to LIKE for SQLite compatibility just in case
    const sqliteText = text.replace(/ILIKE/gi, 'LIKE');

    const isSelect = sqliteText.trim().match(/^(SELECT|WITH)/i);
    const hasReturning = sqliteText.match(/RETURNING/i);

    if (isSelect || hasReturning) {
      const rows = await dbInstance.all(sqliteText, sqliteParams);
      return { rows, rowCount: rows.length };
    } else {
      const result = await dbInstance.run(sqliteText, sqliteParams);
      return { rows: [], rowCount: result.changes, lastID: result.lastID };
    }
  },
  connect: async () => {
    return {
      query: pool.query,
      release: () => {}
    };
  }
};

const initializeDB = async () => {
  try {
    const dbPath = path.resolve(__dirname, '../tender_db.sqlite');
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Foreign keys must be enabled in SQLite manually per connection
    await dbInstance.exec('PRAGMA foreign_keys = ON;');

    // ── Drop old dynamic JSONB tables to migrate to strict schema ─────────────
    await pool.query(`DROP TABLE IF EXISTS upload_rows;`);

    // ── uploads: one row per Excel file uploaded ─────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS uploads (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        file_name   VARCHAR(255)  NOT NULL,
        row_count   INTEGER       NOT NULL DEFAULT 0,
        uploaded_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── tenders: strict schema for tender data ───────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        upload_id INTEGER,
        
        area VARCHAR(255),
        unit_project TEXT,
        type_of_contract VARCHAR(255),
        contract_period VARCHAR(255),
        published_date DATE,
        bidders_participated INTEGER,
        qualified_bidder INTEGER,
        
        successful_bidder_name VARCHAR(500),
        successful_bidder_address TEXT,
        successful_bidder_contact VARCHAR(255),
        successful_bidder_email VARCHAR(255),
        FOREIGN KEY(upload_id) REFERENCES uploads(id) ON DELETE CASCADE
      );
    `);

    // Index for fast per-upload queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tenders_upload_id
      ON tenders(upload_id);
    `);

    // ── tender_documents: strict schema for tender documents ─────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tender_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tender_id INTEGER,
        document_name VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(tender_id) REFERENCES tenders(id) ON DELETE CASCADE
      );
    `);

    console.log("✅ Database tables ready (uploads, tenders, tender_documents) - Strict Schema");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
};

module.exports = { pool, initializeDB };