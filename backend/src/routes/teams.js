const express = require('express');
const router = express.Router();
const { protect, hasRole } = require('../middleware/authMiddleware');
const { createTeam, addUserToTeam, addProjectToTeam } = require('../controllers/teamController');

router.use(protect);

router.post('/', hasRole('Super Admin', 'Admin', 'Manager'), createTeam);
router.post('/:id/users', hasRole('Super Admin', 'Admin', 'Manager'), addUserToTeam);
router.post('/:id/projects', hasRole('Super Admin', 'Admin', 'Manager'), addProjectToTeam);

module.exports = router;


