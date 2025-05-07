'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, ChevronLeft, LayoutDashboard, CheckSquare, Clock, Users, Settings, PieChart } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar({ isOpen, user, toggleSidebar }) {
  // Remove console.log to prevent unnecessary rerenders
  // console.log('user', user);

  const pathname = usePathname();
  const prevUserRole = useRef(null);

  // Memoize menu items based on user role
  const menuItems = useMemo(() => {
    if (!user?.data) return [];

    const currentUserRole = user?.data?.role || 'user';

    // If role hasn't changed, return previous items
    if (prevUserRole.current === currentUserRole) {
      return prevUserRole.currentItems || [];
    }

    prevUserRole.current = currentUserRole;

    // Base menu items for all users
    const baseItems = [
      {
        name: 'Dashboard',
        icon: <LayoutDashboard size={20} />,
        href: '/admin',
        allowedRoles: ['user', 'manager', 'admin']
      },
      {
        name: 'My Tasks',
        icon: <CheckSquare size={20} />,
        href: '/admin/TaskManage',
        allowedRoles: ['user', 'manager', 'admin']
      }
    ];

    // Additional items based on user role
    const roleSpecificItems = [];
    if (currentUserRole === 'admin') {
      roleSpecificItems.push({
        name: 'Users',
        icon: <Users size={20} />,
        href: '/admin/users',
        allowedRoles: ['admin']
      });
    }

    // Filter menu items based on user role
    const filteredItems = [...baseItems, ...roleSpecificItems].filter(item =>
      item.allowedRoles.includes(currentUserRole)
    );

    // Store the current items for future reference
    prevUserRole.currentItems = filteredItems;
    return filteredItems;
  }, [user?.data?.role]);

  // Memoize the isActive function
  const isActive = useMemo(() => {
    return (href) => {
      if (href === '/admin' && pathname === '/admin') {
        return true;
      }
      return pathname === href || (pathname?.startsWith(href) && href !== '/admin');
    };
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={toggleSidebar} />
      )}
      <nav className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          {isOpen && <h2 className={styles.sidebarTitle}>Stamurai</h2>}
          <button className={styles.toggleButton} onClick={toggleSidebar} aria-label="Toggle sidebar">
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        <ul className={styles.menu}>
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`${styles.menuItem} ${isActive(item.href) ? styles.active : ''}`}
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