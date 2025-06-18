var express = require('express');
var router = express.Router();

router.get('/laporan', function(req, res, next) {
  res.render('Laporan', { title: 'Laporan' });
});

router.get('/exportpengembalian', function(req, res, next) {
  res.render('ExportPengembalian', { title: 'Export Pengembalian' });
});

router.get('/exportbarangrusak', function(req, res, next) {
  res.render('ExportBarangRusak', { title: 'Export Barang Rusak' });
});

module.exports = router;