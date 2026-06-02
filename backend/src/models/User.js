const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['guard', 'resident', 'admin'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    apartment: {
      type: String,
      trim: true,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

userSchema.virtual('flatNumber').get(function flatNumber() {
  return this.apartment;
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', { virtuals: true });

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  if (obj.apartment && !obj.flatNumber) {
    obj.flatNumber = obj.apartment;
  }
  return obj;
};

module.exports = mongoose.model('User', userSchema);
