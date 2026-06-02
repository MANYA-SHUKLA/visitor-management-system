const { validationResult } = require('express-validator');
const Visit = require('../models/Visit');
const User = require('../models/User');
const { generateQrToken, verifyQrToken, qrDataUrl } = require('../services/qrService');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');
const { createdAtFilter } = require('../utils/dateFilters');
const {
  normalizeStatus,
  canMarkEntry,
  canMarkExit,
} = require('../utils/visitStatus');

function populateVisit(query) {
  return query
    .populate('residentId', 'name email apartment phone flatNumber')
    .populate('registeredByGuardId', 'name email phone');
}

async function listVisits(req, res, next) {
  try {
    const filter = {};
    const { status, from, to, apartment, period } = req.query;

    if (req.user.role === 'guard') {
      filter.registeredByGuardId = req.user._id;
    } else if (req.user.role === 'resident') {
      filter.residentId = req.user._id;
    }

    if (status) {
      if (status === 'entered') {
        filter.status = { $in: ['entered', 'checked_in'] };
      } else if (status === 'exited') {
        filter.status = { $in: ['exited', 'checked_out'] };
      } else {
        filter.status = status;
      }
    }
    if (apartment) filter.apartment = new RegExp(apartment, 'i');

    const periodRange = createdAtFilter(period);
    if (periodRange) {
      filter.createdAt = periodRange;
    } else if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const visits = await populateVisit(
      Visit.find(filter).sort({ createdAt: -1 }).limit(200)
    );

    res.json({ visits });
  } catch (err) {
    next(err);
  }
}

async function getVisit(req, res, next) {
  try {
    const visit = await populateVisit(Visit.findById(req.params.id));
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (!canAccessVisit(req.user, visit)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ visit });
  } catch (err) {
    next(err);
  }
}

function canAccessVisit(user, visit) {
  if (user.role === 'admin') return true;
  if (user.role === 'guard') {
    return visit.registeredByGuardId._id.toString() === user._id.toString();
  }
  if (user.role === 'resident') {
    return visit.residentId._id.toString() === user._id.toString();
  }
  return false;
}

async function createVisit(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { visitorName, visitorPhone, purpose, apartment, expectedAt } = req.body;

    const resident = await User.findOne({
      role: 'resident',
      apartment: apartment.trim(),
    });

    if (!resident) {
      return res.status(404).json({ message: 'No resident found for that apartment' });
    }

    const visit = await Visit.create({
      visitorName,
      visitorPhone,
      purpose,
      apartment: apartment.trim(),
      expectedAt: expectedAt ? new Date(expectedAt) : undefined,
      residentId: resident._id,
      registeredByGuardId: req.user._id,
      status: 'pending',
    });

    const populated = await populateVisit(Visit.findById(visit._id));

    await notificationService.notifyApprovalRequest(resident._id, visit);
    await emailService.sendApprovalRequest(resident, visit);

    res.status(201).json({ visit: populated });
  } catch (err) {
    next(err);
  }
}

async function approveVisit(req, res, next) {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (visit.residentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (visit.status !== 'pending') {
      return res.status(400).json({ message: 'Visit is not pending approval' });
    }

    const qrToken = generateQrToken(visit._id);
    visit.status = 'approved';
    visit.approvedAt = new Date();
    visit.qrToken = qrToken;
    await visit.save();

    const populated = await populateVisit(Visit.findById(visit._id));
    const guard = await User.findById(visit.registeredByGuardId);

    await notificationService.notifyVisitApproved(visit.registeredByGuardId, visit);
    if (guard) {
      await emailService.sendVisitApproved(guard, visit);
    }

    res.json({ visit: populated });
  } catch (err) {
    next(err);
  }
}

async function rejectVisit(req, res, next) {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (visit.residentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (visit.status !== 'pending') {
      return res.status(400).json({ message: 'Visit is not pending approval' });
    }

    visit.status = 'rejected';
    visit.rejectedAt = new Date();
    visit.rejectReason = req.body.reason || '';
    await visit.save();

    const populated = await populateVisit(Visit.findById(visit._id));

    await notificationService.notifyVisitRejected(visit.registeredByGuardId, visit);

    res.json({ visit: populated });
  } catch (err) {
    next(err);
  }
}

async function scanVisit(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { qrToken } = req.body;
    let payload;

    try {
      payload = verifyQrToken(qrToken);
    } catch {
      return res.status(400).json({ message: 'Invalid or expired QR code' });
    }

    const visit = await Visit.findById(payload.visitId);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (visit.qrToken !== qrToken) {
      return res.status(400).json({ message: 'QR code is no longer valid' });
    }

    let action;

    const current = normalizeStatus(visit.status);

    if (current === 'approved') {
      visit.status = 'entered';
      visit.entryAt = new Date();
      action = 'entry';
      await visit.save();
      await notificationService.notifyVisitorEntered(visit.residentId, visit);
    } else if (current === 'entered') {
      visit.status = 'exited';
      visit.exitAt = new Date();
      action = 'exit';
      await visit.save();
      await notificationService.notifyVisitorExited(visit.residentId, visit);
    } else {
      const msg =
        current === 'exited'
          ? 'Visitor already exited'
          : current === 'pending'
            ? 'Visit not approved yet'
            : current === 'rejected'
              ? 'Visit was rejected'
              : 'Cannot scan this visit';
      return res.status(400).json({ message: msg });
    }

    const populated = await populateVisit(Visit.findById(visit._id));
    res.json({ action, visit: populated });
  } catch (err) {
    next(err);
  }
}

async function getVisitQr(req, res, next) {
  try {
    const visit = await populateVisit(Visit.findById(req.params.id));
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (!canAccessVisit(req.user, visit)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const qrStatus = normalizeStatus(visit.status);
    if (
      !visit.qrToken ||
      !['approved', 'entered', 'exited'].includes(qrStatus)
    ) {
      return res.status(400).json({ message: 'QR not available for this visit' });
    }

    const dataUrl = await qrDataUrl(visit.qrToken);
    res.json({ qrToken: visit.qrToken, dataUrl });
  } catch (err) {
    next(err);
  }
}

async function markEntry(req, res, next) {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (!canMarkEntry(visit.status)) {
      return res.status(400).json({
        message: 'Entry only allowed for approved visitors',
      });
    }

    visit.status = 'entered';
    visit.entryAt = new Date();
    await visit.save();
    await notificationService.notifyVisitorEntered(visit.residentId, visit);

    const populated = await populateVisit(Visit.findById(visit._id));
    res.json({ action: 'entry', visit: populated });
  } catch (err) {
    next(err);
  }
}

async function markExit(req, res, next) {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (!canMarkExit(visit.status)) {
      return res.status(400).json({
        message: 'Exit only allowed after entry is marked',
      });
    }

    visit.status = 'exited';
    visit.exitAt = new Date();
    await visit.save();
    await notificationService.notifyVisitorExited(visit.residentId, visit);

    const populated = await populateVisit(Visit.findById(visit._id));
    res.json({ action: 'exit', visit: populated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listVisits,
  getVisit,
  createVisit,
  approveVisit,
  rejectVisit,
  scanVisit,
  getVisitQr,
  markEntry,
  markExit,
  canAccessVisit,
};
