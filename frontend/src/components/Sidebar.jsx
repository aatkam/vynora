import { Bell, Compass, Home, LogOut, Search, Sparkles, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Avatar from './Avatar';

const itemClass = ({ isActive }) => `nav-item ${isActive ? 'active' : ''}`;

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <aside className="sidebar">
      <NavLink to="/" className="brand"><span className="brand-mark"><Sparkles size={20} /></span><span>Vynora</span></NavLink>
      <nav className="side-nav">
        <NavLink to="/" end className={itemClass}><Home size={21} /><span>Home</span></NavLink>
        <NavLink to="/explore" className={itemClass}><Compass size={21} /><span>Explore</span></NavLink>
        <NavLink to="/search" className={itemClass}><Search size={21} /><span>Search</span></NavLink>
        <NavLink to="/notifications" className={itemClass}>
          <span className="nav-icon-wrap"><Bell size={21} />{unreadCount > 0 && <span className="nav-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}</span>
          <span>Notifications</span>
        </NavLink>
        <NavLink to={`/profile/${user.username}`} className={itemClass}><UserRound size={21} /><span>Profile</span></NavLink>
      </nav>
      <div className="side-account">
        <Avatar user={user} size="sm" />
        <div className="side-account-copy"><strong>{user.name}</strong><span>@{user.username}</span></div>
        <button className="icon-button" onClick={logout} title="Log out" aria-label="Log out"><LogOut size={18} /></button>
      </div>
    </aside>
  );
}
