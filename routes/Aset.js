var express = require("express");
var router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  getAllAset,
  getAsetForUpdate,
  updateAset,
  getAsetDetail,
  addAset,
  tampilFormPengajuan,
  prosesPengajuan,
  exportPDF,
  deleteAset,
  getDetailTotal,
  getAddAsetPage, // <--- PASTIKAN INI DIIMPOR DARI CONTROLLER!
} = require("../controllers/AsetController"); // <--- Pastikan path ini benar

// Konfigurasi multer langsung
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/aset");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Rute untuk menampilkan form tambah aset
// PERBAIKI BARIS INI: Panggil fungsi controller yang sudah mengambil data ruangan
router.get("/addaset", getAddAsetPage); // <--- UBAH DARI anonymous function ke getAddAsetPage

router.get("/aset/detail/:id", getAsetDetail); // Perhatikan ada rute detail yang duplikat di bawah

router.get("/aset", getAllAset); // RUTE UTAMA UNTUK MENAMPILKAN DAFTAR ASET DENGAN DATA DARI DATABASE
// Ubah rute GET ini:
router.get("/aset/update/:id", getAsetForUpdate); // RUTE UNTUK MENAMPILKAN FORM UPDATE BARANG

router.post("/aset/update/:id", upload.single("gambar_barang"), updateAset);

// router.get("/aset/detail/:id", getAsetDetail); // <--- KEMUNGKINAN DUPLIKAT, HAPUS SALAH SATU
router.get("/aset/add", getAddAsetPage); // <--- JIKA ANDA INGIN RUTE INI JUGA, PASTIKAN MEMANGGIL getAddAsetPage
router.post("/aset/tambah", upload.single("gambar_barang"), addAset);

router.get("/aset/ajukan", tampilFormPengajuan); // tampilkan form
router.post("/aset/ajukan", prosesPengajuan); // proses form dan tampilkan surat

// Tambahkan rute baru untuk ekspor PDF
router.get("/aset/export-pdf", exportPDF); // Menambahkan rute ekspor PDF

router.delete("/aset/:id", deleteAset);

// Rute untuk DetailTotal
router.get("/detail-total", getDetailTotal);

module.exports = router;