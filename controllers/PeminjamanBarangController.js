// controllers/PeminjamanController.js

const { PeminjamanBarang } = require('../models/PeminjamanBarangModel'); // Model Sequelize
const { PengembalianBarang } = require('../models/PengembalianBarangModel');
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
        const { idsToUpdate } = req.body;

        if (!Array.isArray(idsToUpdate) || idsToUpdate.length === 0) {
            return res.status(400).json({ error: "Tidak ada ID yang dikirim." });
        }

        // 1. Ambil semua data peminjaman yang ingin dikembalikan
        const peminjamanData = await PeminjamanBarang.findAll({
            where: { id: { [Op.in]: idsToUpdate } }
        });

        // 2. Buat data baru di tabel pengembalian
        const pengembalianData = peminjamanData.map(item => ({
            nama_peminjam: item.nama_peminjam,
            nama_barang: item.nama_barang,
            no_hp: item.no_hp,
            email: item.email,
            jumlah_barang: item.jumlah_barang,
            status_pengembalian: 'Sudah Dikembalikan'
        }));

        await PengembalianBarang.bulkCreate(pengembalianData);

        // 3. Hapus data dari tabel peminjaman
        await PeminjamanBarang.destroy({
            where: { id: { [Op.in]: idsToUpdate } }
        });

        // 4. Respon sukses
        res.status(200).json({ message: "Barang berhasil dikembalikan dan dipindahkan ke riwayat pengembalian." });

    } catch (error) {
        console.error('Gagal mengupdate status peminjaman:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengupdate status peminjaman.' });
    }
};


// ==============================================================================
// CONTROLLER: riwayatPeminjaman
// Menampilkan halaman riwayat peminjaman lengkap
// ==============================================================================
const riwayatPeminjaman = async (req, res) => {
    try {
        const { search, kategori, lokasi, status } = req.query; // search, kategori, lokasi, status

        const whereConditions = {}; // Initialize search conditions

        // If there's a search term, add conditions for `nama_peminjam`, `nama_barang`, and `status_pengembalian`
        if (search) {
            whereConditions[Op.or] = [
                { nama_peminjam: { [Op.like]: `%${search}%` } },
                { nama_barang: { [Op.like]: `%${search}%` } },
                { status_pengembalian: { [Op.like]: `%${search}%` } }
            ];
        }

        // If there's a specific `kategori`, filter by that field
        if (kategori && kategori !== '') {
            whereConditions.kategori_barang = kategori;
        }

        // If there's a specific `lokasi`, filter by that field
        if (lokasi && lokasi !== '') {
            whereConditions.lokasi = lokasi;
        }

        // If there's a specific `status`, filter by that field
        if (status && status !== '') {
            whereConditions.status_pengembalian = status;
        }

        // Fetch data based on the constructed `whereConditions`
        const peminjaman = await PeminjamanBarang.findAll({
            where: whereConditions,
            order: [['id', 'DESC']] // Order by the latest records
        });

        // Render the view with the filtered data
        res.render('RiwayatPeminjaman', {
            title: 'Riwayat Peminjaman',
            peminjaman: peminjaman,
            search: search || '', // Send the search query back to the view
            kategori: kategori || '',
            lokasi: lokasi || '',
            status: status || ''
        });

    } catch (error) {
        console.error('Error fetching Riwayat Peminjaman:', error);
        res.status(500).send('Error loading Riwayat Peminjaman.');
    }
};

// ==============================================================================
// CONTROLLER: getDetailPeminjaman
// Menampilkan detail peminjaman berdasarkan ID
// ==============================================================================

const getDetailPeminjaman = async (req, res) => {
    try {
        const { items } = req.query;  // Ambil ID barang dari query string
        const itemIds = items ? items.split(',') : [];  // Mengonversi string ke array ID

        // Ambil data barang berdasarkan ID yang dipilih
        const asetDetail = await Aset.findAll({
            where: {
                id: itemIds
            }
        });

        // Kirimkan data ke view DetailPeminjamanBarang.ejs
        res.render('DetailPeminjamanBarang', {
            title: 'Detail Peminjaman Barang',
            asetDetail: asetDetail  // Kirim data barang yang dipilih ke view
        });
    } catch (error) {
        console.error('Gagal mengambil data detail peminjaman:', error);
        res.status(500).send('Terjadi kesalahan saat memuat detail peminjaman.');
    }
};


module.exports = {
    getAllPeminjaman,
    tambahPeminjaman,
    hapusPeminjaman,
    updateStatusPeminjaman,
    riwayatPeminjaman,
    getDetailPeminjaman
};
