import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function UserCard({ person, compact = false, onChanged }) {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(person);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setUser(person), [person]);

  const isOwn = String(user.id) === String(currentUser.id);

  async function toggleFollow() {
    if (busy || isOwn) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(`/users/${user.id}/follow`);
      const updated = {
        ...user,
        isFollowing: data.following,
        followersCount: data.targetFollowersCount
      };
      setUser(updated);
      onChanged?.(updated);
      window.dispatchEvent(new CustomEvent('vynora:follow-changed', { detail: updated }));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update follow status');
    } finally {
      setBusy(false);
    }
  }

  if (compact) {
    return (
      <div className="suggestion">
        <Link to={`/profile/${user.username}`}><Avatar user={user} size="sm" /></Link>
        <div className="suggestion-copy">
          <Link to={`/profile/${user.username}`}><strong>{user.name}</strong></Link>
          <span>@{user.username}</span>
        </div>
        {!isOwn && (
          <button className={user.isFollowing ? 'small-button small-button-muted' : 'small-button'} onClick={toggleFollow} disabled={busy}>
            {busy ? '...' : user.isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
    );
  }

  return (
    <article className="person-card card">
      <Link to={`/profile/${user.username}`}><Avatar user={user} size="lg" /></Link>
      <div>
        <Link to={`/profile/${user.username}`}><strong>{user.name}</strong></Link>
        <span>@{user.username}</span>
      </div>
      <p>{user.bio || 'New to Vynora.'}</p>
      <div className="person-meta">
        <span>{user.followersCount} {user.followersCount === 1 ? 'follower' : 'followers'}</span>
        {!isOwn && (
          <button className={user.isFollowing ? 'secondary-button' : 'small-button'} onClick={toggleFollow} disabled={busy}>
            {busy ? 'Updating…' : user.isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
      {error && <p className="card-error">{error}</p>}
    </article>
  );
}
