'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserById, addUser } from '../../../store/thunks/userThunk';
import styles from './UserForm.module.css';

const UserForm = ({ initialValues = {}, isEditing = false, onClose }) => {
  const dispatch = useDispatch();
  const [userData, setuserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    ...initialValues
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setuserData({
      ...userData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!userData.name) {
      newErrors.name = 'Name is required';
    }
    if (!userData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!isEditing && !userData.password) {
      newErrors.password = 'Password is required';
    } else if (!isEditing && userData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        console.log("isEditing", initialValues);
        await dispatch(updateUserById({ id: initialValues._id, userData })).unwrap();
      } else {
        await dispatch(addUser(userData)).unwrap();
      }
      if (onClose) onClose();
    } catch (error) {
      console.error('Error submitting user:', error);
      setErrors({
        ...errors,
        submit: error.message || 'Failed to submit user'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.formTitle}>
        {isEditing ? 'Edit User' : 'Create New User'}
      </h2>

      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>
          Name <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={userData.name}
          onChange={handleChange}
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          placeholder="Enter user's name"
          disabled={isSubmitting}
        />
        {errors.name && <span className={styles.error}>{errors.name}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email <span className={styles.required}>*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={userData.email}
          onChange={handleChange}
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          placeholder="Enter user's email"
          disabled={isSubmitting}
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>

      {!isEditing && (
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Password <span className={styles.required}>*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            placeholder="Enter password"
            disabled={isSubmitting}
          />
          {errors.password && <span className={styles.error}>{errors.password}</span>}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="role" className={styles.label}>
          Role <span className={styles.required}>*</span>
        </label>
        <select
          id="role"
          name="role"
          value={userData.role}
          onChange={handleChange}
          className={`${styles.select} ${errors.role ? styles.inputError : ''}`}
          disabled={isSubmitting}
        >
          <option value="user">User</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && <span className={styles.error}>{errors.role}</span>}
      </div>

      {errors.submit && (
        <div className={styles.submitError}>
          {errors.submit}
        </div>
      )}

      <div className={styles.formActions}>
        <button
          type="button"
          onClick={onClose}
          className={styles.cancelButton}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
