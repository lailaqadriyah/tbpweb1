const { Aset } = require('./AsetModel');
const { Ruangan } = require('./RuanganModel');
const { Asisten } = require('./Asistenmodel');

Asisten.belongsTo(Ruangan, {
  foreignKey: 'kode_ruangan',
  as: 'ruangan' 
});

Ruangan.hasMany(Asisten, {
  foreignKey: 'kode_ruangan',
  as: 'asisten'
});

Aset.belongsTo(Ruangan, {
    foreignKey: 'kode_ruangan',
    as: 'ruangan' 
});

Ruangan.hasMany(Aset, {
    foreignKey: 'kode_ruangan',
    as: 'aset'
});

module.exports = { 
    Aset, 
    Ruangan,
    Asisten
};