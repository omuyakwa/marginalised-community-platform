const mongoose = require('mongoose');

const dailySummarySchema = new mongoose.Schema({
  date: {
    type: String, // Using string in YYYY-MM-DD format for simplicity
    required: true,
    unique: true, // Should only have one summary per day
  },
  language: {
    type: String,
    enum: ['en', 'so'],
    required: true,
  },
  summaryText: {
    type: String,
    required: true,
  },
  infographicData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure one summary per day per language
dailySummarySchema.index({ date: 1, language: 1 }, { unique: true });


const DailySummary = mongoose.model('DailySummary', dailySummarySchema);

module.exports = DailySummary;
