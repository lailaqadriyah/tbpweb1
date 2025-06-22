var express = require('express');
var router = express.Router();
const { tampilBarangRusak, exportBarangRusak, getLaporanDikembalikan, exportLaporanPengembalian, exportRiwayatPeminjaman, getLaporanRiwayatPeminjaman } = require('../controllers/Laporan');

router.get('/laporan', function(req, res, next) {
  res.render('Laporan', { title: 'Laporan' });
});

router.get('/barang-rusak', tampilBarangRusak);
router.post('/laporan/export', exportBarangRusak);

router.get('/laporan/dikembalikan', getLaporanDikembalikan);
router.post('/laporan/dikembalikan/export', exportLaporanPengembalian);

router.post('/export-riwayat-peminjaman', exportRiwayatPeminjaman);

router.get('/laporan-riwayat-peminjaman', getLaporanRiwayatPeminjaman);

module.exports = router;