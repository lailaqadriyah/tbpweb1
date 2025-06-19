// routes/dataasisten.js

const express = require('express');
const router = express.Router();
const aslabController = require('../controllers/Aslabcontrol');

// Rute untuk menampilkan halaman data asisten
router.get('/aslab/data', aslabController.viewAsisten);

// Rute untuk menampilkan halaman update asisten
router.get('/aslab/update/:id', aslabController.updateForm);  // Menggunakan :id sebagai parameter URL

module.exports = router;
