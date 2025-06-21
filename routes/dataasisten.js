// routes/dataasisten.js

const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const aslabController = require('../controllers/Aslabcontrol');

// Konfigurasi multer untuk meng-handle upload foto
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Tentukan folder penyimpanan gambar
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nama file yang unik dengan timestamp
  }
});

const upload = multer({ storage: storage });


// Rute untuk menampilkan halaman data asisten
router.get('/data', aslabController.viewAsisten);

// Rute untuk menampilkan halaman update asisten
router.get('/update/:id', aslabController.updateForm);  // Menggunakan :id sebagai parameter URL

// Rute untuk mengupdate data asisten (POST)
router.post('/update/:id', upload.single('foto'), aslabController.updateAsisten);  // Menangani permintaan POST

module.exports = router;
