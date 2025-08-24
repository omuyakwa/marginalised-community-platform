const Joi = require('joi');
const Content = require('../models/Content');

const createContentSchema = Joi.object({
  title: Joi.string().required(),
  summary: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).optional(),
  language: Joi.string().valid('en', 'so').required(),
  visibility: Joi.string().valid('public', 'community', 'private').optional(),
  attachment: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().required(),
  }).required(),
});

/**
 * Handle request to create new content.
 */
async function createContent(req, res) {
  try {
    const { error, value } = createContentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Validation error', details: error.details });
    }

    const { title, summary, tags, language, visibility, attachment } = value;
    const authorId = req.user._id; // from auth middleware

    const newContent = new Content({
      title,
      summary,
      tags,
      language,
      visibility,
      authorId,
      attachments: [{
        fileId: attachment.id,
        filename: attachment.name,
        mimetype: attachment.mimetype,
        size: attachment.size,
      }],
    });

    await newContent.save();

    res.status(201).json({ message: 'Content created successfully', content: newContent });

  } catch (err) {
    console.error('Create Content Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

/**
 * Get a single content item by its ID.
 */
async function getContentById(req, res) {
  try {
    const { id } = req.params;
    const content = await Content.findById(id).populate('authorId', 'name');

    if (!content) {
      return res.status(404).json({ message: 'Content not found.' });
    }

    // Later, add logic to check for visibility permissions
    res.status(200).json(content);

  } catch (err) {
    console.error('Get Content By ID Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


/**
 * Get all public content.
 */
async function getPublicContent(req, res) {
  try {
    const content = await Content.find({ visibility: 'public' })
      .populate('authorId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(content);

  } catch (err) {
    console.error('Get Public Content Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


/**
 * Get all content for the currently logged-in user.
 */
async function getMyContent(req, res) {
  try {
    const content = await Content.find({ authorId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json(content);

  } catch (err) {
    console.error('Get My Content Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


module.exports = {
  createContent,
  getContentById,
  getPublicContent,
  getMyContent,
};
