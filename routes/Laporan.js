
// ================= routes/Laporan.js =================
const express = require('express');
const router = express.Router();

const {
  tampilBarangRusak,
  exportBarangRusak,
  getLaporanDikembalikan,
  exportLaporanPengembalian,
  getLaporanRiwayatPeminjaman,
  exportRiwayatPeminjaman
} = require('../controllers/Laporan');

// Halaman utama laporan
router.get('/laporan', (req, res) => {
  res.render('Laporan', { title: 'Laporan' });
});

// Laporan Barang Rusak
router.get('/laporan/barang-rusak', tampilBarangRusak);
router.post('/laporan/export', exportBarangRusak);

// Laporan Pengembalian
router.get('/laporan/dikembalikan', getLaporanDikembalikan);
router.post('/laporan/dikembalikan/export', exportLaporanPengembalian);

// Laporan Riwayat Peminjaman
router.get('/laporan/riwayat-peminjaman', getLaporanRiwayatPeminjaman);
router.post('/laporan/riwayat-peminjaman/export', exportRiwayatPeminjaman);

module.exports = router;