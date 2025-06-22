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

module.exports.upload = upload;
module.exports = router;
