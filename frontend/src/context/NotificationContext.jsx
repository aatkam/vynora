import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.unreadCount || 0);
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    refreshUnread();
    if (!user) return undefined;

    const timer = window.setInterval(refreshUnread, 30000);
    const listener = () => refreshUnread();
    window.addEventListener('vynora:notifications-changed', listener);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('vynora:notifications-changed', listener);
    };
  }, [refreshUnread, user]);

  const value = useMemo(
    () => ({ unreadCount, setUnreadCount, refreshUnread }),
    [unreadCount, refreshUnread]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => useContext(NotificationContext);
