
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ComplaintCategory = sequelize.define('ComplaintCategory', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = ComplaintCategory;
