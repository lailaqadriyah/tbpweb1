var express = require("express");
var router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  getAllAset,
  getAsetForUpdate,
  updateAset,
  getAsetDetail,
  addAset,
  tampilFormPengajuan,
  prosesPengajuan,
  exportPDF,
  deleteAset,
  getDetailTotal,
  getAddAsetPage, 
} = require("../controllers/AsetController"); 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/aset");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.get("/addaset", getAddAsetPage); 

router.get("/aset/detail/:kode_barang", getAsetDetail); 

router.get("/aset", getAllAset); 
// Ubah rute GET ini:
router.get("/aset/update/:kode_barang", getAsetForUpdate);

router.post("/aset/update/:kode_barang", upload.single("gambar_barang"), updateAset);

router.get("/aset/add", getAddAsetPage); 
router.post("/aset/tambah", upload.single("gambar_barang"), addAset);

router.get("/aset/ajukan", tampilFormPengajuan); 
router.post("/aset/ajukan", prosesPengajuan); 

router.get("/aset/export-pdf", exportPDF); 

router.delete("/aset/:kode_barang", deleteAset);

router.get("/detail-total", getDetailTotal);

module.exports = router;