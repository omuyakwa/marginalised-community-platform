import multer from 'multer';
import connectToDatabase from './db';
import GridFsStorage from './GridFsStorage';

export const config = {
  api: {
    bodyParser: false, // let multer handle parsing
  },
};

export default async function handler(req, res) {
  try {
    await connectToDatabase(); // make sure mongoose is connected

    const storage = GridFsStorage({}); // uses mongoose connection
    const upload = multer({ storage }).single('file');

    upload(req, res, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ file: req.file });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
