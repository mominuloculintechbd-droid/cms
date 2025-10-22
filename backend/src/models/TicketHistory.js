const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketHistory = sequelize.define('TicketHistory', {
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Tickets',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING, // 'created', 'updated', 'commented', 'status_changed', 'assigned', etc.
    allowNull: false,
  },
  field: {
    type: DataTypes.STRING, // Field that was changed
    allowNull: true,
  },
  oldValue: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  newValue: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT, // Human-readable description of the change
    allowNull: true,
  },
}, {
  timestamps: true,
  updatedAt: false,
});

module.exports = TicketHistory;
