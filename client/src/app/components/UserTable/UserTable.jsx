'use client';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './UserTable.module.css';
import UserForm from '../UserForm/UserForm';
import { getUsers, deleteUserById, updateUserById } from '../../../store/thunks/userThunk';

const UserTable = () => {
  const dispatch = useDispatch();
  const { items: users, isLoading, error } = useSelector((state) => state.user);
  console.log('UserTable', users);

  const currentUser = useSelector((state) => state.user?.currentUser);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');

  // Use a ref to track if we've already fetched
  const [hasFetchedUsers, setHasFetchedUsers] = useState(false);
  const initialFetchRef = useRef(false);

  useEffect(() => {
    // Only fetch if we have a current user, haven't fetched yet, and there are no users in the store
    if (currentUser && !initialFetchRef.current && (!users || users.length === 0)) {
      console.log("Initial fetch of users...");
      initialFetchRef.current = true;

      dispatch(getUsers())
        .unwrap()
        .then(() => {
          setHasFetchedUsers(true);
        })
        .catch(error => {
          console.error('Failed to fetch users:', error);
          initialFetchRef.current = false;
        });
    }
  }, [dispatch, currentUser?._id, users]);

  // Reset fetch state when user changes
  useEffect(() => {
    if (currentUser?._id) {
      initialFetchRef.current = false;
    }
  }, [currentUser?._id]);

  const handleUserUpdate = (updatedUser) => {
    console.log("handleUserUpdate:", updatedUser);
    
    dispatch(updateUserById({ id: updatedUser._id, userData: updatedUser }))
      .unwrap()
      .then(() => {
        closeAllModals();
        // No need to refresh the list as the state is already updated by the reducer
      })
      .catch(error => {
        console.error('Failed to update user:', error);
      });
  };

  const handleUserDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUserById(userId))
        .unwrap()
        .then(() => {
          closeAllModals();
          // No need to refresh the list as the state is already updated by the reducer
        })
        .catch(error => {
          console.error('Failed to delete user:', error);
        });
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditingUser(true);
    setShowUserForm(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditingUser(false);
    setShowUserForm(true);
  };

  const closeAllModals = () => {
    setShowUserForm(false);
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Add a safety check for users array
  const userList = Array.isArray(users) ? users : [];

  // Filter users based on search query and role filter
  const filteredUsers = userList.filter(user => {
    if (!user) return false;

    const matchesSearch =
      (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Sort users by name
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!a.name) return 1;
    if (!b.name) return -1;
    return a.name.localeCompare(b.name);
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return styles.roleAdmin;
      case 'manager':
        return styles.roleManager;
      default:
        return styles.roleUser;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.searchAndAddContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
            />
            <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          <button
            className={styles.addUserButton}
            onClick={handleCreateUser}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New User
          </button>
        </div>

        <div className={styles.filterControls}>
          <div className={styles.filterGroup}>
            <label htmlFor="roleFilter">Role:</label>
            <select
              id="roleFilter"
              className={styles.select}
              value={roleFilter}
              onChange={handleRoleFilter}
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading users...</p>
        </div>
      ) : error ? (
        <div className={styles.error}>{typeof error === 'object' ? JSON.stringify(error) : error}</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className={styles.noUsers}>
                    <div className={styles.emptyState}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <p>No users found</p>
                      <button onClick={handleCreateUser} className={styles.emptyStateButton}>
                        Create a new user
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedUsers.map(user => (
                  <tr key={user._id} className={styles.userRow}>
                    <td className={styles.userName}>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${getRoleColor(user.role)}`}>
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        className={`${styles.actionButton} ${styles.editButton}`}
                        onClick={() => handleEditUser(user)}
                        aria-label="Edit user"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this user?')) {
                            handleUserDelete(user._id);
                          }
                        }}
                        aria-label="Delete user"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* User Form Modal */}
      {showUserForm && (
        <div className={styles.modalBackdrop} onClick={closeAllModals}>
          <div
            className={`${styles.modalContent} ${styles.formModalContent}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              onClick={closeAllModals}
              aria-label="Close form"
            >
              &times;
            </button>
            <UserForm
              initialValues={isEditingUser ? selectedUser : {}}
              isEditing={isEditingUser}
              onClose={closeAllModals}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;