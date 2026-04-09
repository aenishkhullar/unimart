import express from 'express';
const router = express.Router();
import {
  getNotifications,
  markAsRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getNotifications);
router.route('/:id').patch(protect, markAsRead);

export default router;
