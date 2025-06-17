var express = require('express');
var router = express.Router();
const { getAllAset, getAsetForUpdate, updateAset, getAsetDetail, addAset } = require('../controllers/AsetController');

router.get('/addaset', function(req, res, next) {
  res.render('AddBarang', { title: 'Tambah Barang' });
});

router.get('/aset/detail/:id', getAsetDetail); 

router.get('/aset', getAllAset); // RUTE UTAMA UNTUK MENAMPILKAN DAFTAR ASET DENGAN DATA DARI DATABASE
// Ubah rute GET ini:
router.get('/aset/update/:id', getAsetForUpdate); // RUTE UNTUK MENAMPILKAN FORM UPDATE BARANG

// Ubah rute POST ini agar konsisten dengan form:
router.post('/aset/update/:id', updateAset); // Rute POST untuk memproses update barang


router.get('/aset/detail/:id', getAsetDetail);
router.get('/aset/add', addAset);


module.exports = router;  

 