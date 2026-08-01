import { Bell, CheckCheck, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import { useNotifications } from '../context/NotificationContext';
import { notificationText, timeAgo } from '../utils/format';

const icon = { like: Heart, comment: MessageCircle, follow: UserPlus };

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { setUnreadCount, refreshUnread } = useNotifications();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/notifications');
        setItems(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load notifications');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setUnreadCount]);

  async function markAll() {
    try {
      await api.patch('/notifications/read-all');
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not mark notifications as read');
    }
  }

  async function openItem(item) {
    if (!item.read) {
      try {
        await api.patch(`/notifications/${item._id}/read`);
        setItems((current) => current.map((notification) => notification._id === item._id ? { ...notification, read: true } : notification));
        await refreshUnread();
      } catch {
        // Navigation can continue even if marking read fails.
      }
    }
  }

  function destination(item) {
    if (item.type === 'follow') return `/profile/${item.actor.username}`;
    if (item.post?._id) return `/post/${item.post._id}`;
    return '/';
  }

  const unread = items.some((item) => !item.read);

  return (
    <div className="page">
      <header className="page-header">
        <div><span className="eyebrow">Activity around you</span><h1>Notifications</h1></div>
        <button className="secondary-button" onClick={markAll} disabled={!unread}><CheckCheck size={17} />Mark all read</button>
      </header>
      {error && <div className="form-error-box page-error">{error}</div>}
      {loading ? <Loader /> : items.length ? (
        <div className="notification-list card">
          {items.map((item) => {
            const Icon = icon[item.type] || Bell;
            return (
              <Link to={destination(item)} onClick={() => openItem(item)} className={`notification-row ${item.read ? '' : 'unread'}`} key={item._id}>
                <div className="notification-avatar"><Avatar user={item.actor} size="md" /><span><Icon size={14} /></span></div>
                <div className="notification-copy"><p><strong>{item.actor.name}</strong> {notificationText(item.type)}</p><span>{timeAgo(item.createdAt)}</span></div>
                {!item.read && <span className="unread-dot" />}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="empty-state card"><Bell size={30} /><h3>No notifications yet</h3><p>Likes, comments and new followers will appear here.</p></div>
      )}
    </div>
  );
}
