const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all projects
router.get('/', hasRole('Manager', 'Admin', 'Super Admin'), projectController.getProjects);

// Get single project
router.get('/:id', projectController.getProjectById);

// Get project statistics
router.get('/:id/stats', projectController.getProjectStats);

// Create project
router.post('/', hasRole('Manager', 'Admin', 'Super Admin'), projectController.createProject);

// Update project
router.put('/:id', hasRole('Manager', 'Admin', 'Super Admin'), projectController.updateProject);

// Delete project
router.delete('/:id', hasRole('Admin', 'Super Admin'), projectController.deleteProject);

module.exports = router;
