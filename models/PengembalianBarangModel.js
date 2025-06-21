const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PengembalianBarang = sequelize.define('Pengembalian Barang',{
    kode_barang: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
    },
    nama_peminjam: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    nama_barang: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    no_hp: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    status_pengembalian: {
        type: DataTypes.ENUM('Sudah Dikembalikan', 'Belum Dikembalikan'),
        allowNull: false
    },
    jumlah_barang: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tanggal_pinjam: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tanggal_kembali: {
    type: DataTypes.DATE,
    allowNull: true // TANGGAL KEMBALI can be null if the item hasn't been returned yet
  },
  kondisi: {
      type: DataTypes.ENUM("Baik", "Rusak"),
      allowNull: false,
    },
},{
    tableName: 'pengembalian_barang', // Nama tabel di database
    timestamps: false // Nonaktifkan timestamps jika tidak diperlukan
})

module.exports = { PengembalianBarang };