// controllers/PeminjamanBarangController.js

const { PeminjamanBarang } = require('../models/PeminjamanBarangModel'); // Model Sequelize
const { PengembalianBarang } = require('../models/PengembalianBarangModel');
const { Aset } = require('../models/AsetModel');
const sequelize = require('../config/db'); // Impor instance Sequelize
const { Op } = require('sequelize'); // Diperlukan untuk operasi 'in' atau pencarian nanti
const multer = require('multer');
const path = require('path');

// Konfigurasi Multer untuk upload gambar
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/peminjaman/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ==============================================================================
// CONTROLLER: showTambahPeminjamanForm
// Menampilkan form tambah peminjaman, dengan data aset jika ada
// ==============================================================================
const showTambahPeminjamanForm = async (req, res) => {
    try {
        const { items } = req.query;
        let selectedAset = [];

        if (items) {
            const kodeBarangList = items.split(',');
            selectedAset = await Aset.findAll({
                where: {
                    kode_barang: {
                        [Op.in]: kodeBarangList
                    }
                }
            });
        }

        res.render('FormPeminjamanBarang', {
            title: 'Tambah Peminjaman',
            selectedAset: selectedAset
        });

    } catch (error) {
        console.error('Gagal menampilkan form tambah peminjaman:', error);
        res.status(500).send('Terjadi kesalahan saat memuat form.');
    }
};

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
            tanggal_pinjam,
            tanggal_kembali,
            no_hp,
            email
        } = req.body;
        
        const kode_barang_list = req.body.kode_barang;
        const nama_barang_list = req.body.nama_barang;

        // Validasi dasar
        if (!nama_peminjam || !tanggal_pinjam || !tanggal_kembali) {
            return res.status(400).send('Data peminjam tidak lengkap.');
        }

        let gambar = null;
        if (req.file) {
            gambar = req.file.filename;
        }

        const recordsToCreate = [];
        const commonData = {
            nama_peminjam,
            no_hp,
            email,
            tanggal_pinjam,
            tanggal_kembali,
            gambar,
            jumlah_barang: 1,
            status_pengembalian: 'Belum Dikembalikan'
        };

        // Handle items selected from the list
        if (kode_barang_list) {
            const kodes = Array.isArray(kode_barang_list) ? kode_barang_list : [kode_barang_list];
            const names = Array.isArray(nama_barang_list) ? nama_barang_list : [nama_barang_list];
            
            kodes.forEach((kode, index) => {
                recordsToCreate.push({
                    ...commonData,
                    nama_barang: names[index],
                    kode_barang: kode
                });
            });
        }

        if (recordsToCreate.length === 0) {
            return res.status(400).send('Tidak ada barang yang dipinjam.');
        }

        await PeminjamanBarang.bulkCreate(recordsToCreate);

        res.redirect('/peminjaman');

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
    const { idsToUpdate } = req.body;

    if (!Array.isArray(idsToUpdate) || idsToUpdate.length === 0) {
        return res.status(400).json({ error: "Tidak ada ID yang dikirim." });
    }
    
    const t = await sequelize.transaction();

    try {
        // 1. Ambil semua data peminjaman yang ingin dikembalikan
        const peminjamanData = await PeminjamanBarang.findAll({
            where: { id: { [Op.in]: idsToUpdate } },
            transaction: t
        });

        // 2. Buat data baru di tabel pengembalian dengan kode_barang unik
        const pengembalianData = peminjamanData.map(item => ({
            kode_barang: `RET-${item.id}-${Date.now()}`, // Membuat kode unik sementara
            nama_peminjam: item.nama_peminjam,
            nama_barang: item.nama_barang,
            no_hp: item.no_hp,
            email: item.email,
            jumlah_barang: item.jumlah_barang,
            status_pengembalian: 'Sudah Dikembalikan',
            tanggal_pinjam: item.tanggal_pinjam,
            tanggal_kembali: new Date(),
            kondisi: 'Baik' // Menambahkan kondisi default
        }));

        // 3. Simpan data baru ke tabel pengembalian
        await PengembalianBarang.bulkCreate(pengembalianData, { transaction: t });

        // 4. Hapus data dari tabel peminjaman
        await PeminjamanBarang.destroy({
            where: { id: { [Op.in]: idsToUpdate } },
            transaction: t
        });
        
        // Commit transaksi jika semua berhasil
        await t.commit();

        // 5. Respon sukses
        res.status(200).json({ message: "Barang berhasil dikembalikan dan dipindahkan ke riwayat pengembalian." });

    } catch (error) {
        // Rollback transaksi jika terjadi kesalahan
        await t.rollback();
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
        const { search } = req.query;

        // Ambil data dari kedua tabel
        const peminjamanAktif = await PeminjamanBarang.findAll({ raw: true });
        const peminjamanSelesai = await PengembalianBarang.findAll({ raw: true });

        // Gabungkan dan format data
        let riwayatGabungan = [
            ...peminjamanAktif.map(item => ({ ...item, status: item.status_pengembalian || 'Belum Dikembalikan' })),
            ...peminjamanSelesai.map(item => ({ ...item, status: item.status_pengembalian || 'Sudah Dikembalikan' }))
        ];

        // Urutkan berdasarkan ID secara menurun (menampilkan yang terbaru)
        riwayatGabungan.sort((a, b) => b.id - a.id);
        
        // Terapkan filter pencarian jika ada
        if (search) {
            riwayatGabungan = riwayatGabungan.filter(item =>
                (item.nama_peminjam && item.nama_peminjam.toLowerCase().includes(search.toLowerCase())) ||
                (item.nama_barang && item.nama_barang.toLowerCase().includes(search.toLowerCase())) ||
                (item.status && item.status.toLowerCase().includes(search.toLowerCase()))
            );
        }

        // Render view dengan data gabungan
        res.render('RiwayatPeminjaman', {
            title: 'Riwayat Peminjaman',
            peminjaman: riwayatGabungan, // Gunakan nama variabel yang sama
            search: search || ''
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

        let peminjamanDetail = [];
        if (itemIds.length > 0) {
            // Ambil data peminjaman berdasarkan ID yang dipilih
            peminjamanDetail = await PeminjamanBarang.findAll({
                where: {
                    id: itemIds
                }
            });
        }
        
        // Render view, bahkan jika tidak ada item yang ditemukan. 
        // View akan menampilkan pesan "Tidak ada data".
        res.render('DetailPeminjamanBarang', {
            title: 'Detail Peminjaman Barang',
            peminjaman: peminjamanDetail
        });

    } catch (error) {
        console.error('Gagal mengambil data detail peminjaman:', error);
        res.status(500).send('Terjadi kesalahan saat memuat detail peminjaman.');
    }
};

// ==============================================================================
// CONTROLLER: deletePeminjaman
// Menghapus beberapa data peminjaman berdasarkan ID yang dipilih
// ==============================================================================
const deletePeminjaman = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "Tidak ada ID yang dipilih untuk dihapus." });
        }

        await PeminjamanBarang.destroy({
            where: { id: { [Op.in]: ids } }
        });

        res.status(200).json({ message: "Data peminjaman yang dipilih berhasil dihapus." });

    } catch (error) {
        console.error('Gagal menghapus data peminjaman:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus data peminjaman.' });
    }
};

