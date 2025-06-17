const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const Ruangan = sequelize.define('Ruangan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    kode_ruangan: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    nama_ruangan: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    deskripsi: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    foto: {
        type: DataTypes.STRING(255),
        allowNull: true
     },
}, {
    tableName: 'ruangan', 
    timestamps: false 
});

module.exports = { Ruangan };