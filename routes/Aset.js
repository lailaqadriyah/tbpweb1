var express = require('express');
var router = express.Router();
const { getAllAset, getAsetForUpdate, updateAset } = require('../controllers/AsetController');

router.get('/aset', getAllAset); // RUTE UTAMA UNTUK MENAMPILKAN DAFTAR ASET DENGAN DATA DARI DATABASE
router.get('/updatebarang/:id', getAsetForUpdate); // RUTE UNTUK MENAMPILKAN FORM UPDATE BARANG
router.post('/updatebarang/:id', updateAset); // <-- Tambahkan ini


module.exports = router;  

 