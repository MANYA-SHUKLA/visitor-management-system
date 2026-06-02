const express = require('express');
const { getSummary } = require('../controllers/analyticsController');
const { authenticate, authorize, loadUser } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', authenticate, loadUser, authorize('admin'), getSummary);

module.exports = router;
