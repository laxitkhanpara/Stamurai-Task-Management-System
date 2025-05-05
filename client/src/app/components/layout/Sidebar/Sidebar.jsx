// components/layout/Sidebar.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, LayoutDashboard, CheckSquare, Clock, Users, Settings, PieChart } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar({ isOpen, user, toggleSidebar }) {
  const router = useRouter();
  const pathname = router.asPath;
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    // Base menu items for all users
    const baseItems = [
      {
        name: 'Dashboard',
        icon: <LayoutDashboard size={20} />,
        href: '/dashboard',
        allowedRoles: ['user', 'manager', 'admin']
      },
      {
        name: 'My Tasks',
        icon: <CheckSquare size={20} />,
        href: '/admin/TaskManage',
        allowedRoles: ['user', 'manager', 'admin']
      },
      {
        name: 'Team Tasks',
        icon: <Users size={20} />,
        href: '/tasks/team-tasks',
        allowedRoles: ['user', 'manager', 'admin']
      },
    ];

    // Additional items based on user role
    const roleSpecificItems = [];

    if (user && (user.role === 'admin' || user.role === 'manager')) {
      roleSpecificItems.push({
        name: 'Team Management',
        icon: <Users size={20} />,
        href: '/team',
        allowedRoles: ['manager', 'admin']
      });
    }

    if (user && user.role === 'admin') {
      roleSpecificItems.push({
        name: 'Analytics',
        icon: <PieChart size={20} />,
        href: '/analytics',
        allowedRoles: ['admin']
      });

      roleSpecificItems.push({
        name: 'Settings',
        icon: <Settings size={20} />,
        href: '/settings',
        allowedRoles: ['admin']
      });
    }

    // Filter menu items based on user role
    const userRole = user?.role || 'user';
    const filteredItems = [...baseItems, ...roleSpecificItems].filter(item =>
      item.allowedRoles.includes(userRole)
    );

    setMenuItems(filteredItems);
  }, [user]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={toggleSidebar} />
      )}

      <nav className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          {isOpen && <h2 className={styles.sidebarTitle}>Navigation</h2>}
          <button className={styles.toggleButton} onClick={toggleSidebar}>
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <ul className={styles.menu}>
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`${styles.menuItem} ${router.pathname === item.href || router.pathname?.startsWith(`${item.href}/`)
                  ? styles.active
                  : ''
                  }`}
              >
                <span className={styles.icon}>{item.icon}</span>
                {isOpen && <span className={styles.text}>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}