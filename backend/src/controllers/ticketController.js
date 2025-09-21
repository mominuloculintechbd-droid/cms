const { Ticket, Notification, TicketLink, User, Team, TeamProject, UserTeam } = require('../models');
const { Op } = require('sequelize');

exports.getAllTickets = async (req, res) => {
  try {
    const where = {};
    if (req.query.projectId) where.projectId = req.query.projectId;
    if (req.query.status) where.status = req.query.status;
    if (req.query.assigneeId) where.assigneeId = req.query.assigneeId;
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
    const tickets = await Ticket.findAll({ where });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Error getting tickets', error });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const { title, description, priority, category, assigneeId, projectId, type, severity, dueDate, parentId, teamId } = req.body;
    const userId = req.user.id;
    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    const sanitized = {
      title,
      description,
      priority,
      category,
      userId,
      reporterId: userId,
      assigneeId: assigneeId || null,
      projectId: projectId || null,
      type: type || null,
      severity: severity || null,
      dueDate: parsedDueDate,
      parentId: parentId || null,
      teamId: teamId || null,
    };
    const ticket = await Ticket.create(sanitized);

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
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error getting ticket', error });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const { title, description, status, priority, category, assigneeId, projectId, type, severity, dueDate, resolution } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    ticket.title = title;
    ticket.description = description;
    ticket.status = status;
    ticket.priority = priority;
    ticket.category = category;
    ticket.assigneeId = assigneeId;
    ticket.projectId = projectId;
    ticket.type = type;
    ticket.severity = severity;
    ticket.dueDate = dueDate;
    ticket.resolution = resolution;
    await ticket.save();

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
