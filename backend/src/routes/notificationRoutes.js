const express = require('express');
const {
  listNotifications,
  markRead,
  markAllRead,
} = require('../controllers/notificationController');
const { authenticate, loadUser } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, loadUser);

router.get('/', listNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

module.exports = router;
