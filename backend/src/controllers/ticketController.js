const { Ticket, Notification, TicketLink, User, Team, TeamProject, UserTeam, Sprint, TicketHistory, TicketAttachment, Comment } = require('../models');
const { Op } = require('sequelize');

exports.getAllTickets = async (req, res) => {
  try {
    const where = {};
    if (req.query.projectId) where.projectId = req.query.projectId;
    if (req.query.status) where.status = req.query.status;
    if (req.query.assigneeId) where.assigneeId = req.query.assigneeId;
    if (req.query.sprintId) where.sprintId = req.query.sprintId;
    if (req.query.type) where.type = req.query.type;
    if (req.query.priority) where.priority = req.query.priority;
    if (req.query.isFlagged !== undefined) where.isFlagged = req.query.isFlagged === 'true';
    if (req.query.isArchived !== undefined) where.isArchived = req.query.isArchived === 'true';

    // Scope by role
    if (req.user.role === 'Agent') {
      where.assigneeId = req.user.id;
    } else if (req.user.role === 'Manager') {
      // tickets in manager's teams or assigned to manager
      const managerTeams = await UserTeam.findAll({ where: { userId: req.user.id } });
      const teamIds = managerTeams.map(t => t.teamId);
      if (teamIds.length > 0) {
        where.teamId = { [Op.in]: teamIds };
      } else {
        // If no teams, return empty
        return res.status(200).json([]);
      }
    }

    const tickets = await Ticket.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'email', 'fullName'] },
        { model: User, as: 'reporter', attributes: ['id', 'email', 'fullName'] },
        { model: Sprint, as: 'sprint', attributes: ['id', 'name', 'status'] },
        { model: Ticket, as: 'parent', attributes: ['id', 'title'] },
        { model: Ticket, as: 'epic', attributes: ['id', 'title'] },
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Error getting tickets', error });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const {
      title, description, priority, category, assigneeId, projectId, type, severity,
      dueDate, parentId, teamId, sprintId, epicId, startDate, storyPoints,
      originalEstimate, labels, components, affectedVersions, fixVersions, environment
    } = req.body;

    const userId = req.user.id;
    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    const parsedStartDate = startDate ? new Date(startDate) : null;

    const sanitized = {
      title,
      description,
      priority: priority || 'Medium',
      category,
      userId,
      reporterId: userId,
      assigneeId: assigneeId || null,
      projectId: projectId || null,
      type: type || 'Task',
      severity: severity || null,
      dueDate: parsedDueDate,
      startDate: parsedStartDate,
      parentId: parentId || null,
      teamId: teamId || null,
      sprintId: sprintId || null,
      epicId: epicId || null,
      storyPoints: storyPoints || null,
      originalEstimate: originalEstimate || null,
      remainingEstimate: originalEstimate || null,
      labels: labels || [],
      components: components || [],
      affectedVersions: affectedVersions || [],
      fixVersions: fixVersions || [],
      environment: environment || null,
      watchers: [userId], // Add creator as watcher
    };

    const ticket = await Ticket.create(sanitized);

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        ticketId: ticket.id,
        fileName: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        userId: userId,
      }));
      await TicketAttachment.bulkCreate(attachments);
    }

    // Create history entry
    await TicketHistory.create({
      ticketId: ticket.id,
      userId: userId,
      action: 'created',
      description: `Ticket created by ${req.user.email || 'User'}`,
    });

    // Persist and emit a notification to Managers and Agents
    const notif = await Notification.create({
      title: 'New Ticket Created',
      message: `Ticket #${ticket.id} "${ticket.title}" was created.`,
      type: 'ticket_created',
      recipientRole: 'All',
      ticketId: ticket.id
    });
    req.io.emit('notification', { id: notif.id, title: notif.title, message: notif.message, type: notif.type, ticket: ticket });

    res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Error creating ticket', error });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'email', 'fullName'] },
        { model: User, as: 'reporter', attributes: ['id', 'email', 'fullName'] },
        { model: Sprint, as: 'sprint' },
        { model: Ticket, as: 'parent', attributes: ['id', 'title', 'type'] },
        { model: Ticket, as: 'epic', attributes: ['id', 'title'] },
        { model: Ticket, as: 'subtasks', attributes: ['id', 'title', 'status', 'type'] },
        { model: TicketHistory, as: 'history', include: [{ model: User, attributes: ['id', 'email', 'fullName'] }], order: [['createdAt', 'DESC']] },
        { model: TicketAttachment, as: 'attachments', include: [{ model: User, attributes: ['id', 'email', 'fullName'] }] },
        { model: Comment, include: [{ model: User, attributes: ['id', 'email', 'fullName'] }] },
      ]
    });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Get linked tickets
    const links = await TicketLink.findAll({
      where: {
        [Op.or]: [
          { sourceTicketId: req.params.id },
          { targetTicketId: req.params.id }
        ]
      },
      include: [
        { model: Ticket, as: 'source', attributes: ['id', 'title', 'status'] },
        { model: Ticket, as: 'target', attributes: ['id', 'title', 'status'] }
      ]
    });

    res.status(200).json({ ...ticket.toJSON(), links });
  } catch (error) {
    console.error('Error getting ticket:', error);
    res.status(500).json({ message: 'Error getting ticket', error });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldValues = { ...ticket.dataValues };
    const {
      title, description, status, priority, category, assigneeId, projectId, type, severity,
      dueDate, startDate, resolution, resolutionComment, sprintId, epicId, storyPoints,
      originalEstimate, remainingEstimate, timeSpent, labels, components, affectedVersions,
      fixVersions, environment, isFlagged, isArchived
    } = req.body;

    // Track changes for history
    const changes = [];
    const fieldsToUpdate = {
      title, description, status, priority, category, assigneeId, projectId, type, severity,
      dueDate, startDate, resolution, resolutionComment, sprintId, epicId, storyPoints,
      originalEstimate, remainingEstimate, timeSpent, labels, components, affectedVersions,
      fixVersions, environment, isFlagged, isArchived
    };

    for (const [field, newValue] of Object.entries(fieldsToUpdate)) {
      if (newValue !== undefined && JSON.stringify(oldValues[field]) !== JSON.stringify(newValue)) {
        changes.push({
          field,
          oldValue: JSON.stringify(oldValues[field]),
          newValue: JSON.stringify(newValue)
        });
        ticket[field] = newValue;
      }
    }

    // Auto-set resolvedDate when status changes to Done or Closed
    if (status && (status === 'Done' || status === 'Closed') && !oldValues.resolvedDate) {
      ticket.resolvedDate = new Date();
    }

    await ticket.save();

    // Create history entries for each change
    for (const change of changes) {
      await TicketHistory.create({
        ticketId: ticket.id,
        userId: req.user.id,
        action: 'updated',
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        description: `${change.field} changed from ${change.oldValue} to ${change.newValue}`,
      });
    }

    const notif = await Notification.create({
      title: 'Ticket Updated',
      message: `Ticket #${ticket.id} "${ticket.title}" was updated.`,
      type: 'ticket_updated',
      recipientRole: 'All',
      ticketId: ticket.id
    });
    req.io.emit('notification', { id: notif.id, title: notif.title, message: notif.message, type: notif.type, ticket: ticket });

    res.status(200).json({ message: 'Ticket updated successfully', ticket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Error updating ticket', error });
  }
};

exports.assignTicket = async (req, res) => {
  try {
    const { assigneeId } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    const user = assigneeId ? await User.findByPk(assigneeId) : null;
    if (assigneeId && !user) return res.status(404).json({ message: 'Assignee not found' });
    ticket.assigneeId = assigneeId || null;
    await ticket.save();
    res.status(200).json({ message: 'Assignee updated', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning ticket', error });
  }
};

exports.linkTickets = async (req, res) => {
  try {
    const { targetTicketId, relation } = req.body;
    const source = await Ticket.findByPk(req.params.id);
    const target = await Ticket.findByPk(targetTicketId);
    if (!source || !target) return res.status(404).json({ message: 'Ticket not found' });
    const link = await TicketLink.create({ sourceTicketId: source.id, targetTicketId: target.id, relation: relation || 'relates' });
    res.status(201).json({ message: 'Tickets linked', link });
  } catch (error) {
    res.status(500).json({ message: 'Error linking tickets', error });
  }
};

exports.unlinkTickets = async (req, res) => {
  try {
    const { targetTicketId } = req.body;
    const deleted = await TicketLink.destroy({ where: { sourceTicketId: req.params.id, targetTicketId } });
    res.status(200).json({ message: 'Tickets unlinked', deleted });
  } catch (error) {
    res.status(500).json({ message: 'Error unlinking tickets', error });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    await ticket.destroy();
    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting ticket', error });
  }
};

exports.getTicketCount = async (req, res) => {
  try {
    const count = await Ticket.count();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error getting ticket count', error });
  }
};

// Add watcher to ticket
exports.addWatcher = async (req, res) => {
  try {
    const { userId } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const watchers = ticket.watchers || [];
    if (!watchers.includes(userId)) {
      watchers.push(userId);
      ticket.watchers = watchers;
      await ticket.save();
    }

    res.status(200).json({ message: 'Watcher added', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error adding watcher', error });
  }
};

// Remove watcher from ticket
exports.removeWatcher = async (req, res) => {
  try {
    const { userId } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const watchers = ticket.watchers || [];
    ticket.watchers = watchers.filter(id => id !== userId);
    await ticket.save();

    res.status(200).json({ message: 'Watcher removed', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error removing watcher', error });
  }
};

// Log time spent on ticket
exports.logTime = async (req, res) => {
  try {
    const { timeSpent } = req.body; // in hours
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.timeSpent = (ticket.timeSpent || 0) + timeSpent;
    if (ticket.remainingEstimate && ticket.remainingEstimate > 0) {
      ticket.remainingEstimate = Math.max(0, ticket.remainingEstimate - timeSpent);
    }
    await ticket.save();

    await TicketHistory.create({
      ticketId: ticket.id,
      userId: req.user.id,
      action: 'time_logged',
      description: `${timeSpent} hours logged`,
    });

    res.status(200).json({ message: 'Time logged', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error logging time', error });
  }
};

// Get ticket history
exports.getTicketHistory = async (req, res) => {
  try {
    const history = await TicketHistory.findAll({
      where: { ticketId: req.params.id },
      include: [{ model: User, attributes: ['id', 'email', 'fullName'] }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error getting history', error });
  }
};

// Toggle ticket flag
exports.toggleFlag = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.isFlagged = !ticket.isFlagged;
    await ticket.save();

    await TicketHistory.create({
      ticketId: ticket.id,
      userId: req.user.id,
      action: ticket.isFlagged ? 'flagged' : 'unflagged',
      description: `Ticket ${ticket.isFlagged ? 'flagged' : 'unflagged'}`,
    });

    res.status(200).json({ message: 'Flag toggled', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling flag', error });
  }
};

// Archive ticket
exports.archiveTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.isArchived = true;
    await ticket.save();

    await TicketHistory.create({
      ticketId: ticket.id,
      userId: req.user.id,
      action: 'archived',
      description: 'Ticket archived',
    });

    res.status(200).json({ message: 'Ticket archived', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error archiving ticket', error });
  }
};
