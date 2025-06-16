const db = require('../config/db');

const insertAsisten = (data, callback) => {
  const sql = `INSERT INTO asisten 
    (nama, nomor_asisten, nim, telepon, jabatan, jenis_kelamin, domisili, foto)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [
    data.nama,
    data.nomor_asisten,
    data.nim,
    data.telepon,
    data.jabatan,
    data.jenis_kelamin,
    data.domisili,
    data.foto
  ], callback);
};

module.exports = { insertAsisten };
