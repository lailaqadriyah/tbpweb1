const { Ruangan } = require('../models/RuanganModel');
const { Op } = require('sequelize');

// ==============================================================================
// GET: Menampilkan semua ruangan
// ==============================================================================
const getAllRuangan = async (req, res) => {
    try {
        const { search } = req.query;

        const whereConditions = {};

        if (search) {
            whereConditions[Op.or] = [
                { nama_ruangan: { [Op.like]: `%${search}%` } },
                { kode_ruangan: { [Op.like]: `%${search}%` } },
            ];
        }

        const semuaRuangan = await Ruangan.findAll({
            where: whereConditions,
            order: [['id', 'ASC']]
        });

        res.render("Ruangan", {
            title: "Daftar Ruangan",
            ruangan: semuaRuangan,
            search: search || ''
        });

    } catch (error) {
        console.error('Error saat mengambil data ruangan:', error);
        res.status(500).send('Gagal memuat daftar ruangan.');
    }
};

// ==============================================================================
// GET: Halaman tambah ruangan
// ==============================================================================
const getAddRuanganPage = (req, res) => {
    try {
        res.render("TambahRuangan", {
            title: "Tambah Ruangan Baru"
        });
    } catch (error) {
        console.error('Error saat memuat halaman tambah ruangan:', error);
        res.status(500).send('Gagal memuat halaman tambah ruangan.');
    }
};

// ==============================================================================
// POST: Menyimpan ruangan baru
// ==============================================================================
const addRuangan = async (req, res) => {
  try {
    const { nama, kode, deskripsi } = req.body;
    const foto = req.file ? `/uploads/ruangan/${req.file.filename}` : null;

    if (!nama || !kode) {
      return res.status(400).redirect('/addruangan?status=error&message=Nama dan kode wajib diisi.');
    }

    await Ruangan.create({
      nama_ruangan: nama,
      kode_ruangan: kode,
      deskripsi: deskripsi,
      foto: foto
    });

    res.render("TambahRuangan", {
  title: "Tambah Ruangan Baru",
  success: true
});

  } catch (error) {
    console.error('Error saat menambahkan ruangan:', error);
    res.status(500).redirect('/addruangan?status=error&message=Gagal menambahkan ruangan.');
  }
};

// ==============================================================================
// GET: Halaman edit ruangan
// ==============================================================================
const getRuanganForUpdate = async (req, res) => {
    try {
        const ruanganId = req.params.id;
        const ruangan = await Ruangan.findByPk(ruanganId);

        if (ruangan) {
            res.render("UpdateRuangan", {
                title: "Edit Ruangan",
                ruangan
            });
        } else {
            res.status(404).send("Ruangan tidak ditemukan.");
        }
    } catch (error) {
        console.error("Error saat mengambil ruangan untuk update:", error);
        res.status(500).send("Gagal memuat data ruangan.");
    }
};

// ==============================================================================
// POST: Update data ruangan
// ==============================================================================
const updateRuangan = async (req, res) => {
    try {
        const ruanganId = req.params.id;
        const { nama_ruangan, kode_ruangan, deskripsi } = req.body;
        const ruangan = await Ruangan.findByPk(ruanganId);

        if (!ruangan) {
            return res.status(404).redirect('/ruangan?status=error&message=Ruangan tidak ditemukan.');
        }

        const foto = req.file ? `/uploads/ruangan/${req.file.filename}` : ruangan.foto;

        await ruangan.update({
            nama_ruangan,
            kode_ruangan,
            deskripsi,
            foto
        });

        res.redirect('/ruangan/edit/' + ruanganId + '?status=success');
    } catch (error) {
        console.error("Error update ruangan:", error);
        res.status(500).redirect('/ruangan?status=error&message=Gagal update ruangan.');
    }
};

// ==============================================================================
// DELETE: Hapus ruangan
// ==============================================================================
const deleteRuangan = async (req, res) => {
  try {
    const ruanganId = req.params.id;

    const deleted = await Ruangan.destroy({ where: { id: ruanganId } });

    if (deleted) {
      res.status(200).send("Ruangan dihapus.");
    } else {
      res.status(404).send("Tidak ditemukan.");
    }
  } catch (error) {
    res.status(500).send("Gagal menghapus.");
  }
};

// ==============================================================================
// GET: Detail ruangan
// ==============================================================================
const getRuanganDetail = async (req, res) => {
    try {
        const ruanganId = req.params.id;
        const ruangan = await Ruangan.findByPk(ruanganId);

        if (ruangan) {
            res.render("DetailRuangan", {
                title: "Detail Ruangan",
                ruangan
            });
        } else {
            res.status(404).render("404", { title: "Tidak Ditemukan", message: "Ruangan tidak ditemukan." });
        }
    } catch (error) {
        console.error("Error detail ruangan:", error);
        res.status(500).render("error", { title: "Server Error", message: "Terjadi kesalahan mengambil detail ruangan." });
    }
};

// ==============================================================================
// EXPORT
// ==============================================================================
module.exports = {
    getAllRuangan,
    getAddRuanganPage,
    addRuangan,
    getRuanganForUpdate,
    updateRuangan,
    deleteRuangan,
    getRuanganDetail
};