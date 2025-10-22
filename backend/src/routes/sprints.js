const express = require('express');
const router = express.Router();
const {
  getAllSprints,
  getSprintById,
  createSprint,
  updateSprint,
  deleteSprint,
  startSprint,
  completeSprint,
  addTicketToSprint,
  removeTicketFromSprint
} = require('../controllers/sprintController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// All sprint routes are protected
router.use(protect);

router.route('/')
  .get(hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), getAllSprints)
  .post(hasRole('Super Admin', 'Admin', 'Manager'), createSprint);

router.route('/:id')
  .get(hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), getSprintById)
  .put(hasRole('Super Admin', 'Admin', 'Manager'), updateSprint)
  .delete(hasRole('Super Admin', 'Admin', 'Manager'), deleteSprint);

// Sprint actions
router.post('/:id/start', hasRole('Super Admin', 'Admin', 'Manager'), startSprint);
router.post('/:id/complete', hasRole('Super Admin', 'Admin', 'Manager'), completeSprint);

// Sprint tickets
router.post('/:id/tickets', hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), addTicketToSprint);
router.delete('/:id/tickets', hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), removeTicketFromSprint);

module.exports = router;
