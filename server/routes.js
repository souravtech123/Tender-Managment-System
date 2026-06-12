const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const { pool } = require("./config/db");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ─── Helper: normalise a single header key ───────────────────────────────────
function normalizeKey(key) {
  return String(key)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function normalizeRow(row) {
  const normalized = {};
  Object.keys(row).forEach((key) => {
    normalized[normalizeKey(key)] = row[key];
  });
  return normalized;
}

/**
 * Fuzzy field resolver.
 */
function pick(r, ...keywordGroups) {
  const keys = Object.keys(r);
  for (const group of keywordGroups) {
    const match = keys.find((k) => group.every((word) => k.includes(word)));
    if (match && r[match] !== null && r[match] !== undefined && r[match] !== "") {
      return r[match];
    }
  }
  return null;
}

// ─── POST /api/tenders/upload ─────────────────────────────────────────────────
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const client = await pool.connect();

  try {
    const workbook = xlsx.read(req.file.buffer, {
      type: "buffer",
      cellDates: true,
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rawData = xlsx.utils.sheet_to_json(worksheet, {
      defval: null,
      raw: false,
    });

    if (!rawData.length) {
      return res.status(400).json({ success: false, message: "Excel file is empty" });
    }

    const rowCount = rawData.length;
    const fileName = req.file.originalname;

    await client.query("BEGIN");

    // 1. Insert into uploads table
    const uploadResult = await client.query(
      `INSERT INTO uploads (file_name, row_count)
       VALUES ($1, $2) RETURNING id, file_name, row_count, uploaded_at`,
      [fileName, rowCount]
    );
    const newUpload = uploadResult.rows[0];

    // 2. Insert mapped rows into tenders table
    const insertQuery = `
      INSERT INTO tenders (
        upload_id,
        area,
        unit_project,
        type_of_contract,
        contract_period,
        published_date,
        bidders_participated,
        qualified_bidder,
        successful_bidder_name,
        successful_bidder_address,
        successful_bidder_contact,
        successful_bidder_email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;

    for (const row of rawData) {
      const r = normalizeRow(row);

      const area = pick(r, ["area"], ["location"], ["region"]);
      const unit_project = pick(r, ["unit", "project"], ["unit_project"], ["project_name"], ["work"], ["description"]);
      const type_of_contract = pick(r, ["type", "contract"], ["contract_type"], ["nature"]);
      const contract_period = pick(r, ["contract", "period"], ["period"], ["duration"], ["completion"], ["time"]);
      const published_date = pick(r, ["published", "date"], ["publish_date"], ["date_published"], ["publish"], ["date"]);
      
      let pDate = null;
      if (published_date) {
        const d = new Date(published_date);
        if (!isNaN(d.getTime())) {
          pDate = d.toISOString().split('T')[0];
        }
      }

      const bidders_participated = parseInt(pick(r, ["no", "bidder"], ["bidders", "participated"], ["no_of_bidder"], ["number_of_bidder"], ["bidder_count"], ["bidder"]) || "0", 10);
      const qualified_bidder = parseInt(pick(r, ["qualified", "bidder"], ["no", "qualified"], ["number_of_qualified"], ["qualified"]) || "0", 10);
      
      const successful_bidder_name = pick(r, ["successful", "name"], ["name", "bidder"], ["bidder", "name"], ["winner", "name"], ["awarded", "name"], ["awardee"]);
      const successful_bidder_address = pick(r, ["successful", "address"], ["address", "bidder"], ["bidder", "address"], ["winner", "address"], ["address"]);
      const successful_bidder_contact = pick(r, ["successful", "contact"], ["contact", "bidder"], ["bidder", "contact"], ["contact", "no"], ["phone", "bidder"], ["mobile", "bidder"], ["contact_number"], ["phone_number"], ["contact"], ["phone"], ["mobile"], ["tel"]);
      const successful_bidder_email = pick(r, ["successful", "email"], ["email", "bidder"], ["bidder", "email"], ["winner", "email"], ["email"]);

      const values = [
        newUpload.id,
        area,
        unit_project,
        type_of_contract,
        contract_period,
        pDate,
        isNaN(bidders_participated) ? 0 : bidders_participated,
        isNaN(qualified_bidder) ? 0 : qualified_bidder,
        successful_bidder_name,
        successful_bidder_address,
        successful_bidder_contact,
        successful_bidder_email
      ];

      await client.query(insertQuery, values);
    }

    // 3. Save raw (format-free) rows
    for (let i = 0; i < rawData.length; i++) {
      await client.query(
        `INSERT INTO raw_excel_rows (upload_id, row_index, row_data) VALUES ($1, $2, $3)`,
        [newUpload.id, i, JSON.stringify(rawData[i])]
      );
    }

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: `Successfully saved ${rowCount} rows from "${fileName}"`,
      upload: newUpload,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

// ─── GET /api/tenders/uploads ─────────────────────────────────────────────────
router.get("/uploads", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM uploads ORDER BY uploaded_at DESC");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("FETCH UPLOADS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/tenders/uploads/:id/raw-rows ────────────────────────────────────────
router.get("/uploads/:id/raw-rows", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT row_index, row_data FROM raw_excel_rows WHERE upload_id = $1 ORDER BY row_index ASC",
      [id]
    );
    // Parse each row_data JSON string back to an object
    const rows = result.rows.map((r) => JSON.parse(r.row_data));
    res.status(200).json(rows);
  } catch (error) {
    console.error("FETCH RAW ROWS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/tenders/uploads/:id/rows ────────────────────────────────────────
router.get("/uploads/:id/rows", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM tenders WHERE upload_id = $1 ORDER BY id ASC",
      [id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("FETCH UPLOAD ROWS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/tenders/rows ────────────────────────────────────────────────────
router.get("/rows", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COALESCE(u.file_name, 'Manual Entry') as _sourceFile, t.*
      FROM tenders t
      LEFT JOIN uploads u ON t.upload_id = u.id
      ORDER BY t.id DESC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("FETCH ALL ROWS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/tenders/search ────────────────────────────────────────────────────
router.get("/search", async (req, res) => {
  try {
    const { q, publishedDate, uploadId } = req.query;
    let queryStr = `
      SELECT COALESCE(u.file_name, 'Manual Entry') as _sourceFile, t.*
      FROM tenders t
      LEFT JOIN uploads u ON t.upload_id = u.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramIndex = 1;

    if (uploadId && uploadId !== 'ALL') {
      queryStr += ` AND t.upload_id = $${paramIndex}`;
      queryParams.push(uploadId);
      paramIndex++;
    }

    if (q) {
      queryStr += ` AND (
        t.area LIKE $${paramIndex} OR
        t.unit_project LIKE $${paramIndex} OR
        t.type_of_contract LIKE $${paramIndex} OR
        t.successful_bidder_name LIKE $${paramIndex}
      )`;
      queryParams.push(`%${q}%`);
      paramIndex++;
    }

    if (publishedDate) {
      queryStr += ` AND t.published_date = $${paramIndex}`;
      queryParams.push(publishedDate);
      paramIndex++;
    }

    queryStr += ` ORDER BY u.uploaded_at DESC, t.id ASC`;

    const result = await pool.query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/tenders/rows ───────────────────────────────────────────────────
router.post("/rows", express.json(), async (req, res) => {
  try {
    const {
      area, unit_project, type_of_contract, contract_period, published_date,
      bidders_participated, qualified_bidder, successful_bidder_name,
      successful_bidder_address, successful_bidder_contact, successful_bidder_email
    } = req.body;

    const result = await pool.query(`
      INSERT INTO tenders (
        upload_id, area, unit_project, type_of_contract, contract_period, published_date,
        bidders_participated, qualified_bidder, successful_bidder_name,
        successful_bidder_address, successful_bidder_contact, successful_bidder_email
      ) VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
    `, [
      area, unit_project, type_of_contract, contract_period, published_date,
      bidders_participated || 0, qualified_bidder || 0, successful_bidder_name,
      successful_bidder_address, successful_bidder_contact, successful_bidder_email
    ]);
    
    res.status(201).json({ success: true, tender: result.rows[0] });
  } catch (error) {
    console.error("ADD TENDER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/tenders/rows/:id ────────────────────────────────────────────────
router.put("/rows/:id", express.json(), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      area, unit_project, type_of_contract, contract_period, published_date,
      bidders_participated, qualified_bidder, successful_bidder_name,
      successful_bidder_address, successful_bidder_contact, successful_bidder_email
    } = req.body;

    const result = await pool.query(`
      UPDATE tenders SET
        area = $1, unit_project = $2, type_of_contract = $3, contract_period = $4,
        published_date = $5, bidders_participated = $6, qualified_bidder = $7,
        successful_bidder_name = $8, successful_bidder_address = $9,
        successful_bidder_contact = $10, successful_bidder_email = $11
      WHERE id = $12 RETURNING *
    `, [
      area, unit_project, type_of_contract, contract_period, published_date,
      bidders_participated || 0, qualified_bidder || 0, successful_bidder_name,
      successful_bidder_address, successful_bidder_contact, successful_bidder_email, id
    ]);
    
    res.status(200).json({ success: true, tender: result.rows[0] });
  } catch (error) {
    console.error("UPDATE TENDER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── DELETE /api/tenders/rows/:id ─────────────────────────────────────────────
router.delete("/rows/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM tenders WHERE id = $1", [id]);
    res.status(200).json({ success: true, message: "Tender deleted successfully" });
  } catch (error) {
    console.error("DELETE TENDER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── DELETE /api/tenders/uploads/:id ──────────────────────────────────────────
router.delete("/uploads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM uploads WHERE id = $1", [id]);
    res.status(200).json({ success: true, message: "Upload deleted successfully" });
  } catch (error) {
    console.error("DELETE UPLOAD ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// ─── Document Upload Config ───────────────────────────────────────────────────
const path = require("path");
const fs = require("fs");

const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "uploads", "documents");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const uploadDocument = multer({ storage: documentStorage });

// ─── POST /api/tenders/:id/documents ──────────────────────────────────────────
router.post("/:id/documents", uploadDocument.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const { id } = req.params;
  const { document_name } = req.body;
  
  if (!document_name) {
    // optionally cleanup the uploaded file if we want to be strict
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, message: "document_name is required" });
  }

  try {
    // file_path relative to server root to serve easily via static route
    const file_path = "/uploads/documents/" + req.file.filename;

    const result = await pool.query(
      `INSERT INTO tender_documents (tender_id, document_name, file_name, file_path)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, document_name, req.file.originalname, file_path]
    );

    res.status(201).json({ success: true, document: result.rows[0] });
  } catch (error) {
    console.error("DOCUMENT UPLOAD ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/tenders/:id/documents ───────────────────────────────────────────
router.get("/:id/documents", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM tender_documents WHERE tender_id = $1 ORDER BY uploaded_at DESC",
      [id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("FETCH DOCUMENTS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;