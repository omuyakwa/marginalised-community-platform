const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['USER', 'MODERATOR', 'ADMIN', 'SUPERADMIN'],
    default: 'USER',
  },
  locale: {
    type: String,
    enum: ['en', 'so'],
    default: 'en',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  twoFactor: {
    pending: { type: Boolean, default: false },
    tokenHash: { type: String, default: null },
    expiresAt: { type: Date, default: null },
  },
  refreshTokens: [{
    tokenHash: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
  }],
}, { timestamps: true });

// Method to compare password for login
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Middleware to hash password before saving a new user
userSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('passwordHash')) {
    if (this.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
  }
  next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;
