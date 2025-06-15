var express = require('express');
var router = express.Router();

router.get('/laporan', function(req, res, next) {
  res.render('Laporan', { title: 'Laporan' });
});

router.get('/exportpengembalian', function(req, res, next) {
  res.render('ExportPengembalian', { title: 'Export Pengembalian' });
});

module.exports = router;