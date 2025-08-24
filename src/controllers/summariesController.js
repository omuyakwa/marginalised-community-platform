const Joi = require('joi');
const DailySummary = require('../models/DailySummary');

const getSummarySchema = Joi.object({
  lang: Joi.string().valid('en', 'so').default('en'),
});

/**
 * Handle request to get the latest daily summary.
 */
async function getLatestSummary(req, res) {
  try {
    const { error, value } = getSummarySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: 'Validation error', details: error.details });
    }

    const { lang } = value;

    // Find the most recent summary for the given language
    const summary = await DailySummary.findOne({ language: lang })
      .sort({ date: -1 });

    if (!summary) {
      return res.status(404).json({ message: 'No summary found for the selected language.' });
    }

    res.status(200).json(summary);

  } catch (err) {
    console.error('Get Summary Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  getLatestSummary,
};
