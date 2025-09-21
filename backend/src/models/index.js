const sequelize = require('../config/database');
const User = require('./User');
const Ticket = require('./Ticket');
const Notification = require('./Notification');
const Content = require('./Content');
const Project = require('./Project');
const TicketLink = require('./TicketLink');
const Team = require('./Team');
const UserTeam = require('./UserTeam');
const TeamProject = require('./TeamProject');
const MdmRead = require('./MdmRead');
const DailyBillingReport = require('./DailyBillingReport')(sequelize, require('sequelize').DataTypes);
const MeterReading = require('./MeterReading');
const Comment = require('./Comment');
const Customer = require('./Customer');
const LastBillDate = require('./LastBillDate');
const MeterReplacement = require('./MeterReplacement');
const BatchOperationalReport = require('./BatchOperationalReport')(sequelize, require('sequelize').DataTypes);


const models = {
  User,
  Ticket,
  Content,
  MeterReading,
  Comment,
  Customer,
  LastBillDate,
  MeterReplacement,
  Notification,
  Project,
  TicketLink,
  Team,
  UserTeam,
  TeamProject,
  MdmRead,
  DailyBillingReport,
  BatchOperationalReport
  
};

Comment.belongsTo(Ticket, { foreignKey: 'ticket_id', onDelete: 'CASCADE' });
Ticket.hasMany(Comment, { foreignKey: 'ticket_id' });

Comment.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Comment, { foreignKey: 'user_id' });

// Notification associations (optional)
Notification.belongsTo(User, { foreignKey: 'recipientUserId', as: 'recipientUser' });
Notification.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

// Ticket associations
Ticket.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });
Ticket.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });
Ticket.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Ticket.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Ticket.belongsTo(Ticket, { foreignKey: 'parentId', as: 'parent' });
Ticket.hasMany(Ticket, { foreignKey: 'parentId', as: 'subtasks' });

// TicketLink associations
TicketLink.belongsTo(Ticket, { foreignKey: 'sourceTicketId', as: 'source' });
TicketLink.belongsTo(Ticket, { foreignKey: 'targetTicketId', as: 'target' });

// Team relations
Team.belongsToMany(User, { through: UserTeam, foreignKey: 'teamId', otherKey: 'userId' });
User.belongsToMany(Team, { through: UserTeam, foreignKey: 'userId', otherKey: 'teamId' });
Team.belongsToMany(Project, { through: TeamProject, foreignKey: 'teamId', otherKey: 'projectId' });
Project.belongsToMany(Team, { through: TeamProject, foreignKey: 'projectId', otherKey: 'teamId' });

Object.values(models)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(models));

module.exports = {
  sequelize,
  ...models
};
