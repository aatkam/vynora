import {
  Bell,
  Compass,
  Home,
  LogOut,
  UserRound
} from 'lucide-react';

import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const cls = ({ isActive }) =>
  `mobile-nav-item ${isActive ? 'active' : ''}`;

export default function MobileNav() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <nav className="mobile-nav">
      <NavLink
        to="/"
        end
        className={cls}
      >
        <Home size={21} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/explore"
        className={cls}
      >
        <Compass size={21} />
        <span>Explore</span>
      </NavLink>

      <NavLink
        to="/notifications"
        className={cls}
      >
        <span className="mobile-icon-wrap">
          <Bell size={21} />

          {unreadCount > 0 && (
            <span className="mobile-badge">
              {unreadCount > 9
                ? '9+'
                : unreadCount}
            </span>
          )}
        </span>

        <span>Alerts</span>
      </NavLink>

      <NavLink
        to={`/profile/${user.username}`}
        className={cls}
      >
        <UserRound size={21} />
        <span>Profile</span>
      </NavLink>

      <button
        type="button"
        className="mobile-nav-item mobile-logout"
        onClick={logout}
        aria-label="Log out"
      >
        <LogOut size={21} />
        <span>Logout</span>
      </button>
    </nav>
  );
}