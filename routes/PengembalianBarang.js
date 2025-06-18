var express = require('express');
var router = express.Router();
// Import controller Pengembalian Anda
const pengembalianController = require('../controllers/PengembalianBarangController'); // PASTIKAN PATH INI BENAR!

// Rute untuk menampilkan daftar semua pengembalian barang
// Sekarang kita menggunakan fungsi controller yang akan mengambil data dari DB dan merendernya
router.get('/pengembalian', pengembalianController.getAllPengembalian);

// Rute untuk notifikasi pengembalian (tidak berubah karena tidak ada tabel di sini)
router.get('/notifpengembalian', function(req, res, next) {
  res.render('NotifikasiPengembalian', { title: 'Notifikasi Pengembalian' });
});

router.post('/pengembalian/update-status', pengembalianController.updateStatusPengembalian);

module.exports = router;