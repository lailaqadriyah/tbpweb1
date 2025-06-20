var express = require('express');
var router = express.Router();
const { getAllAset, getAsetForUpdate, updateAset, getAsetDetail, addAset, tampilFormPengajuan, prosesPengajuan, exportPDF } = require('../controllers/AsetController');

// Rute lainnya tetap sama
router.get('/addaset', function(req, res, next) {
  res.render('AddBarang', { title: 'Tambah Barang' });
});

router.get('/aset/detail/:id', getAsetDetail);

router.get('/aset', getAllAset); // RUTE UTAMA UNTUK MENAMPILKAN DAFTAR ASET DENGAN DATA DARI DATABASE
// Ubah rute GET ini:
router.get('/aset/update/:id', getAsetForUpdate); // RUTE UNTUK MENAMPILKAN FORM UPDATE BARANG

// Ubah rute POST ini agar konsisten dengan form:
router.post('/aset/update/:id', updateAset); // Rute POST untuk memproses update barang

router.get('/aset/detail/:id', getAsetDetail);
router.get('/aset/add', addAset);
router.post('/aset/tambah', addAset)

router.get('/aset/ajukan', tampilFormPengajuan);   // tampilkan form
router.post('/aset/ajukan', prosesPengajuan);      // proses form dan tampilkan surat

// Tambahkan rute baru untuk ekspor PDF
router.get('/aset/export-pdf', exportPDF);  // Menambahkan rute ekspor PDF

module.exports = router;