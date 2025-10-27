const Project = require('../models/Project');
const Team = require('../models/Team');
const User = require('../models/User');
const { Op } = require('sequelize');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private (Manager, Admin, Super Admin)
exports.getProjects = async (req, res) => {
  try {
    const { status, search } = req.query;
    let where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const projects = await Project.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: Team,
          as: 'teams',
          attributes: ['id', 'name', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: Team,
          as: 'teams',
          attributes: ['id', 'name', 'description', 'status'],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Manager, Admin, Super Admin)
exports.createProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      status: status || 'Active',
      startDate,
      endDate,
      createdBy: req.user.id,
    });

    // Fetch the created project with associations
    const createdProject = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email'],
        },
      ],
    });

    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Manager, Admin, Super Admin)
exports.updateProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate } = req.body;

    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.update({
      name: name || project.name,
      description: description !== undefined ? description : project.description,
      status: status || project.status,
      startDate: startDate !== undefined ? startDate : project.startDate,
      endDate: endDate !== undefined ? endDate : project.endDate,
    });

    // Fetch updated project with associations
    const updatedProject = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: Team,
          as: 'teams',
          attributes: ['id', 'name', 'status'],
        },
      ],
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin, Super Admin)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.destroy();

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/:id/stats
// @access  Private
exports.getProjectStats = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: Team,
          as: 'teams',
          include: [
            {
              model: User,
              as: 'members',
              attributes: ['id', 'fullName'],
            },
          ],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const stats = {
      totalTeams: project.teams.length,
      activeTeams: project.teams.filter(t => t.status === 'Active').length,
      totalMembers: project.teams.reduce((sum, team) => sum + (team.members?.length || 0), 0),
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project stats', error: error.message });
  }
};
