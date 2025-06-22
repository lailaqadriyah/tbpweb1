const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const Asisten = sequelize.define('Asisten', {
  nama: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nomor_asisten: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  nim: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telepon: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  jabatan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  jenis_kelamin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  domisili: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  kode_ruangan: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'ruangan',
      key: 'kode_ruangan'
    }
  },
  foto: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'asisten', 
  timestamps: false, 
});

module.exports = { Asisten };