const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sprint = sequelize.define('Sprint', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  goal: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Future', 'Active', 'Closed'),
    defaultValue: 'Future',
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  completedPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

module.exports = Sprint;
