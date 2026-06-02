const Notification = require('../models/Notification');

async function createNotification({ userId, type, title, body, visitId }) {
  return Notification.create({
    userId,
    type,
    title,
    body,
    visitId,
  });
}

async function notifyApprovalRequest(residentId, visit) {
  return createNotification({
    userId: residentId,
    type: 'approval_request',
    title: 'Visitor approval needed',
    body: `${visit.visitorName} wants to visit (${visit.purpose})`,
    visitId: visit._id,
  });
}

async function notifyVisitApproved(guardId, visit) {
  return createNotification({
    userId: guardId,
    type: 'visit_approved',
    title: 'Visit approved',
    body: `${visit.visitorName} at ${visit.apartment} — ready for entry`,
    visitId: visit._id,
  });
}

async function notifyVisitRejected(guardId, visit) {
  return createNotification({
    userId: guardId,
    type: 'visit_rejected',
    title: 'Visit rejected',
    body: `${visit.visitorName} at ${visit.apartment} was rejected`,
    visitId: visit._id,
  });
}

async function notifyVisitorEntered(residentId, visit) {
  return createNotification({
    userId: residentId,
    type: 'visitor_entered',
    title: 'Visitor entered',
    body: `${visit.visitorName} checked in at the gate`,
    visitId: visit._id,
  });
}

async function notifyVisitorExited(residentId, visit) {
  return createNotification({
    userId: residentId,
    type: 'visitor_exited',
    title: 'Visitor left',
    body: `${visit.visitorName} checked out`,
    visitId: visit._id,
  });
}

module.exports = {
  createNotification,
  notifyApprovalRequest,
  notifyVisitApproved,
  notifyVisitRejected,
  notifyVisitorEntered,
  notifyVisitorExited,
};
