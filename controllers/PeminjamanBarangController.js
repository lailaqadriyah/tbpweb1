// controllers/PeminjamanController.js

const { PeminjamanBarang } = require('../models/PeminjamanBarangModel'); // Model Sequelize
const { Op } = require('sequelize'); // Diperlukan untuk operasi 'in' atau pencarian nanti

// ==============================================================================
// CONTROLLER: getAllPeminjaman
// Menampilkan semua data peminjaman barang
// ==============================================================================
const getAllPeminjaman = async (req, res) => {
    try {
        const semuaPeminjaman = await PeminjamanBarang.findAll({
            order: [['id', 'DESC']] // Menampilkan data terbaru terlebih dahulu
        });

        res.render('PeminjamanBarang', {
            title: 'Daftar Peminjaman Barang',
            peminjaman: semuaPeminjaman
        });

    } catch (error) {
        console.error('Gagal mengambil data peminjaman:', error);
        res.status(500).send('Terjadi kesalahan saat memuat data peminjaman.');
    }
};

// ==============================================================================
// CONTROLLER: tambahPeminjaman
// Menambahkan data peminjaman barang baru
// ==============================================================================
const tambahPeminjaman = async (req, res) => {
    try {
        const {
            nama_peminjam,
            nama_barang,
            no_hp,
            tanggal_pinjam,
            tanggal_kembali,
            status_peminjaman
        } = req.body;

        // Validasi sederhana (opsional bisa ditambahkan validasi lebih detail)
        if (!nama_peminjam || !nama_barang || !tanggal_pinjam || !tanggal_kembali) {
            return res.status(400).send('Data peminjaman tidak lengkap.');
        }

        await PeminjamanBarang.create({
            nama_peminjam,
            nama_barang,
            no_hp,
            tanggal_pinjam,
            tanggal_kembali,
            status_peminjaman: status_peminjaman || 'Dipinjam' // Default status
        });

        res.redirect('/peminjaman'); // Arahkan kembali ke halaman daftar peminjaman

    } catch (error) {
        console.error('Gagal menambahkan data peminjaman:', error);
        res.status(500).send('Terjadi kesalahan saat menambahkan peminjaman.');
    }
};

// ==============================================================================
// CONTROLLER: hapusPeminjaman
// Menghapus data peminjaman berdasarkan ID
// ==============================================================================
const hapusPeminjaman = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await PeminjamanBarang.findByPk(id);
        if (!data) {
            return res.status(404).send('Data peminjaman tidak ditemukan.');
        }

        await data.destroy();
        res.redirect('/peminjaman');

    } catch (error) {
        console.error('Gagal menghapus data peminjaman:', error);
        res.status(500).send('Terjadi kesalahan saat menghapus data peminjaman.');
    }
};

// ==============================================================================
// CONTROLLER: updateStatusPeminjaman
// Mengupdate status peminjaman berdasarkan ID (misalnya: dari "Dipinjam" ke "Dikembalikan")
// ==============================================================================
const updateStatusPeminjaman = async (req, res) => {
    try {
        const { id } = req.params;
        const { status_peminjaman } = req.body;

        const peminjaman = await PeminjamanBarang.findByPk(id);
        if (!peminjaman) {
            return res.status(404).send('Data peminjaman tidak ditemukan.');
        }

        peminjaman.status_peminjaman = status_peminjaman || 'Dipinjam';
        await peminjaman.save();

        res.redirect('/peminjaman');

    } catch (error) {
        console.error('Gagal mengupdate status peminjaman:', error);
        res.status(500).send('Terjadi kesalahan saat mengupdate status.');
    }
};

module.exports = {
    getAllPeminjaman,
    tambahPeminjaman,
    hapusPeminjaman,
    updateStatusPeminjaman
};
