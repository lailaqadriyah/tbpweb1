const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const Asisten = sequelize.define('Asisten', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nomor_asisten: {
    type: DataTypes.STRING,
    allowNull: false,
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
  foto: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'asisten', 
  timestamps: false, 
});

module.exports = { Asisten };