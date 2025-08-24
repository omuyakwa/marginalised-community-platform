const User = require('../models/User');
const Content = require('../models/Content');

/**
 * Handle request to get dashboard metrics.
 */
async function getMetrics(req, res) {
  try {
    const [userCount, contentCount, storageStats] = await Promise.all([
      User.countDocuments(),
      Content.countDocuments(),
      Content.aggregate([
        { $unwind: '$attachments' },
        {
          $group: {
            _id: null,
            totalUploads: { $sum: 1 },
            totalStorageBytes: { $sum: '$attachments.size' }
          }
        }
      ])
    ]);

    const stats = {
      users: {
        total: userCount,
      },
      content: {
        total: contentCount,
      },
      uploads: {
        total: storageStats[0]?.totalUploads || 0,
        storageUsage: storageStats[0]?.totalStorageBytes || 0, // in bytes
      },
    };

    res.status(200).json(stats);

  } catch (err) {
    console.error('Get Metrics Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  getMetrics,
};