// ==============================================================================
// CONTROLLER: getDetailPeminjamanById
// Menampilkan halaman edit untuk satu item peminjaman berdasarkan ID
// ==============================================================================
const getDetailPeminjamanById = async (req, res) => {
    try {
        const { id } = req.params;
        const peminjaman = await PeminjamanBarang.findByPk(id);

        if (!peminjaman) {
            return res.status(404).send('Data peminjaman tidak ditemukan.');
        }

        res.render('UpdatePeminjaman', {
            title: 'Ubah Data Peminjaman',
            peminjaman: peminjaman
        });

    } catch (error) {
        console.error('Gagal mengambil data peminjaman untuk diubah:', error);
        res.status(500).send('Terjadi kesalahan saat memuat halaman edit.');
    }
};

// ==============================================================================
// CONTROLLER: updatePeminjamanById
// Mengupdate data peminjaman berdasarkan ID
// ==============================================================================
const updatePeminjamanById = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nama_peminjam,
            nama_barang,
            no_hp,
            email,
            jumlah_barang
        } = req.body;

        const peminjaman = await PeminjamanBarang.findByPk(id);
        if (!peminjaman) {
            return res.status(404).send('Data peminjaman tidak ditemukan untuk diperbarui.');
        }

        await peminjaman.update({
            nama_peminjam,
            nama_barang,
            no_hp,
            email,
            jumlah_barang
        });

        res.redirect('/peminjaman');

    } catch (error) {
        console.error('Gagal memperbarui data peminjaman:', error);
        res.status(500).send('Terjadi kesalahan saat memperbarui data peminjaman.');
    }
};

module.exports = {
    showTambahPeminjamanForm,
    getAllPeminjaman,
    tambahPeminjaman,
    hapusPeminjaman,
    updateStatusPeminjaman,
    riwayatPeminjaman,
    getDetailPeminjaman,
    deletePeminjaman,
    getDetailPeminjamanById,
    updatePeminjamanById,
    upload // Ekspor upload untuk digunakan di rute
};
