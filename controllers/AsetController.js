// controllers/AsetController.js

const { Aset } = require('../models/AsetModel');
const { Ruangan } = require('../models/RuanganModel');
const sequelize = require('../config/db');
const { Op } = require('sequelize');
const pdf = require('html-pdf');

// CATATAN PENTING:
// Pastikan file 'Relation.js' Anda telah di-require/diinisialisasi di aplikasi utama Anda (misalnya app.js atau server.js)
// agar asosiasi (relasi) antar model Aset, Ruangan, dll. sudah terbentuk sebelum controller ini dijalankan.
// Contoh di app.js: require('./models/Relation'); // Atau sesuai path Anda

// ==============================================================================
// RUTE UTAMA UNTUK MENAMPILKAN DAFTAR ASET DENGAN DATA DARI DATABASE
// ==============================================================================
const getAllAset = async (req, res) => {
    try {
        const { search, kategori, lokasi } = req.query;
        const whereConditions = {};

        if (search) {
            whereConditions[Op.or] = [
                { nama_barang: { [Op.like]: `%${search}%` } },
                { kode_barang: { [Op.like]: `%${search}%` } },
                // Jika ingin mencari di lokasi berdasarkan nama ruangan,
                // perlu JOIN dengan tabel Ruangan dan mencari di Ruangan.nama_ruangan
            ];
        }

        const allAset = await Aset.findAll({
            where: whereConditions,
            order: [['id', 'ASC']],
            include: [{
                model: Ruangan,
                as: 'ruangan',
                attributes: ['nama_ruangan'],
                // Ini penting untuk JOIN yang benar saat primary key bukan 'id'
                // sourceKey: 'ruangan_kode', // sourceKey adalah kolom di model Aset yang berelasi
                // targetKey: 'kode_ruangan' // targetKey adalah kolom PK di model Ruangan yang direferensikan
            }]
        });

        res.render("Aset", {
            title: "Daftar Aset",
            aset: allAset,
            search: search || '',
            kategori: kategori || '',
            lokasi: lokasi || ''
        });

    } catch (error) {
        console.error('Error saat mengambil data aset:', error);
        res.status(500).send('Gagal memuat daftar aset.');
    }
};


const getAsetForUpdate = async (req, res) => {
    try {
        const asetId = req.params.id;
        const asetToUpdate = await Aset.findByPk(asetId);

        const ruanganList = await Ruangan.findAll({
            attributes: ['kode_ruangan', 'nama_ruangan'], // Mengambil kode_ruangan sebagai value
            order: [['nama_ruangan', 'ASC']]
        });

        if (asetToUpdate) {
            res.render("UpdateBarang", {
                title: "Update Barang",
                id: asetId,
                asset: asetToUpdate,
                ruangan: ruanganList
            });
        } else {
            res.status(404).send('Aset tidak ditemukan untuk diupdate.');
        }
    } catch (error) {
        console.error('Error saat mengambil data aset untuk update:', error);
        res.status(500).send('Gagal memuat form update aset. Silakan coba lagi.');
    }
};

// ==============================================================================
// CONTROLLER: updateAset
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
            ruangan_kode, // <-- Ganti ruangan_id menjadi ruangan_kode
            kategori_barang
        } = req.body;

        const asetToUpdate = await Aset.findByPk(asetId);

        if (!asetToUpdate) {
            return res.status(404).redirect('/aset?status=error&message=Aset tidak ditemukan untuk diupdate.');
        }

        let foto_barang = asetToUpdate.gambar_barang;
        if (req.file) {
            foto_barang = `/uploads/aset/${req.file.filename}`;
        }

        await asetToUpdate.update({
            kode_barang,
            nama_barang,
            kuantitas,
            tanggal_masuk,
            kondisi,
            ruangan_kode, // <-- Simpan ruangan_kode
            kategori_barang,
            gambar_barang: foto_barang
        });

        res.redirect('/aset?status=success&message=Barang berhasil diupdate!');

    } catch (error) {
        console.error('Error saat memperbarui aset:', error);
        res.status(500).redirect('/aset?status=error&message=Gagal memperbarui aset. Silakan coba lagi.');
    }
};

