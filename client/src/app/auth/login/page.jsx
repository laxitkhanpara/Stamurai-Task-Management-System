'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../Auth.module.css';
import { useDispatch } from 'react-redux';
import { login } from '../../../store/thunks/authThunk';
import Image from 'next/image';
export default function Login() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const result = await dispatch(login(formData)).unwrap();
      if (result) {
        router.push('/admin');
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
          <Image
            src="/logo.svg"
            alt="Logo"
            width={160}
            height={80}
            className={styles.logo} 
          />
          <hr className={styles.divider} />
          <h1 className={styles.authTitle}>Welcome Back</h1>
          <p className={styles.authSubtitle}>Sign in to your account</p>
        </div>

        {apiError && (
          <div className={styles.alertError}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm}>
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
            <div className={styles.formLabelWithLink}>
              <label htmlFor="password" className={styles.formLabel}>Password</label>
              <Link href="/auth/forgot-password" className={styles.formLink}>
                Forgot password?
              </Link>
            </div>
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

          <button
            type="submit"
            className={styles.authButton}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Don't have an account?{' '}
            <Link href="/auth/register" className={styles.formLink}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}