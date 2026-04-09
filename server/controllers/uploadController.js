import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'unimart' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return res.status(500).json({ message: 'Image upload failed', error: error.message });
        }
        res.status(200).json({ url: result.secure_url });
      }
    );

    Readable.from(req.file.buffer).pipe(stream);
  } catch (error) {
    console.error('Upload Controller Error:', error);
    res.status(500).json({ message: 'Server error during upload', error: error.message });
  }
};
