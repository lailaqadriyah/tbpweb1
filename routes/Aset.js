var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const { getAllAset, getAsetForUpdate, updateAset, getAsetDetail, addAset, tampilFormPengajuan, prosesPengajuan, exportPDF, deleteAset } = require('../controllers/AsetController');

//  Konfigurasi multer langsung
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/aset');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Rute lainnya tetap sama
router.get('/addaset', function(req, res, next) {
  res.render('AddBarang', { title: 'Tambah Barang' });
});

router.get('/aset/detail/:id', getAsetDetail);

router.get('/aset', getAllAset); // RUTE UTAMA UNTUK MENAMPILKAN DAFTAR ASET DENGAN DATA DARI DATABASE
// Ubah rute GET ini:
router.get('/aset/update/:id', getAsetForUpdate); // RUTE UNTUK MENAMPILKAN FORM UPDATE BARANG

router.post('/aset/update/:id', upload.single('gambar_barang'), updateAset);

router.get('/aset/detail/:id', getAsetDetail);
router.get('/aset/add', addAset);
router.post('/aset/tambah', upload.single('gambar_barang'), addAset);

router.get('/aset/ajukan', tampilFormPengajuan);   // tampilkan form
router.post('/aset/ajukan', prosesPengajuan);      // proses form dan tampilkan surat

// Tambahkan rute baru untuk ekspor PDF
router.get('/aset/export-pdf', exportPDF);  // Menambahkan rute ekspor PDF

router.delete('/aset/:id', deleteAset);


module.exports = router;