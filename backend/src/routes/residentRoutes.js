const express = require('express');
const { listResidents } = require('../controllers/residentController');
const { authenticate, authorize, loadUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, loadUser, authorize('guard', 'admin'), listResidents);

module.exports = router;
