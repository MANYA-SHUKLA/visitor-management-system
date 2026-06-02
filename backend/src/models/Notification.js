const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'approval_request',
        'visit_approved',
        'visit_rejected',
        'visitor_entered',
        'visitor_exited',
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
    visitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visit',
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

notificationSchema.virtual('residentId').get(function residentId() {
  return this.userId;
});

notificationSchema.virtual('message').get(function message() {
  return this.body;
});

notificationSchema.virtual('visitorId').get(function visitorId() {
  return this.visitId;
});

notificationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);
