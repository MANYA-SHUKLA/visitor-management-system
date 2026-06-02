const Notification = require('../models/Notification');

async function listNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('visitId', 'visitorName status apartment');

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ notification });
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listNotifications, markRead, markAllRead };
