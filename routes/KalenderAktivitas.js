const express = require('express');
const router = express.Router();
const kalenderController = require('../controllers/KalenderController');

router.get('/', kalenderController.getKalenderAktivitas);

router.get('/api/events', kalenderController.getEventsApi);

router.post('/', kalenderController.tambahEvent);

router.put('/:id', kalenderController.updateEvent);

router.delete('/:id', kalenderController.deleteEvent);

module.exports = router; 