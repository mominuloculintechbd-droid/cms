const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Completed', 'On Hold', 'Cancelled'),
    defaultValue: 'Active',
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
}, {
  timestamps: true,
  tableName: 'Projects',
});

module.exports = Project;
