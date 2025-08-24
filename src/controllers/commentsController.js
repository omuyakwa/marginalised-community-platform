const Joi = require('joi');
const Comment = require('../models/Comment');
const Content = require('../models/Content');

/**
 * Get all comments for a specific content item.
 */
async function getCommentsByContentId(req, res) {
  try {
    const { contentId } = req.params;

    // Optional: Check if content exists
    const contentExists = await Content.findById(contentId);
    if (!contentExists) {
      return res.status(404).json({ message: 'Content not found.' });
    }

    const comments = await Comment.find({ contentId: contentId, isHidden: false })
      .populate('authorId', 'name') // Populate author's name
      .sort({ createdAt: 'asc' }); // Sort by oldest first to build threads correctly

    res.status(200).json(comments);

  } catch (err) {
    console.error('Get Comments Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

const createCommentSchema = Joi.object({
  text: Joi.string().min(1).required(),
  parentId: Joi.string().optional().allow(null, ''),
});

/**
 * Create a new comment on a content item.
 */
async function createComment(req, res) {
  try {
    const { contentId } = req.params;
    const { error, value } = createCommentSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: 'Validation error', details: error.details });
    }

    const newComment = new Comment({
      contentId,
      authorId: req.user._id,
      text: value.text,
      parentId: value.parentId || null,
    });

    await newComment.save();

    // Populate author info before sending back
    const populatedComment = await Comment.findById(newComment._id).populate('authorId', 'name');

    res.status(201).json(populatedComment);

  } catch (err) {
    console.error('Create Comment Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


const reactCommentSchema = Joi.object({
  reactionType: Joi.string().valid('likes', 'helpful').required(),
});

/**
 * Add a reaction to a comment.
 */
async function reactToComment(req, res) {
  try {
    const { commentId } = req.params;
    const { error, value } = reactCommentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Validation error', details: error.details });
    }

    const { reactionType } = value;

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { [`reactions.${reactionType}`]: 1 } },
      { new: true } // Return the updated document
    );

    if (!updatedComment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    res.status(200).json(updatedComment.reactions);

  } catch (err) {
    console.error('React to Comment Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

const flagCommentSchema = Joi.object({
  reason: Joi.string().min(10).max(200).required(),
});

/**
 * Flag a comment for moderation.
 */
async function flagComment(req, res) {
  try {
    const { commentId } = req.params;
    const reporterId = req.user._id;
    const { error, value } = flagCommentSchema.validate(req.body);
     if (error) {
      return res.status(400).json({ message: 'Validation error', details: error.details });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    // Prevent a user from flagging the same comment multiple times
    if (comment.flags.some(flag => flag.reporterId.equals(reporterId))) {
      return res.status(409).json({ message: 'You have already flagged this comment.' });
    }

    comment.flags.push({
      reason: value.reason,
      reporterId: reporterId,
    });

    await comment.save();

    res.status(200).json({ message: 'Comment flagged successfully.' });

  } catch (err) {
    console.error('Flag Comment Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


module.exports = {
  getCommentsByContentId,
  createComment,
  reactToComment,
  flagComment,
};
