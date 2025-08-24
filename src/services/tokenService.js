const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generates JWT tokens.
 * @param {object} payload - The payload to sign.
 * @returns {{accessToken: string, refreshToken: string}} The generated tokens.
 */
function generateTokens(payload) {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

/**
 * Verifies a JWT token.
 * @param {string} token - The JWT token.
 * @returns {object|null} The decoded payload or null if invalid.
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Stores a refresh token for a user.
 * @param {string} userId - The user's ID.
 * @param {string} refreshToken - The refresh token.
 */
async function saveRefreshToken(userId, refreshToken) {
    // For simplicity, we'll just add it to the list.
    // In a real app, you might want to limit the number of active refresh tokens.
    await User.findByIdAndUpdate(userId, {
        $push: { refreshTokens: { tokenHash: refreshToken } } // Note: Storing raw token for simplicity, hash in production
    });
}


module.exports = {
  generateTokens,
  verifyToken,
  saveRefreshToken,
};
