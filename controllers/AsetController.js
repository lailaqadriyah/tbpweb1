const { Aset } = require('../models/AsetModel');
const { Op } = require('sequelize'); // Import operator Sequelize untuk kondisi pencarian

// ==============================================================================
// RUTE UTAMA UNTUK MENAMPILKAN DAFTAR ASET DENGAN DATA DARI DATABASE
// ==============================================================================
const getAllAset = async (req, res) => {
    try {
        // Ambil query parameters dari URL
        const { search, kategori, lokasi } = req.query; // Ini akan menerima dari name="search", name="kategori", name="lokasi"

        // Buat objek where condition untuk Sequelize
        const whereConditions = {};

        // Tambahkan kondisi pencarian jika 'search' ada
        if (search) {
            whereConditions[Op.or] = [
                { nama_barang: { [Op.like]: `%${search}%` } },
                { kode_barang: { [Op.like]: `%${search}%` } },
                // Tambahkan kolom lain yang ingin dicari
            ];
        }

        // Tambahkan kondisi filter kategori jika 'kategori' ada dan tidak kosong
        if (kategori && kategori !== '') {
            whereConditions.kategori_barang = kategori;
        }

        // Tambahkan kondisi filter lokasi jika 'lokasi' ada dan tidak kosong
        if (lokasi && lokasi !== '') {
            whereConditions.lokasi = lokasi;
        }

        const allAset = await Aset.findAll({
            where: whereConditions, // Terapkan kondisi pencarian dan filter
            order: [['id', 'ASC']]
        });

        res.render("Aset", {
            title: "Daftar Aset",
            aset: allAset,
            // Kirim kembali nilai search dan filter ke view agar bisa dipertahankan di input
            search: search || '',
            kategori: kategori || '', // Penting untuk hidden input
            lokasi: lokasi || ''      // Penting untuk hidden input
        });

    } catch (error) {
        console.error('Error saat mengambil data aset:', error);
        res.status(500).send('Gagal memuat daftar aset.');
    }
};


const getAsetForUpdate = async (req, res) => {
    try {
        const asetId = req.params.id; // Ambil ID aset dari parameter URL

        // Cari aset berdasarkan primary key (ID) di database
        const asetToUpdate = await Aset.findByPk(asetId);

        // Jika aset ditemukan
        if (asetToUpdate) {
            // Render tampilan 'Update Barang.ejs'
            // Kirim data aset
            res.render("UpdateBarang", {
                title: "Update Barang", // Judul halaman
                id: asetId, // Mengirim ID untuk digunakan di form EJS (misal untuk action form)
                asset: asetToUpdate // Mengirim data aset yang akan diupdate
            });
        } else {
            // Jika aset tidak ditemukan, kirim respons 404 Not Found
            res.status(404).send('Aset tidak ditemukan untuk diupdate.');
        }
    } catch (error) {
        // Tangani error yang terjadi saat mengambil data aset
        console.error('Error saat mengambil data aset untuk update:', error);
        res.status(500).send('Gagal memuat form update aset. Silakan coba lagi.');
    }
};

// ==============================================================================
// CONTROLLER: updateAset (Revisi untuk redirect)
// ==============================================================================
const updateAset = async (req, res) => {
    try {
        const asetId = req.params.id;
        const {
            kode_barang,
            nama_barang,
            kuantitas,
            tanggal_masuk,
            kondisi,
            lokasi,
            kategori_barang
        } = req.body;

        const asetToUpdate = await Aset.findByPk(asetId);

        if (!asetToUpdate) {
            // Jika aset tidak ditemukan, arahkan kembali dengan pesan error (opsional, bisa juga render halaman error)
            return res.status(404).redirect('/aset?status=error&message=Aset tidak ditemukan untuk diupdate.');
        }

        await asetToUpdate.update({
            kode_barang,
            nama_barang,
            kuantitas,
            tanggal_masuk,
            kondisi,
            lokasi,
            kategori_barang
        });

        // Arahkan kembali ke halaman daftar aset setelah sukses
        // Anda bisa menambahkan query param untuk pesan sukses jika mau
        res.redirect('/aset?status=success&message=Status berhasil diupdate!');

    } catch (error) {
        console.error('Error saat memperbarui aset:', error);
        // Arahkan kembali dengan pesan error
        res.status(500).redirect('/aset?status=error&message=Gagal memperbarui aset. Silakan coba lagi.');
    }
};

