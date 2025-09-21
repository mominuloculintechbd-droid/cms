const { Team, User, Project, UserTeam, TeamProject } = require('../models');

exports.createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const team = await Team.create({ name, description });
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error creating team', error });
  }
};

exports.addUserToTeam = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await UserTeam.findOrCreate({ where: { userId, teamId: team.id }, defaults: { role: role || 'Agent' } });
    res.status(200).json({ message: 'User added to team' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding user to team', error });
  }
};

exports.addProjectToTeam = async (req, res) => {
  try {
    const { projectId } = req.body;
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await TeamProject.findOrCreate({ where: { teamId: team.id, projectId } });
    res.status(200).json({ message: 'Project linked to team' });
  } catch (error) {
    res.status(500).json({ message: 'Error linking project to team', error });
  }
};


