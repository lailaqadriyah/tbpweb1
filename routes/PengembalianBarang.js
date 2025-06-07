var express = require('express');
var router = express.Router();

router.get('/PengembalianBarang', function(req, res, next) {
  res.render('pengembalian', { title: 'Pengembalian Barang' });
});

module.exports = router;