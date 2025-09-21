const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  NOCS_NAME: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  CUSTOMER_NUM: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  CUSTOMER_NAME: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  FATHER_NAME: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ADDRESS: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  MOBILE_NO: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  SANCTION_LOAD: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  METER_NO: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  PHASE: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  TARIFF: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  CONN_DATE: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  FEEDER_NO: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  FEEDER_NAME: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  indexes: [
    { unique: true, fields: ['CUSTOMER_NUM'] },
    { fields: ['METER_NO'] },
  ]
});

module.exports = Customer;