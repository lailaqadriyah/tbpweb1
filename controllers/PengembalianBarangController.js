// controllers/PengembalianController.js

const { Pengembalian } = require('../models/PengembalianModel'); // Sesuaikan path ke model Pengembalian Anda
// const { Op } = require('sequelize'); // TIDAK DIPERLUKAN KARENA TIDAK ADA PENCARIAN/FILTER

// ==============================================================================
// CONTROLLER: getAllPengembalian
// Fungsi untuk menampilkan daftar semua data pengembalian barang dari database (tanpa pencarian/filter).
// ==============================================================================
const getAllPengembalian = async (req, res) => {
    try {
        // Mengambil semua data dari tabel 'pengembalian'
        // Tanpa kondisi 'where' akan mengambil semua baris.
        const allPengembalian = await Pengembalian.findAll({
            order: [['id', 'DESC']] // Urutkan berdasarkan ID secara descending (terbaru di atas)
            // Anda bisa urutkan berdasarkan 'tanggal_pinjam' atau 'tanggal_aktual_kembali' jika ada kolom tersebut
        });

        // Merender template EJS 'PengembalianBarang.ejs'
        // dan meneruskan data yang diambil dari database ke view.
        res.render('PengembalianBarang', {
            title: 'Daftar Pengembalian Barang', // Judul halaman untuk EJS
            pengembalian: allPengembalian      // Variabel 'pengembalian' yang akan diakses di EJS
            
        });

    } catch (error) {
        console.error('Error saat mengambil data pengembalian:', error);

        res.status(500).send('Terjadi kesalahan server saat memuat daftar pengembalian barang.');
    }
};

module.exports = {
    getAllPengembalian,

};