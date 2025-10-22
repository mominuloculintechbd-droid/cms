const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CommentAttachment = sequelize.define('CommentAttachment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Comments',
      key: 'id'
    },
    onDelete: 'CASCADE',
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
}, {
  tableName: 'comment_attachments',
  timestamps: true,
  updatedAt: false,
});

module.exports = CommentAttachment;
