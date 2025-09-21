const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LastBillDate = sequelize.define('LastBillDate', {
  CUSTOMER_NUM: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  LAST_BILL_DATE: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = LastBillDate;