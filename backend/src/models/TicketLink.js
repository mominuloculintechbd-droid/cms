const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketLink = sequelize.define('TicketLink', {
  sourceTicketId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  targetTicketId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  relation: {
    type: DataTypes.ENUM('relates', 'blocks', 'is blocked by', 'duplicates', 'is duplicated by', 'parent', 'child'),
    allowNull: false,
    defaultValue: 'relates'
  }
});

module.exports = TicketLink;


