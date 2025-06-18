const { Asisten } = require('../models/Asistenmodel');

// Fungsi untuk menampilkan form tambah asisten
exports.formTambahAslab = (req, res) => {
  res.render('aslab/tambah');  // Pastikan ada file 'tambah.ejs' di views/aslab/
};

// Fungsi untuk menyimpan data asisten
exports.simpanAslab = async (req, res) => {
  try {
    const { nama, nomor_asisten, nim, telepon, jabatan, jenis_kelamin, domisili } = req.body;

    // Foto, jika ada, akan disimpan terpisah (pastikan Anda sudah mengonfigurasi multer)
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
    // Mendapatkan query parameters jika ada
    const { search, kategori, lokasi } = req.query;

    // Ambil data asisten dari database
    const asistenList = await Asisten.findAll();

    // Kirim data ke view, termasuk search, kategori, lokasi, dan asistenList
    res.render('aslab/DataAsisten', { 
      asistenList,
      search: search || '',   // Jika search tidak ada, kirimkan string kosong
      kategori: kategori || '',
      lokasi: lokasi || ''
    });
  } catch (err) {
    console.error(err);
    res.send('Gagal mengambil data');
  }
};
