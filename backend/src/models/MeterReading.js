const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MeterReading = sequelize.define('MeterReading', {
  meter_no: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value_kwh: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  TOTAL_ENERGY: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  TOD1_ENERGY: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  TOD2_ENERGY: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  reading_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  is_estimated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  estimation_method: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  estimated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  indexes: [
    {
      fields: ['meter_no'],
    },
    {
      fields: ['is_estimated'],
    },
  ],
});

module.exports = MeterReading;
