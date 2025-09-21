const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketCount
} = require('../controllers/ticketController');
const { addComment, getCommentsByTicketId } = require('../controllers/commentController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// All ticket routes are protected
router.use(protect);

router.route('/count')
    .get(hasRole('Super Admin', 'Admin', 'Manager'), getTicketCount);

router.route('/')
  .get(hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), getAllTickets)
  .post(createTicket); // All authenticated users can create tickets

router.route('/:id')
  .get(getTicketById) // Logic to check ownership should be in the controller
  .put(hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), updateTicket)
  .delete(hasRole('Super Admin', 'Admin'), deleteTicket);

// Comment routes
router.route('/:id/comments')
    .get(getCommentsByTicketId)
    .post(addComment);

// Assignment and linking
router.put('/:id/assign', hasRole('Super Admin', 'Admin', 'Manager'), require('../controllers/ticketController').assignTicket);
router.post('/:id/link', hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), require('../controllers/ticketController').linkTickets);
router.post('/:id/unlink', hasRole('Super Admin', 'Admin', 'Manager', 'Agent'), require('../controllers/ticketController').unlinkTickets);

module.exports = router;
