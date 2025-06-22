const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PeminjamanBarang = sequelize.define('PeminjamanBarang', {
    nama_peminjam: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    nama_barang: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    kode_barang: {
        type: DataTypes.STRING(20),
        allowNull: true // Atau false jika setiap peminjaman harus terkait dengan aset
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
    status_peminjaman: {
        type: DataTypes.STRING,
        defaultValue: 'Dipinjam'
    },
    jumlah_barang: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tanggal_pinjam: {
        type: DataTypes.DATE,
        allowNull: false
    },
    tanggal_kembali: {
        type: DataTypes.DATE,
        allowNull: false
    },
    gambar: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'peminjaman_barang', // Nama tabel di database
    timestamps: false // Nonaktifkan timestamps jika tidak diperlukan
});

module.exports = { PeminjamanBarang };
