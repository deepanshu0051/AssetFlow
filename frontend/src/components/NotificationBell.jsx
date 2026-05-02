import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import apiService from '../services/api';
import { useNotification } from '../context/NotificationContext';
import './NotificationBell.css';

const NotificationBell = () => {
  const { togglePanel } = useNotification();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await apiService.getNotifications();
      if (res.success) {
        const count = res.data.filter(n => !n.isRead).length;
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="notification-bell-container" onClick={togglePanel}>
      <div className={`bell-icon-container ${unreadCount > 0 ? 'has-notifications' : ''}`}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount}</span>
        )}
      </div>
    </div>
  );
};

export default NotificationBell;
