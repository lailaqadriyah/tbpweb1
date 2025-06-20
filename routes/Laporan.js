var express = require('express');
var router = express.Router();
const { tampilBarangRusak, exportBarangRusak } = require('../controllers/Laporan');

router.get('/laporan', function(req, res, next) {
  res.render('Laporan', { title: 'Laporan' });
});

router.get('/exportpengembalian', function(req, res, next) {
  res.render('ExportPengembalian', { title: 'Export Pengembalian' });
});

router.get('/barang-rusak', tampilBarangRusak);
router.post('/laporan/export', exportBarangRusak);

module.exports = router;