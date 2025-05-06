'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './Navbar/Navbar';
import Sidebar from './Sidebar/Sidebar';
import styles from './layout.module.css';
import Cookies from "js-cookie";
import { fetchCurrentUser } from '../../../store/thunks/userThunk';

export default function AdminLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('light');
  const [isClient, setIsClient] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const dispatch = useDispatch();
  const { currentUser, loading } = useSelector((state) => state.user);
  const pathname = usePathname();
  const router = useRouter();
  
  // Create a ref to track if we've already fetched the current user
  const userFetched = useRef(false);

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

    if (!token) {
      router.push('/auth/login');
      return;
    }

    setIsAuthenticated(true);
    
    // Fetch current user if not already loaded and not currently loading
    if (!currentUser && !userFetched.current) {
      userFetched.current = true;
      
      const fetchUser = async () => {
        try {
          setLocalLoading(true);
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          console.error("Failed to fetch user:", error);
          Cookies.remove('token');
          router.push('/auth/login');
        } finally {
          setLocalLoading(false);
        }
      };
      
      fetchUser();
    } else {
      setLocalLoading(false);
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
  }, [isClient, dispatch, router, currentUser]);

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
    Cookies.remove('token');
    localStorage.removeItem('theme');
    setIsAuthenticated(false);
    router.push('/auth/login');
  };

  // Display loading state or nothing during server-side rendering
  if (!isClient || loading || localLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  // Safety check - if we're authenticated but have no user data, show loading
  if (isAuthenticated && !currentUser) {
    return <div className={styles.loading}>Loading user data...</div>;
  }

  return (
    <div className={styles.layout}>
      {isAuthenticated && currentUser && (
        <>
          <Navbar
            toggleSidebar={toggleSidebar}
            toggleTheme={toggleTheme}
            theme={theme}
            user={currentUser.data}
            handleLogout={handleLogout}
          />
          <div className={styles.container}>
            <Sidebar
              isOpen={sidebarOpen}
              user={currentUser}
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