const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserTeam = sequelize.define('UserTeam', {
  role: {
    type: DataTypes.ENUM('Manager', 'Agent'),
    allowNull: false,
    defaultValue: 'Agent'
  }
});

module.exports = UserTeam;


