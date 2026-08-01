import { Router } from 'express';
import {
  getUnreadCount,
  listNotifications,
  markAllRead,
  markOneRead
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', listNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markOneRead);
export default router;
