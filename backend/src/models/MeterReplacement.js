const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MeterReplacement = sequelize.define('MeterReplacement', {
  customerId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  oldMeterNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  replaceMeterNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  installDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  replaceDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  lastBillDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  oldMeterLastReads: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

module.exports = MeterReplacement;
