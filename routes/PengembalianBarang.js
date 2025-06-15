var express = require('express');
var router = express.Router();

router.get('/pengembalian', function(req, res, next) {
  res.render('PengembalianBarang', { title: 'Pengembalian Barang' });
});

module.exports = router;