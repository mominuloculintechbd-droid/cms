const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  // Basic Information
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  // Status and Workflow
  status: {
    type: DataTypes.ENUM('Backlog', 'To Do', 'In Progress', 'In Review', 'Testing', 'Done', 'Closed'),
    defaultValue: 'Backlog',
  },
  priority: {
    type: DataTypes.ENUM('Lowest', 'Low', 'Medium', 'High', 'Highest'),
    defaultValue: 'Medium',
  },

  // Classification
  category: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.ENUM('Epic', 'Story', 'Task', 'Bug', 'Subtask', 'Improvement', 'New Feature'),
    defaultValue: 'Task',
  },
  severity: {
    type: DataTypes.ENUM('Blocker', 'Critical', 'Major', 'Minor', 'Trivial'),
    allowNull: true,
  },

  // People
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

  // Organization
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  sprintId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  epicId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  // Dates
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  resolvedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // Resolution
  resolution: {
    type: DataTypes.ENUM('Unresolved', 'Fixed', 'Won\'t Fix', 'Duplicate', 'Cannot Reproduce', 'Done'),
    defaultValue: 'Unresolved',
  },
  resolutionComment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Hierarchy
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  // Estimation and Tracking
  storyPoints: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  originalEstimate: {
    type: DataTypes.INTEGER, // in hours
    allowNull: true,
  },
  remainingEstimate: {
    type: DataTypes.INTEGER, // in hours
    allowNull: true,
  },
  timeSpent: {
    type: DataTypes.INTEGER, // in hours
    allowNull: true,
  },

  // Additional Fields
  labels: {
    type: DataTypes.JSON, // Array of labels
    defaultValue: [],
  },
  components: {
    type: DataTypes.JSON, // Array of component names
    defaultValue: [],
  },
  affectedVersions: {
    type: DataTypes.JSON, // Array of version strings
    defaultValue: [],
  },
  fixVersions: {
    type: DataTypes.JSON, // Array of version strings
    defaultValue: [],
  },

  // Environment and Details
  environment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Watchers
  watchers: {
    type: DataTypes.JSON, // Array of user IDs
    defaultValue: [],
  },

  // Flags
  isFlagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Ticket;
