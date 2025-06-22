const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  start: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'event', 
  timestamps: false,
});

module.exports = Event; 