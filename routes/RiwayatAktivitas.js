const express = require('express');
const router = express.Router();
const riwayatAktivitasController = require('../controllers/RiwayatAktivitasController');

// Route: localhost:3000/riwayat
router.get('/riwayataktivitas', riwayatAktivitasController.getRiwayatAktivitas);

module.exports = router;