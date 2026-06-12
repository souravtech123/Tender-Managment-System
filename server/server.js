const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeDB } = require('./config/db');
const tenderRoutes = require('./routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const fs = require('fs');
const path = require('path');

// Ensure uploads/documents directory exists
const uploadDir = path.join(__dirname, 'uploads', 'documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/tenders', tenderRoutes);

// Initialize DB and start server
initializeDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
