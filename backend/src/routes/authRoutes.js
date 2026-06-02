const express = require('express');
const { body } = require('express-validator');
const { register, login, me } = require('../controllers/authController');
const { authenticate, authorize, loadUser } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  authenticate,
  loadUser,
  authorize('admin'),
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('name').trim().notEmpty().withMessage('Name required'),
    body('role').isIn(['guard', 'resident', 'admin']).withMessage('Invalid role'),
    body('apartment').optional().trim(),
    body('phone').optional().trim(),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  login
);

router.get('/me', authenticate, loadUser, me);

module.exports = router;
