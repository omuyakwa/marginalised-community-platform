const mongoose = require('mongoose');

const researchItemSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['link', 'note', 'file'],
    required: true,
  },
  url: { // For type 'link'
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  excerpt: { // For type 'note' or 'link'
    type: String,
  },
  fileId: { // For type 'file'
    type: mongoose.Schema.Types.ObjectId,
  },
  tags: {
    type: [String],
    default: [],
  },
  cachedForOffline: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

researchItemSchema.index({ ownerId: 1 });

const ResearchItem = mongoose.model('ResearchItem', researchItemSchema);

module.exports = ResearchItem;
