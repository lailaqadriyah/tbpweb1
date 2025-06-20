// controllers/PengembalianController.js

const { PengembalianBarang } = require('../models/PengembalianBarangModel'); // Model yang diimpor
// const { Op } = require('sequelize'); // TIDAK DIPERLUKAN KARENA TIDAK ADA PENCARIAN/FILTER

// ==============================================================================
// CONTROLLER: getAllPengembalian
// Fungsi untuk menampilkan daftar semua data pengembalian barang dari database (tanpa pencarian/filter).
// ==============================================================================
const getAllPengembalian = async (req, res) => {
    try {
        // Mengambil semua data dari tabel 'pengembalian'
        // Tanpa kondisi 'where' akan mengambil semua baris.
        const allPengembalian = await PengembalianBarang.findAll({ // <--- PERBAIKAN DI SINI!
            order: [['id', 'DESC']] // Urutkan berdasarkan ID secara descending (terbaru di atas)
            // Anda bisa urutkan berdasarkan 'tanggal_pinjam' atau 'tanggal_aktual_kembali' jika ada kolom tersebut
        });

        // Merender template EJS 'PengembalianBarang.ejs'
        // dan meneruskan data yang diambil dari database ke view.
        res.render('PengembalianBarang', {
            title: 'Daftar Pengembalian Barang', // Judul halaman untuk EJS
            pengembalian: allPengembalian        // Variabel 'pengembalian' yang akan diakses di EJS

        });

    } catch (error) {
        console.error('Error saat mengambil data pengembalian:', error);

        res.status(500).send('Terjadi kesalahan server saat memuat daftar pengembalian barang.');
    }
};

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

// CONTROLLER: laporanPengembalian
const laporanPengembalian = async (req, res) => {
    try {
        const laporan = await PengembalianBarang.findAll({
            where: { status_pengembalian: 'Sudah Dikembalikan' }, // ambil yang dikembalikan saja
            order: [['id', 'DESC']]
        });

        res.render('laporan', {
            title: 'Laporan Barang Dikembalikan',
            laporan // ⬅️ kirim ke EJS
        });
    } catch (error) {
        console.error('Gagal memuat laporan:', error);
        res.status(500).send('Gagal memuat laporan pengembalian.');
    }
};

module.exports = {
    getAllPengembalian,
    updateStatusPengembalian,
    laporanPengembalian
};