// ==============================================================================
// CONTROLLER: deleteAset
// ==============================================================================
const deleteAset = async (req, res) => {
    try {
        const asetId = req.params.id;

        const deletedRows = await Aset.destroy({
            where: { id: asetId }
        });

        if (deletedRows > 0) {
            res.status(200).json({ message: 'Aset berhasil dihapus.' });
        } else {
            res.status(404).json({ error: 'Aset tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error menghapus aset:', error);
        res.status(500).json({
            error: 'Gagal menghapus aset.',
            details: error.message
        });
    }
};

// ==============================================================================
// FUNGSI BARU: getAssetDetail - Menggunakan Sequelize
// ==============================================================================
const getAsetDetail = async (req, res) => {
    const asetId = req.params.id;

    try {
        const asset = await Aset.findByPk(asetId, {
            include: [{
                model: Ruangan,
                as: 'ruangan',
                attributes: ['nama_ruangan'],
                // sourceKey: 'ruangan_kode',
                // targetKey: 'kode_ruangan'
            }]
        });

        if (asset) {
            res.render('DetailBarang', {
                title: 'Detail Barang',
                asset: asset.toJSON()
            });
        } else {
            res.status(404).render('404', { title: 'Tidak Ditemukan', message: 'Barang tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error fetching asset detail:', error);
        res.status(500).render('error', { title: 'Error Server', message: 'Terjadi kesalahan saat mengambil detail barang.' });
    }
};

// ==============================================================================
// FUNGSI BARU: getAddAsetPage - Untuk menampilkan form tambah aset
// ==============================================================================
const getAddAsetPage = async (req, res) => {
    try {
        const ruanganList = await Ruangan.findAll({
            attributes: ['kode_ruangan', 'nama_ruangan'], // Mengambil kode_ruangan sebagai value
            order: [['nama_ruangan', 'ASC']]
        });

        res.render("AddBarang", {
            title: "Tambah Barang Baru",
            ruangan: ruanganList
        });
    } catch (error) {
        console.error('Error saat memuat halaman tambah aset:', error);
        res.status(500).send('Gagal memuat halaman tambah aset.');
    }
};

// ==============================================================================
// FUNGSI BARU: getDetailTotal - Menampilkan total per barang
// ==============================================================================
const getDetailTotal = async (req, res) => {
    try {
        const totalPerBarang = await Aset.findAll({
            attributes: [
                'nama_barang',
                [sequelize.fn('SUM', sequelize.col('kuantitas')), 'total_kuantitas'],
                [sequelize.literal(`SUM(CASE WHEN Aset.kondisi = 'Baik' THEN Aset.kuantitas ELSE 0 END)`), 'kondisi_baik'],
                [sequelize.literal(`SUM(CASE WHEN Aset.kondisi = 'Rusak' THEN Aset.kuantitas ELSE 0 END)`), 'kondisi_rusak'],
                [sequelize.literal(`SUM(CASE WHEN Aset.kondisi = 'Perawatan' THEN Aset.kuantitas ELSE 0 END)`), 'kondisi_perawatan']
            ],
            group: ['nama_barang'],
            order: [['nama_barang', 'ASC']]
        });

        res.render('DetailTotal', {
            title: 'Detail Total Per Barang',
            totalData: totalPerBarang
        });
    } catch (error) {
        console.error('Error saat mengambil data total per barang:', error);
        res.status(500).send('Gagal memuat data total per barang.');
    }
};


// ==============================================================================
// FUNGSI BARU: addAset - Untuk menambahkan aset baru ke database
// ==============================================================================
const addAset = async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    try {
        const {
            kode_barang,
            nama_barang,
            tanggal_masuk,
            kondisi,
            kode_ruangan, // This is the room NAME from the form
            kategori_barang
        } = req.body;

        // Validasi dasar
        if (!kode_barang || !nama_barang || !tanggal_masuk || !kondisi || !kategori_barang || !kode_ruangan) {
            return res.status(400).send('Data tidak lengkap. Semua field harus diisi.');
        }

        // Cek apakah ada file yang di-upload
        if (!req.file) {
            return res.status(400).send('Gambar barang harus di-upload.');
        }
        const gambar_barang = `/uploads/aset/${req.file.filename}`;
        
        const ruangan = await Ruangan.findOne({ where: { nama_ruangan: kode_ruangan } });

        // Buat aset baru di database
        const newAset = await Aset.create({
            kode_barang,
            nama_barang,
            kuantitas: 1, // Kuantitas di-hardcode menjadi 1
            tanggal_masuk,
            kondisi,
            lokasi: kode_ruangan, // Use the room name for 'lokasi'
            kode_ruangan: ruangan ? ruangan.kode_ruangan : null, // Save the code if found
            kategori_barang,
            gambar_barang
        });

        // Redirect ke halaman daftar aset setelah berhasil
        res.redirect('/aset');

    } catch (error) {
        console.error('Error saat menambahkan aset baru:', error);
        res.status(500).send('Terjadi kesalahan saat menyimpan aset baru.');
    }
};


// Tampilkan halaman form pengajuan barang baru
const tampilFormPengajuan = async (req, res) => {
    try {
        const ruangan = await Ruangan.findAll({ order: [['nama_ruangan', 'ASC']] });

        res.render('PengajuanBarangBaru', {
            title: 'Pengajuan Barang Baru',
            ruangan
        });
    } catch (error) {
        console.error('Gagal mengambil data ruangan:', error);
        res.status(500).send('Terjadi kesalahan saat memuat form pengajuan.');
    }
};

const prosesPengajuan = async (req, res) => { // <-- Ubah menjadi async jika Anda ingin fetch nama ruangan
    const {
        namaPengaju,
        jabatanPengaju,
        namaBarang,
        jumlahBarang,
        ruanganTujuan, // ini akan menjadi kode_ruangan
        spesifikasi,
        alasan
    } = req.body;

    const tanggal = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Ambil nama ruangan berdasarkan kode_ruangan jika ingin menampilkannya di SuratPengajuanBarang
    let namaRuangan = 'Tidak diketahui';
    try {
        const selectedRuangan = await Ruangan.findByPk(ruanganTujuan); // findByPk akan mencari berdasarkan PK (kode_ruangan)
        if (selectedRuangan) {
            namaRuangan = selectedRuangan.nama_ruangan;
        }
    } catch (fetchError) {
        console.error('Error fetching nama ruangan for pengajuan:', fetchError);
    }


    res.render('SuratPengajuanBarang', {
        namaPengaju,
        jabatanPengaju,
        namaBarang,
        jumlahBarang,
        ruanganTujuan: ruanganTujuan,
        namaRuangan: namaRuangan, // Mengirim nama ruangan yang sudah diambil
        spesifikasi,
        alasan,
        tanggal
    });
};

// ==============================================================================
// FUNGSI BARU: Export PDF Daftar Aset
// ==============================================================================
const exportPDF = async (req, res) => {
    try {
        const allAset = await Aset.findAll({
            order: [['id', 'ASC']],
            include: [{
                model: Ruangan,
                as: 'ruangan',
                attributes: ['nama_ruangan'],
                // sourceKey: 'ruangan_kode',
                // targetKey: 'kode_ruangan'
            }]
        });

        const htmlContent = `
            <html>
                <head>
                    <style>
                        body { font-family: 'Arial', sans-serif; margin: 20px; color: #333; }
                        h1 { text-align: center; font-size: 30px; color: #4CAF50; margin-bottom: 20px; }
                        p { font-size: 16px; line-height: 1.5; margin-bottom: 20px; }
                        .container { max-width: 1000px; margin: 0 auto; }
                        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        .table th, .table td { padding: 12px; text-align: left; border: 1px solid #ddd; }
                        .table th { background-color: #4CAF50; color: white; font-size: 18px; }
                        .table td { font-size: 14px; }
                        .table tr:nth-child(even) { background-color: #f2f2f2; }
                        .table tr:hover { background-color: #ddd; }
                        .highlight { background-color: #e3f2fd; }
                        .footer { margin-top: 30px; text-align: center; font-size: 14px; color: #777; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Daftar Aset Laboratorium</h1>
                        <p>
                            Berikut adalah daftar aset yang dimiliki oleh lab kami. Data ini mencakup informasi tentang barang, jumlah,
                            kategori, lokasi, tanggal masuk, dan kondisi setiap barang. Semua informasi ini penting untuk mengelola
                            inventaris dan memastikan kelancaran operasional laboratorium.
                        </p>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Kode Barang</th>
                                    <th>Nama</th>
                                    <th>Kuantitas</th>
                                    <th>Kategori</th>
                                    <th>Lokasi</th>
                                    <th>Tanggal Masuk</th>
                                    <th>Kondisi</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${allAset.map(aset => `
                                    <tr>
                                        <td>${aset.kode_barang}</td>
                                        <td>${aset.nama_barang}</td>
                                        <td>${aset.kuantitas}</td>
                                        <td>${aset.kategori_barang}</td>
                                        <td>${aset.ruangan ? aset.ruangan.nama_ruangan : 'N/A'}</td>
                                        <td>${new Date(aset.tanggal_masuk).toLocaleString()}</td>
                                        <td class="${aset.kondisi === 'Baik' ? 'highlight' : ''}">${aset.kondisi}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <p>
                            Informasi lebih lanjut dapat ditemukan di sistem manajemen aset kami. Semua aset ini terkelola dengan
                            baik dan terintegrasi dalam sistem inventaris untuk memudahkan pemantauan dan pemeliharaan.
                        </p>
                        <div class="footer">
                            <p>© 2025 Laboratorium Sistem Informasi - Semua Hak Dilindungi</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        const options = { format: 'A4' };
        pdf.create(htmlContent, options).toStream((err, stream) => {
            if (err) {
                return res.status(500).send('Gagal membuat PDF');
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="DaftarAset.pdf"');
            stream.pipe(res);
        });
    } catch (error) {
        console.error('Error saat mengekspor PDF:', error);
        res.status(500).send('Gagal mengekspor PDF');
    }
};

// Ekspor semua fungsi controller
module.exports = {
    getAllAset,
    getAsetForUpdate,
    updateAset,
    deleteAset,
    getAsetDetail,
    getAddAsetPage,
    addAset,
    exportPDF,
    tampilFormPengajuan,
    prosesPengajuan,
    getDetailTotal,
};