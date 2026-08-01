import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import UserCard from './UserCard';

export default function RightPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/users/suggestions');
      setUsers(data.users.slice(0, 5));
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const listener = () => load();
    window.addEventListener('vynora:follow-changed', listener);
    return () => window.removeEventListener('vynora:follow-changed', listener);
  }, [load]);

  return (
    <aside className="right-panel">
      <div className="panel-card">
        <div className="panel-title"><h3>People to discover</h3><Link to="/explore">See all</Link></div>
        <div className="suggestion-list">
          {loading ? <p className="muted small">Loading suggestions…</p> : users.length ? users.map((user) => (
            <UserCard key={user.id} person={user} compact onChanged={(updated) => {
              if (updated.isFollowing) setUsers((current) => current.filter((item) => item.id !== updated.id));
            }} />
          )) : <p className="muted small">No new suggestions right now.</p>}
        </div>
      </div>
      <div className="panel-card mini-about">
        <p><strong>Vynora</strong> is a focused social space for sharing ideas, progress and everyday moments.</p>
        <span>Connect · Share · Inspire</span>
      </div>
    </aside>
  );
}
