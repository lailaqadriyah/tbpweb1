const express = require('express');
const router = express.Router();
const kalenderController = require('../controllers/KalenderController');

// Route untuk menampilkan halaman kalender
router.get('/', kalenderController.getKalenderAktivitas);

// Route BARU untuk API data event
router.get('/api/events', kalenderController.getEventsApi);

// Rute untuk menyimpan event dari pop-up
router.post('/', kalenderController.tambahEvent);

// Rute untuk mengupdate event
router.put('/:id', kalenderController.updateEvent);

// Rute untuk menghapus event
router.delete('/:id', kalenderController.deleteEvent);

module.exports = router; 