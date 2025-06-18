const RiwayatAktivitas = require('../models/RiwayatAktivitas'); // ✅ Bukan destrukturisasi
const { Op } = require('sequelize');

// Menampilkan halaman riwayat aktivitas
exports.getRiwayatAktivitas = async (req, res) => {
  try {
    const aktivitas = await RiwayatAktivitas.findAll({
      order: [['waktu', 'DESC']]
    });

    res.render('riwayatAktivitas', {
      title: 'Riwayat Aktivitas',
      aktivitas
    });
  } catch (error) {
    console.error('Gagal mengambil riwayat aktivitas:', error);
    res.status(500).send('Terjadi kesalahan saat mengambil data aktivitas.');
  }
};