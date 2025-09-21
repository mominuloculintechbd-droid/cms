const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Open',
  },
  priority: {
    type: DataTypes.STRING,
    defaultValue: 'Medium',
  },
  category: {
    type: DataTypes.STRING,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  assigneeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reporterId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING, // Bug, Task, Story, etc.
    allowNull: true,
  },
  severity: {
    type: DataTypes.STRING, // Critical, High, Medium, Low
    allowNull: true,
  },
  resolution: {
    type: DataTypes.STRING, // Unresolved, Fixed, Won't Fix, Duplicate
    allowNull: true,
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
});

module.exports = Ticket;
