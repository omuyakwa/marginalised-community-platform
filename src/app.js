const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));
app.use('/lib', express.static('node_modules'));

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/golekaab';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));


// Basic route
app.get('/api/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// Auth routes
app.use('/api/auth', require('./api/auth'));

// Upload routes
app.use('/api/uploads', require('./api/uploads'));

// Content routes
app.use('/api/content', require('./api/content'));

// Metrics routes
app.use('/api/metrics', require('./api/metrics'));

// Summaries routes
app.use('/api/summaries', require('./api/summaries'));

// Research routes
app.use('/api/research', require('./api/research'));

// Comments routes
app.use('/api/comments', require('./api/comments'));

// Users routes
app.use('/api/users', require('./api/users'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Start cron jobs
require('./jobs/summaryJob');
console.log('Daily summary job scheduled.');


module.exports = app;
