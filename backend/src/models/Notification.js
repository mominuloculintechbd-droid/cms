const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recipientUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  recipientRole: {
    type: DataTypes.ENUM('Super Admin', 'Admin', 'Manager', 'Agent', 'User', 'All'),
    allowNull: true,
  },
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
});

module.exports = Notification;


