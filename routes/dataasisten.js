const express = require('express');
const router = express.Router();
const AddAslab = require('./AddAslab'); 
const aslabController = require('../controllers/Aslabcontrol');

router.get('/data', aslabController.viewAsisten);

router.get('/update/:id', aslabController.updateForm);

router.post('/update/:id', AddAslab.upload.single('foto'), aslabController.updateAsisten);

router.post('/delete/:id', aslabController.deleteAsisten);

module.exports = router;
