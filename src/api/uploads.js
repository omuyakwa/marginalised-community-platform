const express = require('express');
const router = express.Router();
const upload = require('../services/fileService');
// Note: We should add auth middleware here later to protect this route
// const authMiddleware = require('../middleware/auth');

// @route   POST /api/uploads
// @desc    Upload a single file
// @access  Private (to be implemented)
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File upload failed. No file provided.' });
  }

  // The 'upload' middleware, using our custom storage engine,
  // has already processed the file and stored it in GridFS.
  // The file details are available in req.file.
  res.status(201).json({
    message: 'File uploaded successfully.',
    file: {
      id: req.file.id,
      name: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    },
  });
});

// @route   GET /api/uploads/:id
// @desc    Download or display a file from GridFS
// @access  Public (for now, should be permissioned later)
router.get('/:id', async (req, res) => {
  try {
    const { GridFSBucket, ObjectID } = require('mongodb');
    const db = require('mongoose').connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    const fileId = new ObjectID(req.params.id);

    // Find the file document
    const file = await db.collection('uploads.files').findOne({ _id: fileId });
    if (!file) {
      return res.status(404).json({ message: 'File not found.' });
    }

    // Set headers
    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', `inline; filename="${file.filename}"`); // inline to display in browser

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);

  } catch (error) {
    // Catch invalid ObjectID errors
    if (error.name === 'BSONTypeError') {
      return res.status(400).json({ message: 'Invalid file ID.' });
    }
    console.error('File download error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Middleware for handling multer errors
router.use((error, req, res, next) => {
  if (error instanceof require('multer').MulterError) {
    return res.status(400).json({ message: `Multer error: ${error.message}` });
  }
  if (error) {
    return res.status(400).json({ message: `File upload error: ${error.message}` });
  }
  next();
});


module.exports = router;
