const { Notification } = require('../models');
const { Op } = require('sequelize');

exports.getMyNotifications = async (req, res) => {
  try {
    const orConditions = [];
    if (req.user && req.user.id) {
      orConditions.push({ recipientUserId: req.user.id });
    }
    if (req.user && req.user.role) {
      orConditions.push({ recipientRole: req.user.role });
      orConditions.push({ recipientRole: 'All' });
    }

    const where = orConditions.length > 0 ? { [Op.or]: orConditions } : {};

    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error getting notifications', error });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    if (
      notification.recipientUserId && notification.recipientUserId !== req.user.id ||
      notification.recipientRole && notification.recipientRole !== req.user.role && notification.recipientRole !== 'All'
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    notification.isRead = true;
    await notification.save();
    res.status(200).json({ message: 'Marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error });
  }
};


