const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Pastikan koneksi DB sudah benar

const RiwayatAktivitas = sequelize.define('RiwayatAktivitas', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  pengguna: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  waktu: {
    type: DataTypes.DATE,
    allowNull: false
  },
  tipe: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
}, {
  tableName: 'aktivitas_log',
  timestamps: false
});

module.exports = RiwayatAktivitas;