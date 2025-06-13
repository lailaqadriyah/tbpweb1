var express = require('express');
var router = express.Router();

router.get('/Aset', function(req, res, next) {
  res.render('aset', { title: 'Aset' });
});

module.exports = router;  

 