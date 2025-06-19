const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

//  Konfigurasi multer langsung
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/ruangan');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const {
  getAllRuangan,
  getAddRuanganPage,
  addRuangan,
  getRuanganForUpdate,
  updateRuangan,
  deleteRuangan,
  getRuanganDetail
} = require('../controllers/RuanganController');

//  Route
router.get('/ruangan', getAllRuangan);
router.get('/addruangan', getAddRuanganPage);
router.post('/ruangan/tambah', upload.single('gambar'), addRuangan);
router.get('/ruangan/edit/:id', getRuanganForUpdate);
router.post('/ruangan/edit/:id', upload.single('gambar'), updateRuangan);
router.get('/ruangan/detail/:id', getRuanganDetail);
router.post('/ruangan/delete/:id', deleteRuangan); // SUDAH ADA


module.exports = router;