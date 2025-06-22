const express = require('express');
const router = express.Router();

// Import controller Peminjaman
const peminjamanController = require('../controllers/PeminjamanBarangController'); // Pastikan path ini sesuai!
const { riwayatPeminjaman, upload } = require('../controllers/PeminjamanBarangController');

// Tampilkan form tambah peminjaman
router.get('/peminjaman/tambah', peminjamanController.showTambahPeminjamanForm);

// Tampilkan daftar semua peminjaman barang
router.get('/peminjaman', peminjamanController.getAllPeminjaman);

// Tampilkan form edit peminjaman
router.get('/peminjaman/edit/:id', peminjamanController.getDetailPeminjamanById);

// Update data peminjaman
router.post('/peminjaman/update/:id', peminjamanController.updatePeminjamanById);

// Tambah data peminjaman barang (POST)
router.post('/peminjaman/tambah', upload.single('gambar'), peminjamanController.tambahPeminjaman);

// Rute baru untuk menghapus beberapa peminjaman
router.post('/peminjaman/delete', peminjamanController.deletePeminjaman);

// Hapus data peminjaman
router.post('/peminjaman/hapus/:id', peminjamanController.hapusPeminjaman);

// Update status peminjaman
router.post('/peminjaman/update-status', peminjamanController.updateStatusPeminjaman);

// Tampilkan riwayat
router.get('/riwayat', peminjamanController.riwayatPeminjaman);

// Tampilkan detail peminjaman berdasarkan ID
router.get('/detailpeminjaman', peminjamanController.getDetailPeminjaman);

module.exports = router;
