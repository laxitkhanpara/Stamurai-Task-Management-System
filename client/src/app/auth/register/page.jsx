"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../Auth.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../../store/thunks/authThunk';
import { toast } from 'react-toastify';
import Image from 'next/image';

export default function Register() {
  const dispatch = useDispatch();
  const router = useRouter();
  
  // Get auth state from Redux
  const { loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  
  // Monitor Redux state changes
  useEffect(() => {
    // Show error toast if there's an error from Redux
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }
    
    try {
      // Dispatch registration action and handle response
      const resultAction = await dispatch(register(formData)).unwrap();
      
      // If successful, show success toast and redirect
      toast.success("Registration successful! Redirecting to dashboard...");
      
      // Wait a moment before redirecting to allow the user to see the success message
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (err) {
      // Error handling is now done through the useEffect watching for Redux state changes
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
        <Image
            src="/logo.svg"
            alt="Logo"
            width={160}
            height={80}
            className={styles.logo} // Optional styling
          />
          <hr className={styles.divider} />

          <h1 className={styles.authTitle}>Create Account</h1>
          <p className={styles.authSubtitle}>Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`${styles.formInput} ${validationErrors.name ? styles.inputError : ''}`}
              placeholder="John Doe"
              disabled={loading}
            />
            {validationErrors.name && <p className={styles.formError}>{validationErrors.name}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${styles.formInput} ${validationErrors.email ? styles.inputError : ''}`}
              placeholder="your@email.com"
              disabled={loading}
            />
            {validationErrors.email && <p className={styles.formError}>{validationErrors.email}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.formInput} ${validationErrors.password ? styles.inputError : ''}`}
              placeholder="••••••••"
              disabled={loading}
            />
            {validationErrors.password && <p className={styles.formError}>{validationErrors.password}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`${styles.formInput} ${validationErrors.confirmPassword ? styles.inputError : ''}`}
              placeholder="••••••••"
              disabled={loading}
            />
            {validationErrors.confirmPassword && <p className={styles.formError}>{validationErrors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            className={styles.authButton}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Already have an account?{' '}
            <Link href="/auth/login" className={styles.formLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}