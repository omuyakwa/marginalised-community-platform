const { GridFSBucket } = require('mongodb');
const crypto = require('crypto');
const path = require('path');
const mongoose = require('mongoose');

class GridFsStorage {
  constructor(opts = {}) {
    this.file = opts.file || null;

    // Use mongoose connection directly (recommended in serverless environments like Vercel)
    if (!mongoose.connection || mongoose.connection.readyState === 0) {
      throw new Error('Mongoose is not connected. Please connect before using GridFsStorage.');
    }

    this.db = mongoose.connection.db;
  }

  async _getDb() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const conn = mongoose.connection;

      if (conn.readyState === 1) {
        return resolve(conn.db);
      }

      conn.once('open', () => resolve(conn.db));
      conn.once('error', (err) => reject(err));
    });
  }

  _handleFile = async (req, file, cb) => {
    try {
      const db = await this._getDb();
      const bucket = new GridFSBucket(db, {
        bucketName: 'uploads',
      });

      const filename = await this._getFilename(req, file);

      const uploadStream = bucket.openUploadStream(filename, {
        metadata: {
          originalname: file.originalname,
          mimetype: file.mimetype,
        },
      });

      file.stream.pipe(uploadStream);

      uploadStream.on('error', (err) => cb(err));

      uploadStream.on('finish', () => {
        cb(null, {
          id: uploadStream.id,
          filename: uploadStream.filename,
          size: uploadStream.length,
          mimetype: file.mimetype,
          path: uploadStream.filename, // for multer compatibility
        });
      });
    } catch (err) {
      cb(err);
    }
  };

  _getFilename(req, file) {
    if (this.file) {
      return Promise.resolve(this.file(req, file));
    }

    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);

        const filename = buf.toString('hex') + path.extname(file.originalname);
        resolve(filename);
      });
    });
  }

  _removeFile = async (req, file, cb) => {
    try {
      const db = await this._getDb();
      const bucket = new GridFSBucket(db, {
        bucketName: 'uploads',
      });

      await bucket.delete(file.id); // file.id comes from finish() above
      cb(null);
    } catch (err) {
      cb(err);
    }
  };
}

module.exports = (opts) => new GridFsStorage(opts);
