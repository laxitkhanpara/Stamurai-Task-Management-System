'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from './Navbar/Navbar';
import Sidebar from './Sidebar/Sidebar';
import styles from './Layout.module.css';
import Cookies from "js-cookie";

export default function AdminLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('light');
  const [isClient, setIsClient] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // This effect runs once to confirm we're on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // This effect handles authentication and theme, but only runs on client
  useEffect(() => {
    // Skip this effect during server-side rendering
    if (!isClient) return;

    // Check if user is authenticated
    const token = Cookies.get('token');

    if (token) {
      setIsAuthenticated(true);
    } else {
      router.push('/auth/login');
    }

    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      setTheme(defaultTheme);
      document.documentElement.setAttribute('data-theme', defaultTheme);
    }
  }, [isClient, pathname, router]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/auth/login');
  };

  // Display loading state or nothing during server-side rendering
  if (!isClient) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.layout}>
      {isAuthenticated && (
        <>
          <Navbar
            toggleSidebar={toggleSidebar}
            toggleTheme={toggleTheme}
            theme={theme}
            user={user}
            handleLogout={handleLogout}
          />
          <div className={styles.container}>
            <Sidebar
              isOpen={sidebarOpen}
              user={user}
              toggleSidebar={toggleSidebar}
            />
            <main className={`${styles.main} ${!sidebarOpen ? styles.mainExpanded : ''}`}>
              {children}
            </main>
          </div>
        </>
      )}
    </div>
  );
}