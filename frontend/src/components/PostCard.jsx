import { Heart, Link2, MessageCircle, MoreHorizontal, Send, Share2, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/format';
import Avatar from './Avatar';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [menu, setMenu] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    setLiked((post.likes || []).some((id) => String(id) === String(user.id)));
    setLikesCount((post.likes || []).length);
    setComments(post.comments || []);
  }, [post, user.id]);

  const author = post.author || {};
  const authorId = author?._id || author?.id;
  const isOwner = String(authorId) === String(user.id);
  const profileLink = useMemo(() => `/profile/${author.username}`, [author.username]);
  const postLink = `/post/${post._id}`;

  async function like() {
    const previous = liked;
    setLiked(!previous);
    setLikesCount((count) => count + (previous ? -1 : 1));
    setError('');
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (err) {
      setLiked(previous);
      setLikesCount((count) => count + (previous ? 1 : -1));
      setError(err.response?.data?.message || 'Could not update like');
    }
  }

  async function submitComment(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, { text: comment });
      setComments(data.comments);
      setComment('');
      setShowComments(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add comment');
    } finally {
      setBusy(false);
    }
  }

  async function removeComment(commentId) {
    setError('');
    try {
      await api.delete(`/posts/${post._id}/comments/${commentId}`);
      setComments((current) => current.filter((item) => item._id !== commentId));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete comment');
    }
  }

  async function removePost() {
    setError('');
    try {
      await api.delete(`/posts/${post._id}`);
      onDelete?.(post._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete post');
    }
  }

  async function sharePost() {
    const url = `${window.location.origin}${postLink}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${author.name}'s post on Vynora`, text: post.content || 'View this post on Vynora', url });
        setShareStatus('Shared');
      } else {
        await navigator.clipboard.writeText(url);
        setShareStatus('Link copied');
      }
    } catch (err) {
      if (err.name !== 'AbortError') setShareStatus('Could not share');
    }
    window.setTimeout(() => setShareStatus(''), 1800);
  }

  return (
    <article className="post-card card">
      <header className="post-header">
        <Link to={profileLink}><Avatar user={author} size="md" /></Link>
        <div className="post-author">
          <Link to={profileLink}><strong>{author.name || 'Unknown user'}</strong></Link>
          <div><span>@{author.username || 'unknown'}</span><span>·</span><Link to={postLink}>{timeAgo(post.createdAt)}</Link></div>
        </div>
        {isOwner && (
          <div className="post-menu-wrap">
            <button type="button" className="icon-button" onClick={() => setMenu(!menu)} aria-label="Post menu"><MoreHorizontal size={20} /></button>
            {menu && <button type="button" className="delete-menu" onClick={removePost}><Trash2 size={16} />Delete post</button>}
          </div>
        )}
      </header>

      {post.content && <p className="post-content">{post.content}</p>}
      {post.imageUrl && <img className="post-image" src={post.imageUrl} alt="Post attachment" loading="lazy" />}

      <div className="post-stats">
        <button type="button" onClick={like} className={liked ? 'liked' : ''}><Heart size={19} fill={liked ? 'currentColor' : 'none'} />{likesCount}</button>
        <button type="button" onClick={() => setShowComments(!showComments)}><MessageCircle size={19} />{comments.length}</button>
        <button type="button" onClick={sharePost}><Share2 size={18} />Share</button>
        {shareStatus && <span className="share-status"><Link2 size={14} />{shareStatus}</span>}
      </div>

      <form className="comment-form" onSubmit={submitComment}>
        <Avatar user={user} size="xs" />
        <input value={comment} onChange={(e) => setComment(e.target.value)} maxLength={300} placeholder="Write a comment…" />
        <button disabled={busy || !comment.trim()} aria-label="Post comment"><Send size={17} /></button>
      </form>

      {error && <p className="form-error post-error">{error}</p>}

      {showComments && (
        <div className="comments-list">
          {comments.length ? comments.map((item) => {
            const commentUser = item.user || {};
            const canDelete = String(commentUser._id || commentUser.id) === String(user.id) || String(authorId) === String(user.id);
            return (
              <div className="comment" key={item._id}>
                <Avatar user={commentUser} size="xs" />
                <div className="comment-bubble">
                  <div><Link to={`/profile/${commentUser.username}`}><strong>{commentUser.name}</strong></Link><span>@{commentUser.username} · {timeAgo(item.createdAt)}</span></div>
                  <p>{item.text}</p>
                </div>
                {canDelete && <button type="button" className="comment-delete" onClick={() => removeComment(item._id)} aria-label="Delete comment"><Trash2 size={14} /></button>}
              </div>
            );
          }) : <p className="muted small">No comments yet. Start the conversation.</p>}
        </div>
      )}
    </article>
  );
}
