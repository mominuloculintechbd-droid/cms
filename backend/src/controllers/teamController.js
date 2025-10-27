const Team = require('../models/Team');
const TeamMember = require('../models/TeamMember');
const User = require('../models/User');
const Project = require('../models/Project');
const { Op } = require('sequelize');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private (Manager, Admin, Super Admin)
exports.getTeams = async (req, res) => {
  try {
    const { projectId, status, search } = req.query;
    let where = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const teams = await Team.findAll({
      where,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status'],
        },
        {
          model: User,
          as: 'leader',
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'fullName', 'email', 'role'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
};

// @desc    Get single team by ID
// @route   GET /api/teams/:id
// @access  Private
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status', 'description'],
        },
        {
          model: User,
          as: 'leader',
          attributes: ['id', 'fullName', 'email', 'profilePicture'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'fullName', 'email', 'role', 'status', 'profilePicture'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
      ],
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team', error: error.message });
  }
};

// @desc    Create new team
// @route   POST /api/teams
// @access  Private (Manager, Admin, Super Admin)
exports.createTeam = async (req, res) => {
  try {
    const { name, description, projectId, leaderId, status } = req.body;

    if (!name || !projectId) {
      return res.status(400).json({ message: 'Team name and project ID are required' });
    }

    // Verify project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify leader exists if provided
    if (leaderId) {
      const leader = await User.findByPk(leaderId);
      if (!leader) {
        return res.status(404).json({ message: 'Leader not found' });
      }
    }

    const team = await Team.create({
      name,
      description,
      projectId,
      leaderId,
      status: status || 'Active',
    });

    // Fetch created team with associations
    const createdTeam = await Team.findByPk(team.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status'],
        },
        {
          model: User,
          as: 'leader',
          attributes: ['id', 'fullName', 'email'],
        },
      ],
    });

    res.status(201).json(createdTeam);
  } catch (error) {
    res.status(500).json({ message: 'Error creating team', error: error.message });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Manager, Admin, Super Admin)
exports.updateTeam = async (req, res) => {
  try {
    const { name, description, leaderId, status } = req.body;

    const team = await Team.findByPk(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Verify leader exists if provided
    if (leaderId) {
      const leader = await User.findByPk(leaderId);
      if (!leader) {
        return res.status(404).json({ message: 'Leader not found' });
      }
    }

    await team.update({
      name: name || team.name,
      description: description !== undefined ? description : team.description,
      leaderId: leaderId !== undefined ? leaderId : team.leaderId,
      status: status || team.status,
    });

    // Fetch updated team with associations
    const updatedTeam = await Team.findByPk(team.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status'],
        },
        {
          model: User,
          as: 'leader',
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'fullName', 'email', 'role'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
      ],
    });

    res.status(200).json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: 'Error updating team', error: error.message });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin, Super Admin)
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    await team.destroy();

    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting team', error: error.message });
  }
};

// @desc    Add member to team
// @route   POST /api/teams/:id/members
// @access  Private (Manager, Admin, Super Admin)
exports.addMemberToTeam = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const team = await Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a member
    const existingMember = await TeamMember.findOne({
      where: { teamId: team.id, userId },
    });

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    await TeamMember.create({
      teamId: team.id,
      userId,
      role: role || null,
    });

    // Return updated team with members
    const updatedTeam = await Team.findByPk(team.id, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'fullName', 'email', 'role', 'profilePicture'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
      ],
    });

    res.status(200).json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: 'Error adding member to team', error: error.message });
  }
};

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private (Manager, Admin, Super Admin)
exports.removeMemberFromTeam = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const teamMember = await TeamMember.findOne({
      where: { teamId: id, userId },
    });

    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    await teamMember.destroy();

    res.status(200).json({ message: 'Member removed from team successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing member from team', error: error.message });
  }
};

// @desc    Get team members
// @route   GET /api/teams/:id/members
// @access  Private
exports.getTeamMembers = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'fullName', 'email', 'role', 'status', 'profilePicture', 'lastLogin'],
          through: {
            attributes: ['role', 'joinedAt'],
          },
        },
      ],
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json(team.members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team members', error: error.message });
  }
};


