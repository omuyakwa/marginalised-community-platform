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

module.exports = {
  createContent,
};
