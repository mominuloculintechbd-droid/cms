const Comment = require('../models/Comment');
const CommentAttachment = require('../models/CommentAttachment');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).send('Comment content is required.');
    }

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).send('Ticket not found.');
    }

    const comment = await Comment.create({
      ticket_id: id,
      user_id: req.user.id,
      content,
    });

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        commentId: comment.id,
        fileName: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        userId: req.user.id,
      }));
      await CommentAttachment.bulkCreate(attachments);
    }

    // Fetch the comment with user info to return
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['email'] }]
    });

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).send('An error occurred while adding the comment.');
  }
};

const getCommentsByTicketId = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await Comment.findAll({
      where: { ticket_id: id },
      include: [
        { model: User, attributes: ['email'] },
        { model: CommentAttachment, as: 'attachments' }
      ],
      order: [['createdAt', 'ASC']],
    });
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).send('An error occurred while fetching comments.');
  }
};

module.exports = {
  addComment,
  getCommentsByTicketId,
};
