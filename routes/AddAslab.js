const express = require('express');
const router = express.Router();
const aslabController = require('../controllers/Aslabcontrol');

// Tampilkan halaman form tambah
router.get('/tambah', aslabController.formTambahAslab);

// Tangani pengiriman form (tanpa upload gambar)
router.post('/tambah', aslabController.simpanAslab);

module.exports = router;
