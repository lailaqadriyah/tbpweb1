var express = require('express');
var router = express.Router();

router.get('/pengembalian', function(req, res, next) {
  res.render('PengembalianBarang', { title: 'Pengembalian Barang' });
});

router.get('/notifpengembalian', function(req, res, next) {
  res.render('NotifikasiPengembalian', { title: 'Notifikasi Pengembalian' });
});
module.exports = router;