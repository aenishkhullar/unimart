import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getUsers,
  toggleBlockUser,
  deleteUser,
  getAdminProducts,
  deleteProductAdmin,
  getAdminOrders,
  getAdminReports
} from '../controllers/adminController.js';

const router = express.Router();

// All routes here should be protected and admin-only
router.use(protect, admin);

router.route('/users').get(getUsers);
router.route('/users/:id').delete(deleteUser);
router.route('/users/:id/block').patch(toggleBlockUser);

router.route('/products').get(getAdminProducts);
router.route('/products/:id').delete(deleteProductAdmin);

router.route('/orders').get(getAdminOrders);

router.route('/reports').get(getAdminReports);

export default router;
