const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Aset = sequelize.define(
  "Aset",
  {
    kode_barang: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    nama_barang: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    kuantitas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tanggal_masuk: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    kategori_barang: {
      type: DataTypes.ENUM(
        "Barang elektronik",
        "Perabotan",
        "Laporan TA",
        "Laporan KP",
        "Buku",
        "ATK"
      ),
      allowNull: false,
    },
    lokasi: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    kondisi: {
      type: DataTypes.ENUM("Baik", "Rusak"),
      allowNull: false,
    },
  },
  {
    tableName: "aset",
    timestamps: false,
  }
);

module.exports = { Aset };
