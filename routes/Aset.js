var express = require('express');
var router = express.Router();
const { getAllAset } = require('../controllers/AsetController');

router.get('/aset', getAllAset); // RUTE UTAMA UNTUK MENAMPILKAN DAFTAR ASET DENGAN DATA DARI DATABASE

module.exports = router;  

 