const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MdmRead = sequelize.define('MdmRead', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  CUSTOMER_ID: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  METER_NO: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  MSRMT_DTTM: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  DATE_TYPE: {
    type: DataTypes.STRING,
  },
  READING_TYPE: {
    type: DataTypes.STRING,
  },
  READING_VAL: {
    type: DataTypes.FLOAT,
  },
  REMARKS: {
    type: DataTypes.STRING,
  },
  LAST_BILL_DT: {
    type: DataTypes.DATE,
  },
});

module.exports = MdmRead;
