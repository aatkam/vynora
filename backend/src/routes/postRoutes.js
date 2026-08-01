import { Router } from 'express';
import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  getFeed,
  getPost,
  searchPosts,
  toggleLike
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/feed', getFeed);
router.get('/search', searchPosts);
router.get('/:id', getPost);
router.post('/', createPost);
router.post('/:id/like', toggleLike);
router.post('/:id/comments', addComment);
router.delete('/:postId/comments/:commentId', deleteComment);
router.delete('/:id', deletePost);
export default router;
