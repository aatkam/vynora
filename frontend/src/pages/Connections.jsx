import { ArrowLeft, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import UserCard from '../components/UserCard';

export default function Connections() {
  const { username, type } = useParams();
  const { user: currentUser } = useAuth();
  const validType = type === 'followers' || type === 'following';
  const [owner, setOwner] = useState(null);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [moreBusy, setMoreBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!validType) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/users/${username}/connections/${type}?page=1&limit=20`);
        setOwner(data.owner);
        setUsers(data.users);
        setPage(1);
        setHasMore(data.hasMore);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load connections');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [username, type, validType]);

  async function loadMore() {
    const nextPage = page + 1;
    setMoreBusy(true);
    try {
      const { data } = await api.get(`/users/${username}/connections/${type}?page=${nextPage}&limit=20`);
      setUsers((current) => [...current, ...data.users]);
      setPage(nextPage);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load more users');
    } finally {
      setMoreBusy(false);
    }
  }

  if (!validType) return <div className="page"><div className="empty-state card"><h3>Invalid connection page</h3></div></div>;
  if (loading) return <Loader label={`Loading ${type}`} />;

  const title = type === 'followers' ? 'Followers' : 'Following';

  return (
    <div className="page connections-page">
      <header className="page-header connection-header">
        <div>
          <Link className="back-link" to={`/profile/${username}`}><ArrowLeft size={18} />Back to profile</Link>
          <span className="eyebrow">{owner ? `@${owner.username}` : `@${username}`}</span>
          <h1>{title}</h1>
        </div>
      </header>

      {error && <div className="form-error-box page-error">{error}</div>}

      {users.length ? (
        <div className="people-grid">
          {users.map((person) => (
            <UserCard
              key={person.id}
              person={person}
              onChanged={(updated) => {
                const viewingOwnFollowing = type === 'following' && String(owner?.id) === String(currentUser.id);
                setUsers((current) => viewingOwnFollowing && !updated.isFollowing
                  ? current.filter((item) => item.id !== updated.id)
                  : current.map((item) => item.id === updated.id ? updated : item));
              }}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state card"><UsersRound size={32} /><h3>No {title.toLowerCase()} yet</h3><p>{type === 'followers' ? 'New followers will appear here.' : 'This user is not following anyone yet.'}</p></div>
      )}

      {hasMore && <div className="load-more-wrap"><button className="secondary-button" onClick={loadMore} disabled={moreBusy}>{moreBusy ? 'Loading…' : 'Load more'}</button></div>}
    </div>
  );
}
