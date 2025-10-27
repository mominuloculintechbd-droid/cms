const express = require('express');
const router = express.Router();
const { protect, hasRole } = require('../middleware/authMiddleware');
const teamController = require('../controllers/teamController');

// All routes require authentication
router.use(protect);

// Get all teams (with optional filters)
router.get('/', hasRole('Manager', 'Admin', 'Super Admin'), teamController.getTeams);

// Get single team
router.get('/:id', teamController.getTeamById);

// Get team members
router.get('/:id/members', teamController.getTeamMembers);

// Create team
router.post('/', hasRole('Manager', 'Admin', 'Super Admin'), teamController.createTeam);

// Update team
router.put('/:id', hasRole('Manager', 'Admin', 'Super Admin'), teamController.updateTeam);

// Delete team
router.delete('/:id', hasRole('Admin', 'Super Admin'), teamController.deleteTeam);

// Add member to team
router.post('/:id/members', hasRole('Manager', 'Admin', 'Super Admin'), teamController.addMemberToTeam);

// Remove member from team
router.delete('/:id/members/:userId', hasRole('Manager', 'Admin', 'Super Admin'), teamController.removeMemberFromTeam);

module.exports = router;


