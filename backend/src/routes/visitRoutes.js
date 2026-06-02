const express = require('express');
const { body } = require('express-validator');
const {
  listVisits,
  getVisit,
  createVisit,
  approveVisit,
  rejectVisit,
  scanVisit,
  getVisitQr,
  markEntry,
  markExit,
  getVisitCounts,
} = require('../controllers/visitController');
const { authenticate, authorize, loadUser } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, loadUser);

router.get('/', listVisits);
router.get('/counts', getVisitCounts);

router.post(
  '/scan',
  authorize('guard'),
  [body('qrToken').notEmpty().withMessage('QR token required')],
  scanVisit
);

router.post(
  '/',
  authorize('guard'),
  [
    body('visitorName').trim().notEmpty().withMessage('Visitor name required'),
    body('visitorPhone').trim().notEmpty().withMessage('Phone required'),
    body('purpose').trim().notEmpty().withMessage('Purpose required'),
    body('apartment').trim().notEmpty().withMessage('Apartment required'),
    body('expectedAt').optional().isISO8601().withMessage('Invalid date'),
  ],
  createVisit
);

router.patch('/:id/entry', authorize('guard'), markEntry);
router.patch('/:id/exit', authorize('guard'), markExit);
router.get('/:id/qr', getVisitQr);
router.get('/:id', getVisit);
router.patch('/:id/approve', authorize('resident'), approveVisit);
router.patch('/:id/reject', authorize('resident'), rejectVisit);

module.exports = router;
