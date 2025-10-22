const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TelegramNotificationSetting = sequelize.define('TelegramNotificationSetting', {
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'ComplaintCategories',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  notificationTiming: {
    type: DataTypes.ENUM('open', 'close', 'both'),
    defaultValue: 'both',
    allowNull: false,
  },
  autoClose: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  autoCloseReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = TelegramNotificationSetting;
