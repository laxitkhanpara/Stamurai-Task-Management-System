"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../Auth.module.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      // In a real app, this would be your API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      if (data.success) {
        // Redirect to login page
        router.push('/auth/login?registered=true');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Create Account</h1>
          <p className={styles.authSubtitle}>Sign up to get started</p>
        </div>
        
        {apiError && (
          <div className={styles.alertError}>
            {apiError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
              placeholder="John Doe"
              disabled={isLoading}
            />
            {errors.name && <p className={styles.formError}>{errors.name}</p>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
              placeholder="your@email.com"
              disabled={isLoading}
            />
            {errors.email && <p className={styles.formError}>{errors.email}</p>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.formInput} ${errors.password ? styles.inputError : ''}`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.password && <p className={styles.formError}>{errors.password}</p>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`${styles.formInput} ${errors.confirmPassword ? styles.inputError : ''}`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.confirmPassword && <p className={styles.formError}>{errors.confirmPassword}</p>}
          </div>
          
          <button
            type="submit"
            className={styles.authButton}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
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