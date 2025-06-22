const { Aset } = require('./AsetModel');
const { Ruangan } = require('./RuanganModel');

Aset.belongsTo(Ruangan, {
    foreignKey: 'kode_ruangan',
    as: 'ruangan' // An item belongs to one room
});

Ruangan.hasMany(Aset, {
    foreignKey: 'kode_ruangan',
    as: 'aset' // A room can have many items
});

module.exports = { 
    Aset, 
    Ruangan };