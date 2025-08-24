const multer = require('multer');
const createGridFsStorage = require('./gridfsStorage');
require('dotenv').config();

// Create the storage engine
const storage = createGridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    // We can customize file info here if needed
    // For now, we'll use the default random name generator
    return null;
  }
});

// Configure multer
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB file size limit
  fileFilter: (req, file, cb) => {
    // Add file type validation here if needed
    // Example: only allow PDFs and images
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG, and WebP are allowed.'), false);
    }
  }
});

module.exports = upload;
