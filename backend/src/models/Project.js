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
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
  hooks: {
    beforeValidate: (project) => {
      // Auto-generate key from name if not provided
      if (!project.key && project.name) {
        project.key = project.name
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, '')
          .substring(0, 10);

        // Add timestamp to ensure uniqueness
        if (project.key.length < 3) {
          project.key = `PROJ${Date.now().toString().slice(-6)}`;
        }
      }
    },
  },
});

module.exports = Project;
