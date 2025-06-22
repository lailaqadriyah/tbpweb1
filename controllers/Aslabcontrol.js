// controllers/Aslabcontrol.js

const { Asisten, Ruangan } = require('../models/Relation');
const { Op } = require("sequelize"); // Import operator Sequelize
const path = require('path');
const fs = require('fs');

// Fungsi untuk menampilkan form tambah asisten
exports.formTambahAslab = async (req, res) => {
  try {
    // Ambil data ruangan untuk dropdown
    const ruanganList = await Ruangan.findAll({
      attributes: ['kode_ruangan', 'nama_ruangan'],
      order: [['nama_ruangan', 'ASC']]
    });

    res.render('aslab/tambah', { 
      ruanganList: ruanganList || []
    });
  } catch (err) {
    console.error('Error fetching ruangan data:', err);
    res.render('aslab/tambah', { 
      ruanganList: []
    });
  }
};

// Fungsi untuk menyimpan data asisten
exports.simpanAslab = async (req, res) => {
  try {
    const { nama, nomor_asisten, nim, telepon, jabatan, jenis_kelamin, domisili, kode_ruangan } = req.body;
    const foto = req.file ? req.file.path : null;

    // Validasi: Cek apakah nomor_asisten sudah ada
    const existingAsisten = await Asisten.findOne({
      where: { nomor_asisten: nomor_asisten }
    });

    if (existingAsisten) {
      return res.status(400).json({
        success: false,
        message: `Nomor asisten "${nomor_asisten}" sudah terdaftar. Silakan gunakan nomor yang berbeda.`
      });
    }

    // Validasi: Cek apakah NIM sudah ada
    const existingNIM = await Asisten.findOne({
      where: { nim: nim }
    });

    if (existingNIM) {
      return res.status(400).json({
        success: false,
        message: `NIM "${nim}" sudah terdaftar. Silakan gunakan NIM yang berbeda.`
      });
    }

    // Simpan data asisten ke database
    const newAsisten = await Asisten.create({
      nama, nomor_asisten, nim, telepon, jabatan, jenis_kelamin, domisili, kode_ruangan, foto
    });

    // Setelah berhasil, redirect ke halaman daftar asisten
    res.redirect('/aslab/data');
  } catch (err) {
    console.error('Error saat menyimpan asisten:', err);
    
    // Handle Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors[0].path;
      const value = err.errors[0].value;
      
      if (field === 'nomor_asisten') {
        return res.status(400).json({
          success: false,
          message: `Nomor asisten "${value}" sudah terdaftar. Silakan gunakan nomor yang berbeda.`
        });
      } else if (field === 'nim') {
        return res.status(400).json({
          success: false,
          message: `NIM "${value}" sudah terdaftar. Silakan gunakan NIM yang berbeda.`
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan data asisten. Silakan coba lagi.'
    });
  }
};

// Fungsi untuk menampilkan daftar asisten
exports.viewAsisten = async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search) {
      whereClause = {
        [Op.or]: [
          { nama: { [Op.like]: `%${search}%` } },
          { nim: { [Op.like]: `%${search}%` } },
          { nomor_asisten: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    // DEBUG: Tampilkan klausa where yang digunakan
    console.log('Klausa Pencarian yang Digunakan:', JSON.stringify(whereClause, null, 2));

    // Ambil data asisten dari database dengan filter pencarian dan include ruangan
    const asistenList = await Asisten.findAll({ 
      where: whereClause,
      include: [{
        model: Ruangan,
        as: 'ruangan',
        attributes: ['nama_ruangan', 'kode_ruangan'],
        required: false // LEFT JOIN
      }]
    });

    // DEBUG: Tampilkan data yang didapat dari database ke konsol
    console.log('Data Asisten yang Ditemukan:', JSON.stringify(asistenList, null, 2));

    res.render('aslab/DataAsisten', { 
      asistenList,
      search: search || ''
    });
  } catch (err) {
    console.error(err);
    res.send('Gagal mengambil data');
  }
};

// Fungsi untuk menampilkan form update asisten berdasarkan ID
exports.updateForm = async (req, res) => {
  try {
    const { nomor_asisten } = req.params; // Ambil nomor_asisten dari URL
    const asisten = await Asisten.findOne({ where: { nomor_asisten } }); // Cari data asisten berdasarkan nomor_asisten

    if (!asisten) {
      return res.send('Asisten tidak ditemukan');
    }

    // Ambil data ruangan untuk dropdown
    const ruanganList = await Ruangan.findAll({
      attributes: ['kode_ruangan', 'nama_ruangan'],
      order: [['nama_ruangan', 'ASC']]
    });

    // Kirim data asisten ke form update
    res.render('aslab/updateasisten', { 
      asisten,
      ruanganList: ruanganList || []
    });
  } catch (err) {
    console.error(err);
    res.send('Gagal mengambil data asisten');
  }
};

// Fungsi untuk update data asisten
exports.updateAslab = async (req, res) => {
  try {
    const { nomor_asisten } = req.params;
    const { nama, nim, telepon, jabatan, jenis_kelamin, domisili, kode_ruangan } = req.body;
    const foto = req.file ? req.file.path : null;

    // Cari asisten yang akan diupdate
    const asisten = await Asisten.findOne({ where: { nomor_asisten } });
    if (!asisten) {
      return res.status(404).json({
        success: false,
        message: 'Asisten tidak ditemukan'
      });
    }

    // Validasi: Cek apakah nomor_asisten sudah ada (kecuali untuk asisten yang sedang diupdate)
    if (nomor_asisten !== asisten.nomor_asisten) {
      const existingAsisten = await Asisten.findOne({
        where: { 
          nomor_asisten: nomor_asisten,
          id: { [Op.ne]: id } // Exclude current asisten
        }
      });

      if (existingAsisten) {
        return res.status(400).json({
          success: false,
          message: `Nomor asisten "${nomor_asisten}" sudah terdaftar. Silakan gunakan nomor yang berbeda.`
        });
      }
    }

    // Validasi: Cek apakah NIM sudah ada (kecuali untuk asisten yang sedang diupdate)
    if (nim !== asisten.nim) {
      const existingNIM = await Asisten.findOne({
        where: { 
          nim: nim,
          id: { [Op.ne]: id } // Exclude current asisten
        }
      });

      if (existingNIM) {
        return res.status(400).json({
          success: false,
          message: `NIM "${nim}" sudah terdaftar. Silakan gunakan NIM yang berbeda.`
        });
      }
    }

    // Update data asisten
    const updateData = {
      nama, nomor_asisten, nim, telepon, jabatan, jenis_kelamin, domisili, kode_ruangan
    };

    // Hanya update foto jika ada file baru
    if (foto) {
      updateData.foto = foto;
    }

    await asisten.update(updateData);

    // Redirect ke halaman daftar asisten
    res.redirect('/aslab/data');
  } catch (err) {
    console.error('Error saat update asisten:', err);
    
    // Handle Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors[0].path;
      const value = err.errors[0].value;
      
      if (field === 'nomor_asisten') {
        return res.status(400).json({
          success: false,
          message: `Nomor asisten "${value}" sudah terdaftar. Silakan gunakan nomor yang berbeda.`
        });
      } else if (field === 'nim') {
        return res.status(400).json({
          success: false,
          message: `NIM "${value}" sudah terdaftar. Silakan gunakan NIM yang berbeda.`
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Gagal update data asisten. Silakan coba lagi.'
    });
  }
};

// Fungsi untuk menghapus data asisten
exports.deleteAsisten = async (req, res) => {
  try {
    const { nomor_asisten } = req.params;

    const asisten = await Asisten.findOne({ where: { nomor_asisten } });
    if (!asisten) {
      return res.send('Asisten tidak ditemukan');
    }

    // Hapus data asisten dari database
    await asisten.destroy();

    // Redirect ke halaman data asisten setelah berhasil
    res.redirect('/aslab/data');
  } catch (err) {
    console.error(err);
    res.send('Gagal menghapus data asisten');
  }
};

// Fungsi untuk validasi nomor asisten (real-time)
exports.checkNomorAsisten = async (req, res) => {
  try {
    const { nomor_asisten, exclude_id } = req.query;
    
    if (!nomor_asisten) {
      return res.json({ exists: false });
    }

    const whereClause = { nomor_asisten: nomor_asisten };
    
    // Jika ada exclude_id, tambahkan kondisi untuk mengecualikan record tersebut
    if (exclude_id) {
      whereClause.id = { [require('sequelize').Op.ne]: exclude_id };
    }

    const existingAsisten = await Asisten.findOne({
      where: whereClause
    });

    res.json({ exists: !!existingAsisten });
  } catch (err) {
    console.error('Error checking nomor asisten:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat validasi' });
  }
};

// Fungsi untuk validasi NIM (real-time)
exports.checkNIM = async (req, res) => {
  try {
    const { nim, exclude_id } = req.query;
    
    if (!nim) {
      return res.json({ exists: false });
    }

    const whereClause = { nim: nim };
    
    // Jika ada exclude_id, tambahkan kondisi untuk mengecualikan record tersebut
    if (exclude_id) {
      whereClause.id = { [require('sequelize').Op.ne]: exclude_id };
    }

    const existingAsisten = await Asisten.findOne({
      where: whereClause
    });

    res.json({ exists: !!existingAsisten });
  } catch (err) {
    console.error('Error checking NIM:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat validasi' });
  }
};
