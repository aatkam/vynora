import { Router } from 'express';
import {
  getConnections,
  getProfile,
  getUserPosts,
  searchUsers,
  suggestions,
  toggleFollow,
  updateProfile
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/search', searchUsers);
router.get('/suggestions', suggestions);
router.patch('/me', updateProfile);
router.post('/:id/follow', toggleFollow);
router.get('/:username/posts', getUserPosts);
router.get('/:username/connections/:type', getConnections);
router.get('/:username', getProfile);
export default router;
