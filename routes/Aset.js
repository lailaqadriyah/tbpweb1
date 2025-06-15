var express = require('express');
var router = express.Router();
const { getAllAset, getAsetForUpdate, updateAset } = require('../controllers/AsetController');

router.get('/aset', getAllAset); // RUTE UTAMA UNTUK MENAMPILKAN DAFTAR ASET DENGAN DATA DARI DATABASE
// Ubah rute GET ini:
router.get('/aset/update/:id', getAsetForUpdate); // RUTE UNTUK MENAMPILKAN FORM UPDATE BARANG

// Ubah rute POST ini agar konsisten dengan form:
router.post('/aset/update/:id', updateAset); // Rute POST untuk memproses update barang


module.exports = router;  

 