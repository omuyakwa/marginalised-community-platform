const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const emailService = require('./emailService');
const tokenService = require('./tokenService');

/**
 * Registers a new user.
 */
async function registerUser({ name, email, password, locale }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already in use');
  }
  const user = new User({ name, email, passwordHash: password, locale });
  await user.save();
  user.passwordHash = undefined;
  return user;
}

/**
 * Handles user login and sends a 2FA magic link.
 */
async function loginUser(email, password) {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid email or password');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const salt = await bcrypt.genSalt(10);
  const tokenHash = await bcrypt.hash(token, salt);

  user.twoFactor = {
    pending: true,
    tokenHash: tokenHash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  };
  await user.save();

  await emailService.send2FAMagicLink(user.email, token);
}

/**
 * Verifies the 2FA magic link token and issues JWTs.
 * @param {string} token - The raw 2FA token from the magic link.
 * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>}
 * @throws {Error} If the token is invalid or expired.
 */
async function verify2FAToken(token) {
  // This is inefficient. In a production app, you'd want to index
  // the twoFactor.tokenHash field for faster lookups.
  const pendingUsers = await User.find({ 'twoFactor.pending': true });

  let user = null;
  for (const u of pendingUsers) {
    if (await bcrypt.compare(token, u.twoFactor.tokenHash)) {
      user = u;
      break;
    }
  }

  if (!user) {
    throw new Error('Invalid token');
  }

  if (new Date() > user.twoFactor.expiresAt) {
    user.twoFactor = { pending: false, tokenHash: null, expiresAt: null };
    await user.save();
    throw new Error('Token expired');
  }

  // Clear the 2FA fields
  user.twoFactor = { pending: false, tokenHash: null, expiresAt: null };
  await user.save();

  // Generate tokens
  const payload = { userId: user._id, role: user.role };
  const { accessToken, refreshToken } = tokenService.generateTokens(payload);

  // Store refresh token
  await tokenService.saveRefreshToken(user._id, refreshToken);

  user.passwordHash = undefined;
  return { user, accessToken, refreshToken };
}


module.exports = {
  registerUser,
  loginUser,
  verify2FAToken,
};
