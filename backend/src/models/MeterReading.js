const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MeterReading = sequelize.define('MeterReading', {
  meter_no: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value_kwh: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  reading_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  indexes: [
    {
      fields: ['meter_no'],
    },
  ],
});

module.exports = MeterReading;
