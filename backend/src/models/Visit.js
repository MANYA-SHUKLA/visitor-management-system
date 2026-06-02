const mongoose = require('mongoose');
const { normalizeStatus } = require('../utils/visitStatus');

const visitSchema = new mongoose.Schema(
  {
    visitorName: { type: String, required: true, trim: true },
    visitorPhone: { type: String, required: true, trim: true },
    purpose: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: [
        'pending',
        'approved',
        'rejected',
        'entered',
        'exited',
        'checked_in',
        'checked_out',
      ],
      default: 'pending',
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registeredByGuardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    apartment: { type: String, required: true, trim: true },
    expectedAt: { type: Date },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectReason: { type: String, trim: true },
    entryAt: { type: Date },
    exitAt: { type: Date },
    qrToken: { type: String },
  },
  { timestamps: true }
);

visitSchema.index({ residentId: 1, createdAt: -1 });
visitSchema.index({ registeredByGuardId: 1, createdAt: -1 });
visitSchema.index({ status: 1 });
visitSchema.index({ qrToken: 1 }, { sparse: true });
visitSchema.index({ visitorName: 1, visitorPhone: 1 });

visitSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  obj.status = normalizeStatus(obj.status);
  return obj;
};

module.exports = mongoose.model('Visit', visitSchema);
