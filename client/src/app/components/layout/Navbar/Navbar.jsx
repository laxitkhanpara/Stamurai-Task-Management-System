// components/layout/Navbar.js
'use client';
import { useState, useRef, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Sun, Moon, Bell, User } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar({ toggleSidebar, toggleTheme, theme, user, handleLogout }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationsRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Simulate fetching notifications (would connect to WebSocket in a real app)
  useEffect(() => {
    // Mock notifications data
    const mockNotifications = [
      { id: 1, message: 'You have been assigned a new task', read: false, time: '10m ago' },
      { id: 2, message: 'Task "Project Report" is due tomorrow', read: false, time: '1h ago' },
      { id: 3, message: 'John commented on "Website Design"', read: true, time: '3h ago' }
    ];
    setNotifications(mockNotifications);
  }, []);

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

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.menuButton} onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <Link href="/" className={styles.brand}>
          <span className={styles.logo}>TaskFlow</span>
        </Link>
      </div>

      <div className={styles.right}>
        <button className={styles.iconButton} onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className={styles.notificationContainer} ref={notificationsRef}>
          <button 
            className={styles.iconButton} 
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className={styles.badge}>{notifications.filter(n => !n.read).length}</span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.dropdown}>
              <h3 className={styles.dropdownTitle}>Notifications</h3>
              {notifications.length > 0 ? (
                <ul className={styles.notificationList}>
                  {notifications.map(notification => (
                    <li 
                      key={notification.id} 
                      className={`${styles.notification} ${!notification.read ? styles.unread : ''}`}
                    >
                      <p>{notification.message}</p>
                      <span className={styles.time}>{notification.time}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.noNotifications}>No notifications</p>
              )}
              <div className={styles.dropdownFooter}>
                <button className={styles.textButton}>Mark all as read</button>
                <button className={styles.textButton}>See all</button>
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
              {/* Use a placeholder or user initial if no image */}
              <User size={20} />
            </div>
            <span className={styles.userName}>{user?.name || 'User'}</span>
          </button>

          {showProfileMenu && (
            <div className={styles.dropdown}>
              <div className={styles.profileInfo}>
                <p className={styles.profileName}>{user?.name || 'User'}</p>
                <p className={styles.profileEmail}>{user?.email || 'user@example.com'}</p>
                <p className={styles.profileRole}>Role: {(user?.role || 'user').charAt(0).toUpperCase() + (user?.role || 'user').slice(1)}</p>
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