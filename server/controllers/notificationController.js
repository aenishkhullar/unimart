import Notification from '../models/Notification.js';

// Internal helper for other controllers
export const createNotification = async (userId, text, type, link = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      text,
      type,
      link,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// @desc    Get logged in user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10); // limit to latest 10
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check user
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    notification.isRead = true;
    const updatedNotification = await notification.save();

    res.json(updatedNotification);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
