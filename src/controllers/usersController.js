const Joi = require('joi');
const User = require('../models/User');

/**
 * Get the profile of the currently logged-in user.
 */
async function getUserProfile(req, res) {
  // The user object is attached to the request by the auth middleware.
  // We just need to select the fields that are safe to send.
  const userProfile = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    locale: req.user.locale,
    communitySegment: req.user.communitySegment,
  };
  res.status(200).json(userProfile);
}

const updateUserSchema = Joi.object({
  name: Joi.string().min(3).optional(),
  locale: Joi.string().valid('en', 'so').optional(),
  communitySegment: Joi.string().valid('Youth', 'Women', 'PWDs', 'Not Specified').optional(),
}).or('name', 'locale', 'communitySegment'); // At least one of the keys must be present

/**
 * Update the profile of the currently logged-in user.
 */
async function updateUserProfile(req, res) {
  try {
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Validation error', details: error.details });
    }

    const user = await User.findById(req.user._id);

    if (value.name) user.name = value.name;
    if (value.locale) user.locale = value.locale;
    if (value.communitySegment) user.communitySegment = value.communitySegment;

    await user.save();

    const userProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      locale: user.locale,
      communitySegment: user.communitySegment,
    };
    res.status(200).json({ message: 'Profile updated successfully.', user: userProfile });

  } catch (err) {
    console.error('Update User Profile Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


module.exports = {
  getUserProfile,
  updateUserProfile,
};