// ==============================================================================
// CONTROLLER: deleteAset (Revisi untuk API/AJAX dengan JSON response)
// ==============================================================================
const deleteAset = async (req, res) => {
    try {
        const asetId = req.params.id;

        const deletedRows = await Aset.destroy({
            where: { id: asetId }
        });

        if (deletedRows > 0) {
            // Kirim respons JSON sukses untuk AJAX (sesuai dengan SweetAlert2 fetch Anda)
            res.status(200).json({ message: 'Aset berhasil dihapus.' });
        } else {
            // Kirim respons JSON 404 untuk AJAX
            res.status(404).json({ error: 'Aset tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error menghapus aset:', error);
        // Kirim respons JSON 500 untuk AJAX
        res.status(500).json({
            error: 'Gagal menghapus aset.',
            details: error.message
        });
    }
};

// ==============================================================================
// FUNGSI BARU: getAssetDetail - Menggunakan Sequelize (konsisten)
// ==============================================================================
const getAsetDetail = async (req, res) => {
    const asetId = req.params.id; // Mengambil ID dari parameter URL

    try {
        // Menggunakan Sequelize findByPk (Find by Primary Key)
        const asset = await Aset.findByPk(asetId);

        if (asset) {
            // Jika aset ditemukan, render template EJS
            res.render('DetailBarang', { // Pastikan path ini benar (misal: views/pages/assetDetail.ejs)
                title: 'Detail Barang',
                asset: asset.toJSON()
            });
        } else {
            // Jika barang tidak ditemukan
            res.status(404).render('404', { title: 'Tidak Ditemukan', message: 'Barang tidak ditemukan.' }); // Asumsi ada view 404.ejs
        }
    } catch (error) {
        console.error('Error fetching asset detail:', error);
        // Mengirimkan halaman error atau pesan error
        res.status(500).render('error', { title: 'Error Server', message: 'Terjadi kesalahan saat mengambil detail barang.' }); // Asumsi ada view error.ejs
    }
};

// ==============================================================================
// FUNGSI BARU: getAddAsetPage - Untuk menampilkan form tambah aset
// ==============================================================================
const getAddAsetPage = (req, res) => {
    try {
        res.render("AddBarang", {
            title: "Tambah Barang Baru"
        });
    } catch (error) {
        console.error('Error saat memuat halaman tambah aset:', error);
        res.status(500).send('Gagal memuat halaman tambah aset.');
    }
};

// ==============================================================================
// FUNGSI BARU: addAset - Untuk menambahkan aset baru ke database
// ==============================================================================
const addAset = async (req, res) => {
    try {
        // Ambil data dari body permintaan POST
        const {
            kode_barang,
            nama_barang,
            kuantitas,
            tanggal_masuk,
            kondisi,
            lokasi,
            kategori_barang
        } = req.body;

        // Validasi sederhana (Anda bisa menambahkan validasi yang lebih kompleks)
        if (!kode_barang || !nama_barang || !kuantitas || !tanggal_masuk || !kondisi || !lokasi || !kategori_barang) {
            return res.status(400).redirect('/add-aset?status=error&message=Semua field harus diisi.');
        }

        // Buat entri aset baru di database menggunakan Sequelize
        await Aset.create({
            kode_barang,
            nama_barang,
            kuantitas,
            tanggal_masuk,
            kondisi,
            lokasi,
            kategori_barang
        });

        // Redirect ke halaman daftar aset dengan pesan sukses
        res.redirect('/aset?status=success&message=Aset berhasil ditambahkan!');

    } catch (error) {
        console.error('Error saat menambahkan aset baru:', error);
        // Redirect kembali ke halaman tambah aset dengan pesan error
        res.status(500).redirect('/add-aset?status=error&message=Gagal menambahkan aset. Pastikan kode barang unik atau coba lagi.');
    }
};

// Tampilkan halaman form pengajuan barang baru
const tampilFormPengajuan = (req, res) => {
    res.render('PengajuanBarangBaru', {
        title: 'Pengajuan Barang Baru'
    });
};

const prosesPengajuan = (req, res) => {
  const {
    namaPengaju,
    jabatanPengaju,
    namaBarang,
    jumlahBarang,
    ruanganTujuan,
    spesifikasi,
    alasan
  } = req.body;

  const tanggal = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  res.render('SuratPengajuanBarang', {
    namaPengaju,
    jabatanPengaju,
    namaBarang,
    jumlahBarang,
    ruanganTujuan,
    spesifikasi,
    alasan,
    tanggal
  });
};

// Ekspor semua fungsi controller
module.exports = {
    getAllAset,
    getAsetForUpdate,
    updateAset,
    deleteAset,
    getAsetDetail,
    getAddAsetPage, // Tambahkan ini
    addAset,       // Tambahkan ini
    tampilFormPengajuan,
    prosesPengajuan
};