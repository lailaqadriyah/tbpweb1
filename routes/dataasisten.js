const express = require('express');
const router = express.Router();
const aslabController = require('../controllers/Aslabcontrol');

// Route untuk menampilkan halaman data asisten
router.get('/aslab/data', aslabController.viewAsisten);

module.exports = router;
