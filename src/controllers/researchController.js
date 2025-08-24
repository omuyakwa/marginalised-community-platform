const Joi = require('joi');
const ResearchItem = require('../models/ResearchItem');

const createItemSchema = Joi.object({
  type: Joi.string().valid('link', 'note', 'file').required(),
  title: Joi.string().required(),
  url: Joi.string().uri().when('type', { is: 'link', then: Joi.required() }),
  excerpt: Joi.string().optional(),
  fileId: Joi.string().when('type', { is: 'file', then: Joi.required() }),
  tags: Joi.array().items(Joi.string()).optional(),
});

/**
 * Get all research items for the logged-in user.
 */
async function getResearchItems(req, res) {
  try {
    const items = await ResearchItem.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    console.error('Get Research Items Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

/**
 * Create a new research item.
 */
async function createResearchItem(req, res) {
  try {
    const { error, value } = createItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Validation error', details: error.details });
    }

    const newItem = new ResearchItem({
      ...value,
      ownerId: req.user._id,
    });

    await newItem.save();
    res.status(201).json({ message: 'Research item created successfully', item: newItem });

  } catch (err) {
    console.error('Create Research Item Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

/**
 * Delete a research item.
 */
async function deleteResearchItem(req, res) {
  try {
    const { id } = req.params;

    const item = await ResearchItem.findOne({ _id: id, ownerId: req.user._id });

    if (!item) {
      return res.status(404).json({ message: 'Research item not found or you do not have permission to delete it.' });
    }

    await item.deleteOne(); // Use deleteOne on the document instance

    res.status(200).json({ message: 'Research item deleted successfully.' });

  } catch (err) {
    console.error('Delete Research Item Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  getResearchItems,
  createResearchItem,
  deleteResearchItem,
};
