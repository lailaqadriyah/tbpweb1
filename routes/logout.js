const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.log('Error saat logout:', err);
      }
      res.redirect('/login'); // pastikan route /login juga ada
    });
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
