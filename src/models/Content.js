const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  summary: {
    type: String,
    required: true,
  },
  body: {
    type: String,
  },
  tags: {
    type: [String],
    default: [],
  },
  language: {
    type: String,
    enum: ['en', 'so'],
    required: true,
  },
  translationGroupId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  visibility: {
    type: String,
    enum: ['public', 'community', 'private'],
    default: 'public',
  },
  attachments: [{
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    filename: String,
    mimetype: String,
    size: Number,
  }],
}, { timestamps: true });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
