'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Sun, Moon, Bell, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Cookies from "js-cookie";
import styles from './Navbar.module.css';
import {
  initializeSocket,
  disconnectSocket,
  subscribeToNotifications,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../../../../utils/socketClient';

export default function Navbar({ toggleSidebar, toggleTheme, theme, user, handleLogout }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const notificationsRef = useRef(null);
  const profileMenuRef = useRef(null);

  const token = Cookies.get("token");

  // Initialize socket connection and fetch notifications
  useEffect(() => {
    console.log(user, token);
    
    if (!user || !token) return;

    // Initialize socket
    initializeSocket(token);

    // Subscribe to new notifications
    const unsubscribe = subscribeToNotifications((notification) => {
      console.log('New notification received:', notification);

      // Add new notification to the state
      setNotifications(prev => {
        // Check if this notification already exists to prevent duplicates
        const exists = prev.some(n => n._id === notification._id);
        if (exists) return prev;
        return [notification, ...prev];
      });

      // Update unread count
      setUnreadCount(prev => prev + 1);
    });

    // Fetch existing notifications
    getNotifications();

    // Cleanup on unmount
    return () => {
      unsubscribe();
      disconnectSocket();
    };
  }, [user, token]);

  // Fetch existing notifications
  const getNotifications = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching notifications...');
      const result = await fetchNotifications(token);

      if (result.success && Array.isArray(result.data)) {
        console.log('Fetched notifications:', result.data);
        setNotifications(result.data);
        
        // Count unread notifications
        const unreadNotifications = result.data.filter(n => !n.read);
        setUnreadCount(unreadNotifications.length);
      } else {
        setError(result.error || 'Failed to fetch notifications');
        console.error('Failed to fetch notifications:', result.error);
      }
    } catch (error) {
      setError('Error fetching notifications');
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleNotificationClick = async (notificationId) => {
    try {
      const result = await markNotificationAsRead(notificationId, token);

      if (result.success) {
        // Update the notification in the state
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );

        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        console.error('Error marking notification as read:', result.error);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead(token);

      if (result.success) {
        // Update all notifications in the state
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );

        // Reset unread count
        setUnreadCount(0);
      } else {
        console.error('Error marking all notifications as read:', result.error);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // View all notifications - could be implemented to navigate to a notifications page
  const viewAllNotifications = () => {
    setShowNotifications(false);
    // Implement navigation to a dedicated notifications page if needed
    // Example: router.push('/notifications');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format the notification time
  const formatNotificationTime = (date) => {
    if (!date) return '';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown time';
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.menuButton} onClick={toggleSidebar} aria-label="Toggle sidebar">
          <Menu size={20} />
        </button>
        <Link href="/" className={styles.brand}>
          <span className={styles.logo}>TaskFlow</span>
        </Link>
      </div>

      <div className={styles.right}>
        <button 
          className={styles.iconButton} 
          onClick={toggleTheme} 
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className={styles.notificationContainer} ref={notificationsRef}>
          <button
            className={styles.iconButton}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.dropdown}>
              <h3 className={styles.dropdownTitle}>Notifications</h3>
              
              {loading ? (
                <p className={styles.loadingMessage}>Loading notifications...</p>
              ) : error ? (
                <p className={styles.errorMessage}>{error}</p>
              ) : notifications.length > 0 ? (
                <ul className={styles.notificationList}>
                  {notifications.map(notification => (
                    <li
                      key={notification._id}
                      className={`${styles.notification} ${!notification.read ? styles.unread : ''}`}
                      onClick={() => handleNotificationClick(notification._id)}
                    >
                      <p>{notification.message}</p>
                      <span className={styles.time}>
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                      {notification.task && notification.task._id && (
                        <Link 
                          href={`/tasks/${notification.task._id}`} 
                          className={styles.taskLink}
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Task
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.noNotifications}>No notifications</p>
              )}
              
              <div className={styles.dropdownFooter}>
                <button 
                  onClick={markAllAsRead} 
                  className={styles.textButton}
                  disabled={loading || notifications.length === 0 || unreadCount === 0}
                >
                  Mark all as read
                </button>
                <button 
                  onClick={viewAllNotifications} 
                  className={styles.textButton}
                  disabled={loading || notifications.length === 0}
                >
                  See all
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.profileContainer} ref={profileMenuRef}>
          <button
            className={styles.profileButton}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="User profile"
          >
            <div className={styles.avatar}>
              <User size={20} />
            </div>
            <span className={styles.userName}>{user?.name || 'User'}</span>
          </button>

          {showProfileMenu && (
            <div className={styles.dropdown}>
              <div className={styles.profileInfo}>
                <p className={styles.profileName}>{user?.name || 'User'}</p>
                <p className={styles.profileEmail}>{user?.email || 'user@example.com'}</p>
                <p className={styles.profileRole}>
                  Role: {(user?.role || 'user').charAt(0).toUpperCase() + (user?.role || 'user').slice(1)}
                </p>
              </div>
              <ul className={styles.menuList}>
                <li>
                  <Link href="/profile" className={styles.menuItem}>Profile Settings</Link>
                </li>
                <li>
                  <button onClick={handleLogout} className={styles.menuItem}>Logout</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}