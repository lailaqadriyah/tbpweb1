const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const aslabController = require('../controllers/Aslabcontrol');

// Konfigurasi multer untuk menangani upload foto
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'public/uploads/asisten';
    // Secara otomatis membuat direktori jika belum ada
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nama file yang unik dengan timestamp
  }
});

const upload = multer({ storage: storage });

// Rute dari AddAslab.js
router.get('/tambah', aslabController.formTambahAslab);
router.post('/tambah', upload.single('foto'), aslabController.simpanAslab);

// Rute dari dataasisten.js
router.get('/data', aslabController.viewAsisten);
router.get('/update/:nomor_asisten', aslabController.updateForm);
router.post('/update/:nomor_asisten', upload.single('foto'), aslabController.updateAslab);
router.post('/delete/:nomor_asisten', aslabController.deleteAsisten);

// Rute untuk validasi real-time
router.get('/check-nomor-asisten', aslabController.checkNomorAsisten);
router.get('/check-nim', aslabController.checkNIM);

module.exports = router; 