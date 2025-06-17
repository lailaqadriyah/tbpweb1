var express = require('express');
const { getAddRuanganPage, getRuanganForUpdate, getRuanganDetail } = require('../controllers/RuanganController');
var router = express.Router();

router.get('/ruangan', function(req, res, next) {
  res.render('Ruangan', { title: 'Ruangan' });
});

router.get('/addruangan', getAddRuanganPage);
router.get('/updateruangan/:id', getRuanganForUpdate);
router.get('/detailruangan/:id', getRuanganDetail);

module.exports = router;