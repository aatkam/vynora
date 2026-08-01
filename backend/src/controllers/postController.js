import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const populatePost = (query) =>
  query.populate('author', 'name username avatar').populate('comments.user', 'name username avatar');

function requireValidId(id, label = 'id') {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error(`Invalid ${label}`);
    error.statusCode = 400;
    throw error;
  }
}

export const createPost = asyncHandler(async (req, res) => {
  const content = (req.body.content || '').trim();
  const imageUrl = (req.body.imageUrl || '').trim();
  if (!content && !imageUrl) {
    res.status(400);
    throw new Error('Add text or an image to publish a post');
  }
  const created = await Post.create({ author: req.user._id, content, imageUrl });
  const post = await populatePost(Post.findById(created._id));
  res.status(201).json({ post });
});

export const getFeed = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 30);
  const scope = req.query.scope === 'all' ? 'all' : 'following';
  const filter = scope === 'all' ? {} : { author: { $in: [req.user._id, ...req.user.following] } };

  const [posts, total] = await Promise.all([
    populatePost(Post.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)),
    Post.countDocuments(filter)
  ]);

  res.json({ posts, page, total, hasMore: page * limit < total });
});

export const getPost = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error('Invalid post id');
  }
  const post = await populatePost(Post.findById(req.params.id));
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  res.json({ post });
});

export const searchPosts = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ posts: [] });
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const posts = await populatePost(
    Post.find({ content: { $regex: escaped, $options: 'i' } }).sort({ createdAt: -1 }).limit(20)
  );
  res.json({ posts });
});

export const toggleLike = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error('Invalid post id');
  }
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const liked = post.likes.some((id) => id.toString() === req.user._id.toString());
  if (liked) post.likes.pull(req.user._id);
  else post.likes.addToSet(req.user._id);
  await post.save();

  if (post.author.toString() !== req.user._id.toString()) {
    if (liked) {
      await Notification.deleteMany({ recipient: post.author, actor: req.user._id, type: 'like', post: post._id });
    } else {
      await Notification.deleteMany({ recipient: post.author, actor: req.user._id, type: 'like', post: post._id });
      await Notification.create({ recipient: post.author, actor: req.user._id, type: 'like', post: post._id });
    }
  }
  res.json({ liked: !liked, likesCount: post.likes.length });
});

export const addComment = asyncHandler(async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) {
    res.status(400);
    throw new Error('Comment cannot be empty');
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error('Invalid post id');
  }
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  post.comments.push({ user: req.user._id, text });
  await post.save();

  if (post.author.toString() !== req.user._id.toString()) {
    await Notification.create({ recipient: post.author, actor: req.user._id, type: 'comment', post: post._id });
  }

  const updated = await populatePost(Post.findById(post._id));
  res.status(201).json({ comments: updated.comments });
});

export const deleteComment = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.postId) || !mongoose.isValidObjectId(req.params.commentId)) {
    res.status(400);
    throw new Error('Invalid comment request');
  }
  const post = await Post.findById(req.params.postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  const comment = post.comments.id(req.params.commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }
  const canDelete =
    comment.user.toString() === req.user._id.toString() ||
    post.author.toString() === req.user._id.toString();
  if (!canDelete) {
    res.status(403);
    throw new Error('You cannot delete this comment');
  }
  comment.deleteOne();
  await post.save();
  res.json({ message: 'Comment deleted' });
});

export const deletePost = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error('Invalid post id');
  }
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (post.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only delete your own posts');
  }
  await Promise.all([post.deleteOne(), Notification.deleteMany({ post: post._id })]);
  res.json({ message: 'Post deleted' });
});
