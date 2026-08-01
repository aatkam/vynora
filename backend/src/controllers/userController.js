import mongoose from 'mongoose';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function publicUser(user, viewerId) {
  const followers = user.followers || [];
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    location: user.location,
    avatar: user.avatar,
    coverImage: user.coverImage,
    followersCount: followers.length,
    followingCount: (user.following || []).length,
    isFollowing: followers.some((id) => id.toString() === viewerId.toString()),
    createdAt: user.createdAt
  };
}

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ user: publicUser(user, req.user._id) });
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const posts = await Post.find({ author: user._id })
    .sort({ createdAt: -1 })
    .populate('author', 'name username avatar')
    .populate('comments.user', 'name username avatar');
  res.json({ posts });
});

export const getConnections = asyncHandler(async (req, res) => {
  const type = req.params.type;
  if (!['followers', 'following'].includes(type)) {
    res.status(400);
    throw new Error('Connection type must be followers or following');
  }

  const owner = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!owner) {
    res.status(404);
    throw new Error('User not found');
  }

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
  const ids = owner[type] || [];
  const total = ids.length;
  const pageIds = ids.slice((page - 1) * limit, page * limit);
  const users = await User.find({ _id: { $in: pageIds } });
  const order = new Map(pageIds.map((id, index) => [id.toString(), index]));
  users.sort((a, b) => order.get(a._id.toString()) - order.get(b._id.toString()));

  res.json({
    owner: { id: owner._id, name: owner.name, username: owner.username, avatar: owner.avatar },
    type,
    users: users.map((user) => publicUser(user, req.user._id)),
    page,
    total,
    hasMore: page * limit < total
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'bio', 'location', 'avatar', 'coverImage'];
  for (const key of allowed) {
    if (typeof req.body[key] === 'string') req.user[key] = req.body[key].trim();
  }
  if (!req.user.name) {
    res.status(400);
    throw new Error('Display name cannot be empty');
  }
  await req.user.save();
  res.json({ user: req.user.toSafeObject() });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ users: [] });
  const pattern = new RegExp(escapeRegex(q), 'i');
  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [{ name: pattern }, { username: pattern }, { bio: pattern }]
  })
    .sort({ followers: -1, createdAt: -1 })
    .limit(20);
  res.json({ users: users.map((user) => publicUser(user, req.user._id)) });
});

export const suggestions = asyncHandler(async (req, res) => {
  const excluded = [req.user._id, ...req.user.following];
  const users = await User.find({ _id: { $nin: excluded } })
    .sort({ createdAt: -1 })
    .limit(8);
  res.json({ users: users.map((user) => publicUser(user, req.user._id)) });
});

export const toggleFollow = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  if (!mongoose.isValidObjectId(targetId)) {
    res.status(400);
    throw new Error('Invalid user id');
  }
  if (targetId === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot follow yourself');
  }

  const target = await User.findById(targetId);
  if (!target) {
    res.status(404);
    throw new Error('User not found');
  }

  const alreadyFollowing = req.user.following.some((id) => id.toString() === targetId);
  const operation = alreadyFollowing ? '$pull' : '$addToSet';

  await Promise.all([
    User.findByIdAndUpdate(req.user._id, { [operation]: { following: target._id } }),
    User.findByIdAndUpdate(target._id, { [operation]: { followers: req.user._id } })
  ]);

  if (alreadyFollowing) {
    await Notification.deleteMany({ recipient: target._id, actor: req.user._id, type: 'follow' });
  } else {
    await Notification.deleteMany({ recipient: target._id, actor: req.user._id, type: 'follow' });
    await Notification.create({ recipient: target._id, actor: req.user._id, type: 'follow' });
  }

  const [updatedTarget, updatedCurrent] = await Promise.all([
    User.findById(target._id),
    User.findById(req.user._id)
  ]);

  res.json({
    following: !alreadyFollowing,
    targetFollowersCount: updatedTarget.followers.length,
    currentUserFollowingCount: updatedCurrent.following.length
  });
});
