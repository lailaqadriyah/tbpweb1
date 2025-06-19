// controllers/Aslabcontrol.js

const { Asisten } = require('../models/Asistenmodel');

// Fungsi untuk menampilkan form tambah asisten
exports.formTambahAslab = (req, res) => {
  res.render('aslab/tambah');  // Pastikan ada file 'tambah.ejs' di views/aslab/
};

// Fungsi untuk menyimpan data asisten
exports.simpanAslab = async (req, res) => {
  try {
    const { nama, nomor_asisten, nim, telepon, jabatan, jenis_kelamin, domisili } = req.body;
    const foto = req.file ? req.file.path : null;

    // Simpan data asisten ke database
    await Asisten.create({
      nama, nomor_asisten, nim, telepon, jabatan, jenis_kelamin, domisili, foto
    });

    // Setelah berhasil, redirect ke halaman daftar asisten
    res.redirect('/aslab/data');
  } catch (err) {
    console.error(err);
    res.send('Gagal menyimpan data');
  }
};

// Fungsi untuk menampilkan daftar asisten
exports.viewAsisten = async (req, res) => {
  try {
    const { search, kategori, lokasi } = req.query;

    // Ambil data asisten dari database
    const asistenList = await Asisten.findAll();

    res.render('aslab/DataAsisten', { 
      asistenList,
      search: search || '',
      kategori: kategori || '',
      lokasi: lokasi || ''
    });
  } catch (err) {
    console.error(err);
    res.send('Gagal mengambil data');
  }
};

// Fungsi untuk menampilkan form update asisten berdasarkan ID
exports.updateForm = async (req, res) => {
  try {
    const { id } = req.params; // Ambil id dari URL
    const asisten = await Asisten.findByPk(id); // Cari data asisten berdasarkan ID

    if (!asisten) {
      return res.send('Asisten tidak ditemukan');
    }

    // Kirim data asisten ke form update
    res.render('aslab/updateasisten', { asisten });
  } catch (err) {
    console.error(err);
    res.send('Gagal mengambil data asisten');
  }
};

// Fungsi untuk memproses pembaruan data asisten
exports.updateAsisten = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nomor_asisten, nim, telepon, jabatan } = req.body;
    const foto = req.file ? req.file.path : null; // Jika ada foto baru

    const asisten = await Asisten.findByPk(id);
    if (!asisten) {
      return res.send('Asisten tidak ditemukan');
    }

    // Update data asisten
    await asisten.update({
      nama,
      nomor_asisten,
      nim,
      telepon,
      jabatan,
      foto: foto || asisten.foto, // Gunakan foto yang ada jika tidak ada yang baru
    });

    // Redirect ke halaman data asisten setelah berhasil
    res.redirect('/aslab/data');
  } catch (err) {
    console.error(err);
    res.send('Gagal mengupdate data asisten');
  }
};
