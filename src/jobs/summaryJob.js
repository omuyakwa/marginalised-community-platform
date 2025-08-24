const cron = require('node-cron');
const Content = require('../models/Content');
const DailySummary = require('../models/DailySummary');

// This function contains the logic to be executed by the cron job.
const generateDailySummary = async () => {
  console.log('Running daily summary generation job...');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateString = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // Find content from yesterday
    const contents = await Content.find({
      createdAt: {
        $gte: yesterday,
        $lt: today,
      },
      language: 'en', // For now, only summarizing English content
    });

    if (contents.length === 0) {
      console.log('No new content yesterday. Skipping summary.');
      return;
    }

    // Generate a simple summary
    const titles = contents.map(c => c.title).join(', ');
    const summaryText = `Yesterday's new content includes: ${titles}. A total of ${contents.length} new items were added.`;

    // For now, infographic data is a placeholder
    const infographicData = {
      charts: [
        { type: 'bar', title: 'Content by Tag', data: { /* ... */ } },
        { type: 'pie', title: 'Content Visibility', data: { /* ... */ } }
      ]
    };

    // Create or update the summary for yesterday
    await DailySummary.findOneAndUpdate(
      { date: dateString, language: 'en' },
      {
        summaryText,
        infographicData,
        generatedAt: new Date(),
      },
      { upsert: true, new: true } // upsert: create if it doesn't exist
    );

    console.log(`Successfully generated summary for ${dateString}.`);

  } catch (error) {
    console.error(`Error generating daily summary for ${dateString}:`, error);
  }
};


// Schedule the job to run every day at 1 AM server time.
// Using a less common time to avoid traffic spikes at midnight.
const summaryJob = cron.schedule('0 1 * * *', generateDailySummary, {
  scheduled: true,
  timezone: "Etc/UTC"
});

module.exports = { summaryJob, generateDailySummary };
