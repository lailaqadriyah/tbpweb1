const express = require('express');
const router = express.Router();

// Import controller Peminjaman
const peminjamanController = require('../controllers/PeminjamanBarangController'); // Pastikan path ini sesuai!
const { riwayatPeminjaman } = require('../controllers/PeminjamanBarangController');

// Rute untuk menampilkan daftar semua peminjaman barang
router.get('/peminjaman', peminjamanController.getAllPeminjaman);

// Rute untuk menambahkan data peminjaman barang
router.post('/peminjaman/tambah', peminjamanController.tambahPeminjaman);

// Rute untuk menghapus data peminjaman (misalnya melalui tombol hapus di tabel)
router.post('/peminjaman/hapus/:id', peminjamanController.hapusPeminjaman);

// Rute untuk mengupdate status peminjaman (misalnya menjadi 'Selesai', 'Dipinjam', dll.)
router.post('/peminjaman/update-status/:id', peminjamanController.updateStatusPeminjaman);

router.get('/riwayat', riwayatPeminjaman);

module.exports = router;
