// routes/dataasisten.js

const express = require('express');
const router = express.Router();
// Impor 'upload' yang sudah benar dari AddAslab.js
const AddAslab = require('./AddAslab'); 
const aslabController = require('../controllers/Aslabcontrol');


// Rute untuk menampilkan halaman data asisten
router.get('/data', aslabController.viewAsisten);

// Rute untuk menampilkan halaman update asisten
router.get('/update/:id', aslabController.updateForm);

// Rute untuk mengupdate data asisten (POST) - SEKARANG MENGGUNAKAN UPLOAD YANG BENAR
router.post('/update/:id', AddAslab.upload.single('foto'), aslabController.updateAsisten);

// Rute BARU untuk menghapus data asisten
router.post('/delete/:id', aslabController.deleteAsisten);

module.exports = router;
