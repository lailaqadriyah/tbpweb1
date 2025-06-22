const express = require('express');
const router = express.Router();
const path = require('path'); // Jangan lupa untuk mengimpor modul 'path' untuk jalur file
const multer = require('multer');
const fs = require('fs'); // Tambahkan ini untuk mengakses file system
const aslabController = require('../controllers/Aslabcontrol');

// Konfigurasi multer untuk meng-handle upload foto
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

// **Perbaikan**: Menghapus duplikasi route
// Route untuk menampilkan form tambah asisten
router.get('/tambah', aslabController.formTambahAslab);

// Route untuk menyimpan data asisten
router.post('/tambah', upload.single('foto'), aslabController.simpanAslab);  // 'foto' adalah nama field di form

// Export upload untuk digunakan di file lain
module.exports.upload = upload;
module.exports = router;
