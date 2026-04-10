import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createReport } from '../controllers/reportController.js';

const router = express.Router();

router.route('/').post(protect, createReport);

export default router;
