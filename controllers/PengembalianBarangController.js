// controllers/PengembalianController.js

const { PengembalianBarang } = require('../models/PengembalianBarangModel'); // Model yang diimpor
const { Op } = require('sequelize'); 

// ==============================================================================
// CONTROLLER: getAllPengembalian
// Fungsi untuk menampilkan daftar semua data pengembalian barang dari database (tanpa pencarian/filter).
// ==============================================================================
const getAllPengembalian = async (req, res) => {
    try {
        const { search, kategori, lokasi, status } = req.query; // Menerima query search, kategori, lokasi, dan status

        const whereConditions = {};  // Inisialisasi kondisi pencarian

        // Jika ada parameter pencarian, tambahkan kondisi untuk `nama_peminjam`, `nama_barang`, dan `status_pengembalian`
        if (search) {
            whereConditions[Op.or] = [
                { nama_peminjam: { [Op.like]: `%${search}%` } }, // Pencarian berdasarkan nama peminjam
                { nama_barang: { [Op.like]: `%${search}%` } },   // Pencarian berdasarkan nama barang
                { status_pengembalian: { [Op.like]: `%${search}%` } } // Pencarian berdasarkan status pengembalian
            ];
        }

        // Jika ada kategori, tambahkan filter berdasarkan kategori_barang
        if (kategori && kategori !== '') {
            whereConditions.kategori_barang = kategori;
        }

        // Jika ada lokasi, tambahkan filter berdasarkan lokasi
        if (lokasi && lokasi !== '') {
            whereConditions.lokasi = lokasi;
        }

        // Jika ada status, tambahkan filter berdasarkan status_pengembalian
        if (status && status !== '') {
            whereConditions.status_pengembalian = status;
        }

        // Ambil data pengembalian berdasarkan filter (jika ada)
        const allPengembalian = await PengembalianBarang.findAll({
            where: whereConditions,  // Menggunakan kondisi pencarian
            order: [['id', 'DESC']]  // Urutkan berdasarkan ID secara descending (terbaru di atas)
        });

        // Render template EJS 'PengembalianBarang.ejs'
        // dan meneruskan data yang diambil dari database ke view.
        res.render('PengembalianBarang', {
            title: 'Daftar Pengembalian Barang',  // Judul halaman untuk EJS
            pengembalian: allPengembalian,  // Variabel 'pengembalian' yang akan diakses di EJS
            search,  // Kirim parameter pencarian kembali ke frontend
            kategori,  // Kirim kategori ke frontend
            lokasi,  // Kirim lokasi ke frontend
            status  // Kirim status ke frontend
        });

    } catch (error) {
        console.error('Error saat mengambil data pengembalian:', error);
        res.status(500).send('Terjadi kesalahan server saat memuat daftar pengembalian barang.');
    }
};


// ==============================================================================
// CONTROLLER: updateStatusPengembalian
// Fungsi untuk mengupdate status pengembalian barang berdasarkan ID.
// ==============================================================================
const updateStatusPengembalian = async (req, res) => {
    try {
        // Menerima array ID dari body permintaan (dari JavaScript di frontend)
        const { idsToUpdate } = req.body;

        if (!idsToUpdate || !Array.isArray(idsToUpdate) || idsToUpdate.length === 0) {
            return res.status(400).json({ error: 'Tidak ada ID pengembalian yang disediakan untuk update.' });
        }

        // Melakukan update massal untuk semua ID yang diterima
        const [updatedRowsCount] = await PengembalianBarang.update(
            { status_pengembalian: 'Dikembalikan' }, // Kolom yang ingin diupdate dan nilai barunya
            {
                where: {
                    id: {
                        [Op.in]: idsToUpdate // Menggunakan Op.in untuk mencocokkan beberapa ID sekaligus
                    }
                }
            }
        );

        if (updatedRowsCount > 0) {
            res.status(200).json({ message: `${updatedRowsCount} item pengembalian berhasil diupdate menjadi 'Dikembalikan'.` });
        } else {
            res.status(404).json({ error: 'Tidak ada item pengembalian yang ditemukan untuk diupdate.' });
        }

    } catch (error) {
        console.error('Error saat mengupdate status pengembalian:', error);
        res.status(500).json({
            error: 'Terjadi kesalahan server saat mengupdate status pengembalian.',
            details: error.message
        });
    }
};




module.exports = {
    getAllPengembalian,
    updateStatusPengembalian,
};