import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Handling __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import User model - we need to use a relative path from this script
// Assumes script is in server/scripts/migrate_users.js
import User from '../models/User.js';

dotenv.config({ path: path.join(__dirname, '../.env') });

const migrateUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB...');

    const result = await User.updateMany(
      { role: { $in: ['buyer', 'seller'] } },
      { $set: { role: 'user' } }
    );

    console.log(`Migration successful. Modified ${result.modifiedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateUsers();
