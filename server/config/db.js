const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user:     process.env.DB_USER     || "postgres",
  host:     process.env.DB_HOST     || "localhost",
  database: process.env.DB_NAME     || "tender_db",
  password: process.env.DB_PASSWORD || "sourav2026",
  port:     process.env.DB_PORT     || 5432,
});

const initializeDB = async () => {
  try {
    // ── Drop old dynamic JSONB tables to migrate to strict schema ─────────────
    await pool.query(`DROP TABLE IF EXISTS upload_rows CASCADE;`);
    // Removed DROP TABLE for uploads and tenders so data is stored permanently

    // ── uploads: one row per Excel file uploaded ─────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS uploads (
        id          SERIAL PRIMARY KEY,
        file_name   VARCHAR(255)  NOT NULL,
        row_count   INTEGER       NOT NULL DEFAULT 0,
        uploaded_at TIMESTAMP     NOT NULL DEFAULT NOW()
      );
    `);

    // ── tenders: strict schema for tender data ───────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenders (
        id SERIAL PRIMARY KEY,
        upload_id INTEGER REFERENCES uploads(id) ON DELETE CASCADE,
        
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
        successful_bidder_email VARCHAR(255)
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
        id SERIAL PRIMARY KEY,
        tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
        document_name VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log("✅ Database tables ready (uploads, tenders, tender_documents) - Strict Schema");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
};

module.exports = { pool, initializeDB };