const { Sprint, Ticket, Project, Team } = require('../models');
const { Op } = require('sequelize');

// Get all sprints
exports.getAllSprints = async (req, res) => {
  try {
    const where = {};
    if (req.query.projectId) where.projectId = req.query.projectId;
    if (req.query.status) where.status = req.query.status;
    if (req.query.teamId) where.teamId = req.query.teamId;

    const sprints = await Sprint.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: Team, as: 'team', attributes: ['id', 'name'] },
        { model: Ticket, as: 'tickets', attributes: ['id', 'title', 'status', 'storyPoints'] }
      ],
      order: [['startDate', 'DESC']]
    });

    res.status(200).json(sprints);
  } catch (error) {
    console.error('Get sprints error:', error);
    res.status(500).json({ message: 'Error getting sprints', error });
  }
};

// Get sprint by ID
exports.getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project' },
        { model: Team, as: 'team' },
        { model: Ticket, as: 'tickets', include: [
          { model: require('../models').User, as: 'assignee', attributes: ['id', 'email', 'fullName'] }
        ]}
      ]
    });

    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    // Calculate sprint metrics
    const tickets = sprint.tickets || [];
    const completedTickets = tickets.filter(t => t.status === 'Done' || t.status === 'Closed');
    const completedPoints = completedTickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const totalPoints = tickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    const sprintData = {
      ...sprint.toJSON(),
      metrics: {
        totalTickets: tickets.length,
        completedTickets: completedTickets.length,
        totalPoints,
        completedPoints,
        completionPercentage: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0
      }
    };

    res.status(200).json(sprintData);
  } catch (error) {
    console.error('Error getting sprint:', error);
    res.status(500).json({ message: 'Error getting sprint', error });
  }
};

// Create sprint
exports.createSprint = async (req, res) => {
  try {
    const { name, goal, startDate, endDate, projectId, teamId } = req.body;

    if (!name || !projectId) {
      return res.status(400).json({ message: 'Name and projectId are required' });
    }

    const sprint = await Sprint.create({
      name,
      goal: goal || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      projectId,
      teamId: teamId || null,
      status: 'Future'
    });

    res.status(201).json({ message: 'Sprint created successfully', sprint });
  } catch (error) {
    console.error('Create sprint error:', error);
    res.status(500).json({ message: 'Error creating sprint', error });
  }
};

// Update sprint
exports.updateSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    const { name, goal, status, startDate, endDate, teamId } = req.body;

    if (name !== undefined) sprint.name = name;
    if (goal !== undefined) sprint.goal = goal;
    if (status !== undefined) sprint.status = status;
    if (startDate !== undefined) sprint.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) sprint.endDate = endDate ? new Date(endDate) : null;
    if (teamId !== undefined) sprint.teamId = teamId;

    await sprint.save();

    res.status(200).json({ message: 'Sprint updated successfully', sprint });
  } catch (error) {
    console.error('Update sprint error:', error);
    res.status(500).json({ message: 'Error updating sprint', error });
  }
};

// Start sprint
exports.startSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    if (sprint.status === 'Active') {
      return res.status(400).json({ message: 'Sprint is already active' });
    }

    // Check if there's already an active sprint for this project
    const activeSprint = await Sprint.findOne({
      where: {
        projectId: sprint.projectId,
        status: 'Active'
      }
    });

    if (activeSprint) {
      return res.status(400).json({ message: 'Another sprint is already active for this project' });
    }

    sprint.status = 'Active';
    if (!sprint.startDate) {
      sprint.startDate = new Date();
    }
    await sprint.save();

    res.status(200).json({ message: 'Sprint started successfully', sprint });
  } catch (error) {
    console.error('Start sprint error:', error);
    res.status(500).json({ message: 'Error starting sprint', error });
  }
};

// Complete sprint
exports.completeSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id, {
      include: [{ model: Ticket, as: 'tickets' }]
    });

    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    if (sprint.status === 'Closed') {
      return res.status(400).json({ message: 'Sprint is already closed' });
    }

    sprint.status = 'Closed';
    if (!sprint.endDate) {
      sprint.endDate = new Date();
    }

    // Calculate final metrics
    const tickets = sprint.tickets || [];
    const completedPoints = tickets
      .filter(t => t.status === 'Done' || t.status === 'Closed')
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const totalPoints = tickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    sprint.completedPoints = completedPoints;
    sprint.totalPoints = totalPoints;

    await sprint.save();

    res.status(200).json({ message: 'Sprint completed successfully', sprint });
  } catch (error) {
    console.error('Complete sprint error:', error);
    res.status(500).json({ message: 'Error completing sprint', error });
  }
};

// Delete sprint
exports.deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    // Remove sprint association from tickets
    await Ticket.update(
      { sprintId: null },
      { where: { sprintId: req.params.id } }
    );

    await sprint.destroy();
    res.status(200).json({ message: 'Sprint deleted successfully' });
  } catch (error) {
    console.error('Delete sprint error:', error);
    res.status(500).json({ message: 'Error deleting sprint', error });
  }
};

// Add ticket to sprint
exports.addTicketToSprint = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const sprint = await Sprint.findByPk(req.params.id);

    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.sprintId = sprint.id;
    await ticket.save();

    res.status(200).json({ message: 'Ticket added to sprint', ticket });
  } catch (error) {
    console.error('Add ticket to sprint error:', error);
    res.status(500).json({ message: 'Error adding ticket to sprint', error });
  }
};

// Remove ticket from sprint
exports.removeTicketFromSprint = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const ticket = await Ticket.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.sprintId = null;
    await ticket.save();

    res.status(200).json({ message: 'Ticket removed from sprint', ticket });
  } catch (error) {
    console.error('Remove ticket from sprint error:', error);
    res.status(500).json({ message: 'Error removing ticket from sprint', error });
  }
};
