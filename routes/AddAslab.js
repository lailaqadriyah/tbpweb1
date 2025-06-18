const express = require('express');
const router = express.Router();
const path = require('path'); // Don't forget to import 'path' module for file paths
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

// Route untuk menampilkan form tambah asisten
router.get('/tambah', aslabController.formTambahAslab);

// Route untuk menyimpan data asisten
router.post('/tambah', upload.single('foto'), aslabController.simpanAslab);  // 'foto' adalah nama field di form

router.get('/tambah', aslabController.formTambahAslab);
router.post('/tambah', upload.single('foto'), aslabController.simpanAslab);


module.exports = router;
