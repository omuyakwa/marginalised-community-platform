const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true,
    index: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null, // null indicates a root comment
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  language: {
    type: String,
    enum: ['en', 'so'],
    default: 'en',
  },
  reactions: {
    likes: { type: Number, default: 0 },
    helpful: { type: Number, default: 0 },
  },
  flags: [{
    reason: { type: String, required: true },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  isModerated: {
    type: Boolean,
    default: false,
  },
  isHidden: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
