const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const ComplaintCategory = require('./ComplaintCategory');

const Complaint = sequelize.define('Complaint', {
  customerId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  meterNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issueDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Open', 'In Progress', 'Close'),
    defaultValue: 'Open',
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium',
    allowNull: false,
  },
  customerInfo: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  agentId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users', // 'Users' is the table name
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  complaintCategoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'ComplaintCategories', // 'ComplaintCategories' is the table name
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
});

Complaint.belongsTo(User, { as: 'agent', foreignKey: 'agentId' });
Complaint.belongsTo(ComplaintCategory, { foreignKey: 'complaintCategoryId' });

module.exports = Complaint;