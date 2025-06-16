const { insertAsisten } = require('../models/AsistenModel');

// Tampilkan form tambah data
exports.formTambahAslab = (req, res) => {
  res.render('aslab/tambah'); // EJS file di views/aslab/tambah.ejs
};

// Simpan data dari form ke DB (tanpa foto)
exports.simpanAslab = (req, res) => {
  const data = {
    nama: req.body.nama,
    nomor_asisten: req.body.nomor_asisten,
    nim: req.body.nim,
    telepon: req.body.telepon,
    jabatan: req.body.jabatan,
    jenis_kelamin: req.body.jenis_kelamin,
    domisili: req.body.domisili,
    foto: null // karena belum upload gambar
  };

  insertAsisten(data, (err, result) => {
    if (err) {
      console.error(err);
      return res.send('Gagal menyimpan data');
    }
    res.redirect('/aslab/tambah'); // Kembali ke form setelah submit
  });
};

// ✅ Fungsi ini dipindahkan ke luar agar bisa diekspor dengan benar
exports.viewAsisten = (req, res) => {
  res.render('Aslab/DataAsisten');
 // Harus sesuai nama file EJS
};


