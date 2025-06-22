const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const aslabController = require('../controllers/Aslabcontrol');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'public/uploads/asisten';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });

router.get('/tambah', aslabController.formTambahAslab);
router.post('/tambah', upload.single('foto'), aslabController.simpanAslab);

router.get('/data', aslabController.viewAsisten);
router.get('/update/:nomor_asisten', aslabController.updateForm);
router.post('/update/:nomor_asisten', upload.single('foto'), aslabController.updateAslab);
router.post('/delete/:nomor_asisten', aslabController.deleteAsisten);

router.get('/check-nomor-asisten', aslabController.checkNomorAsisten);
router.get('/check-nim', aslabController.checkNIM);

module.exports = router; 