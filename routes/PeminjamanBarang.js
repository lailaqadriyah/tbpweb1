const express = require('express');
const router = express.Router();

// Import controller Peminjaman
const peminjamanController = require('../controllers/PeminjamanBarangController'); // Pastikan path ini sesuai!
const { riwayatPeminjaman } = require('../controllers/PeminjamanBarangController');

// Tampilkan form tambah peminjaman
router.get('/peminjaman/tambah', (req, res) => {
    res.render('FormPeminjamanBarang', { title: 'Tambah Peminjaman' });
});

// Tampilkan daftar semua peminjaman barang
router.get('/peminjaman', peminjamanController.getAllPeminjaman);

// Tambah data peminjaman barang (POST)
router.post('/peminjaman/tambah', peminjamanController.tambahPeminjaman);

// Hapus data peminjaman
router.post('/peminjaman/hapus/:id', peminjamanController.hapusPeminjaman);

// Update status peminjaman
router.post('/peminjaman/update-status', peminjamanController.updateStatusPeminjaman);

// Tampilkan riwayat
router.get('/riwayat', riwayatPeminjaman);

module.exports = router;
