const Joi = require('joi');
const authService = require('../services/authService');

const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  locale: Joi.string().valid('en', 'so').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

async function register(req, res) {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });
    const user = await authService.registerUser(value);
    res.status(201).json({
      message: 'User registered successfully.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, locale: user.locale },
    });
  } catch (err) {
    if (err.message === 'Email already in use') return res.status(409).json({ message: err.message });
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function login(req, res) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });
    await authService.loginUser(value.email, value.password);
    res.status(200).json({ message: 'Login successful. Check your email for a magic link to sign in.' });
  } catch (err) {
    if (err.message === 'Invalid email or password') return res.status(401).json({ message: err.message });
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

/**
 * Handle 2FA verification from magic link.
 */
async function verify2FA(req, res) {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const { user, accessToken, refreshToken } = await authService.verify2FAToken(token);

    // In a real app, you might set cookies here or redirect to a frontend page
    // with the tokens in the URL fragment. For a pure API, returning them is fine.
    res.status(200).json({
      message: 'Authentication successful.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    if (err.message === 'Invalid token' || err.message === 'Token expired') {
      return res.status(401).json({ message: err.message });
    }
    console.error('2FA Verification Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  register,
  login,
  verify2FA,
};
