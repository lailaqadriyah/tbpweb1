var express = require('express');
const { getAddRuanganPage } = require('../controllers/RuanganController');
var router = express.Router();

router.get('/ruangan', function(req, res, next) {
  res.render('Ruangan', { title: 'Ruangan' });
});

router.get('/addruangan', getAddRuanganPage);

module.exports = router;