import { CalendarDays, Camera, ImagePlus, MapPin, Pencil, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, setUser: setCurrentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', bio: '', location: '', avatar: '', coverImage: '' });

  const isOwn = profile ? String(currentUser.id) === String(profile.id) : currentUser.username === username;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profileResult, postsResult] = await Promise.all([
        api.get(`/users/${username}`),
        api.get(`/users/${username}/posts`)
      ]);
      const user = profileResult.data.user;
      setProfile(user);
      setPosts(postsResult.data.posts);
      setForm({
        name: user.name,
        bio: user.bio || '',
        location: user.location || '',
        avatar: user.avatar || '',
        coverImage: user.coverImage || ''
      });
    } catch (err) {
      setProfile(null);
      setError(err.response?.data?.message || 'Could not load profile');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  async function follow() {
    if (!profile || followBusy) return;
    setFollowBusy(true);
    setError('');
    try {
      const { data } = await api.post(`/users/${profile.id}/follow`);
      setProfile((current) => ({
        ...current,
        isFollowing: data.following,
        followersCount: data.targetFollowersCount
      }));
      window.dispatchEvent(new CustomEvent('vynora:follow-changed', { detail: { id: profile.id, isFollowing: data.following } }));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update follow status');
    } finally {
      setFollowBusy(false);
    }
  }

  async function uploadImage(event, field) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB');
      return;
    }
    const payload = new FormData();
    payload.append('image', file);
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/uploads', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm((current) => ({ ...current, [field]: data.url }));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upload image');
    } finally {
      setBusy(false);
    }
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.patch('/users/me', form);
      setCurrentUser(data.user);
      setProfile((current) => ({ ...current, ...data.user }));
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save profile');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loader label="Loading profile" />;
  if (!profile) {
    return <div className="page"><div className="empty-state card"><h3>Profile not found</h3><p>{error}</p></div></div>;
  }

  return (
    <div className="page profile-page">
      <section className="profile-hero card">
        <div className={`profile-cover ${profile.coverImage ? 'has-cover' : ''}`}>
          {profile.coverImage && <img src={profile.coverImage} alt={`${profile.name} cover`} />}
          {!profile.coverImage && <span>VYNORA</span>}
        </div>

        <div className="profile-content">
          <Avatar user={profile} size="xl" />
          <div className="profile-actions">
            {isOwn ? (
              <button className="secondary-button" onClick={() => setEditing(true)}><Pencil size={17} />Edit profile</button>
            ) : (
              <button className={profile.isFollowing ? 'secondary-button' : 'primary-button'} onClick={follow} disabled={followBusy}>
                {followBusy ? 'Updating…' : profile.isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <div className="profile-identity"><h1>{profile.name}</h1><span>@{profile.username}</span></div>
          <p className="profile-bio">{profile.bio || 'No bio yet.'}</p>
          <div className="profile-details">
            {profile.location && <span><MapPin size={16} />{profile.location}</span>}
            <span><CalendarDays size={16} />Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="profile-counts">
            <Link to={`/profile/${profile.username}/connections/following`} className="profile-count-link"><strong>{profile.followingCount}</strong> Following</Link>
            <Link to={`/profile/${profile.username}/connections/followers`} className="profile-count-link"><strong>{profile.followersCount}</strong> Followers</Link>
            <span><strong>{posts.length}</strong> Posts</span>
          </div>
          {error && <p className="form-error profile-error">{error}</p>}
        </div>
      </section>

      <section className="profile-posts">
        <h2>Posts</h2>
        {posts.length ? (
          <div className="post-list">
            {posts.map((post) => <PostCard key={post._id} post={post} onDelete={(id) => setPosts((current) => current.filter((item) => item._id !== id))} />)}
          </div>
        ) : (
          <div className="empty-state card"><h3>No posts yet</h3><p>This profile has not shared anything.</p></div>
        )}
      </section>

      {editing && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={save}>
            <div className="modal-head">
              <h2>Edit profile</h2>
              <button type="button" className="icon-button" onClick={() => setEditing(false)} aria-label="Close edit profile"><X /></button>
            </div>

            <div className="cover-editor">
              <div className={`cover-preview ${form.coverImage ? 'has-cover' : ''}`}>
                {form.coverImage ? <img src={form.coverImage} alt="Cover preview" /> : <span>Cover image</span>}
              </div>
              <label className="upload-label"><ImagePlus size={17} />Change cover<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => uploadImage(event, 'coverImage')} /></label>
            </div>

            <div className="avatar-editor">
              <Avatar user={{ ...profile, avatar: form.avatar }} size="xl" />
              <label className="upload-label"><Camera size={17} />Change photo<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => uploadImage(event, 'avatar')} /></label>
            </div>

            <label>Display name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={60} required /></label>
            <label>Bio<textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} maxLength={160} /></label>
            <label>Location<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} maxLength={60} /></label>
            {error && <div className="form-error-box">{error}</div>}
            <button className="primary-button" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
