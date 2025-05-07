'use client';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';

const images = [
  '/embrace-tough-situations.svg',
  '/learn-how-to-fight-stuttering.svg',
  '/express-feelings-with-confidence.svg',
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % images.length);
        setFadeIn(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <img src="/logo.svg" alt="Stamurai" className={styles.logo} />
        </div>
        <nav className={styles.nav}>
          <a href="/auth/login">Features</a>
          <a href="/auth/login">About</a>
          <a href="/auth/login">Contact</a>
          <Link href="/auth/login" className={styles.loginButton}>Login</Link>
        </nav>
      </header>

      <main>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.left}>
              <h1 className={styles.h1}>Transform Task Management <span className={styles.highlight}>Effortlessly</span></h1>
              <p className={styles.subheading}>
                Streamline your workflow, boost productivity, and organize your team with our intuitive task management platform
              </p>
              <div className={styles.quote}>
                <blockquote className={styles.quoteText}>"Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort."</blockquote>
                <cite className={styles.quoteCite}>— Paul J. Meyer</cite>
              </div>
              <div className={styles.buttons}>
                <Link href="/auth/register" className={styles.primaryButton}>
                  Register
                </Link>
                <Link href="/admin" className={styles.secondaryButton}>
                  Manage Tasks
                </Link>
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.imageContainer}>
                <img
                  key={images[current]}
                  src={images[current]}
                  alt="Task management illustration"
                  className={`${styles.animatedImage} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}
                />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.featuresSection} id="features">
          <h2 className={styles.sectionHeading}>Why Choose <span className={styles.highlight}>Stamurai</span> Task Management</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📋</div>
              <h3 className={styles.featureTitle}>Intuitive Organization</h3>
              <p className={styles.featureDesc}>Sort and prioritize tasks with our drag-and-drop interface</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>👥</div>
              <h3 className={styles.featureTitle}>Team Collaboration</h3>
              <p className={styles.featureDesc}>Assign tasks, share updates, and track progress together</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3 className={styles.featureTitle}>Performance Analytics</h3>
              <p className={styles.featureDesc}>Visualize productivity metrics and identify bottlenecks</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⏰</div>
              <h3 className={styles.featureTitle}>Time Management</h3>
              <p className={styles.featureDesc}>Set deadlines, reminders, and track time spent on tasks</p>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaHeading}>Ready to boost your productivity?</h2>
            <p className={styles.ctaSubheading}>Join thousands of satisfied users who have transformed their workflow</p>
            <Link href="/auth/signup" className={styles.ctaButton}>
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <img src="/logo-dark.svg" alt="Stamurai" className={styles.footerLogoImg} />
            <p>Simplifying task management since 2023</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerLinkColumn}>
              <h4 className={styles.footerHeading}>Product</h4>
              <a href="#features" className={styles.footerLink}>Features</a>
              <a href="#pricing" className={styles.footerLink}>Pricing</a>
              <a href="#roadmap" className={styles.footerLink}>Roadmap</a>
            </div>
            <div className={styles.footerLinkColumn}>
              <h4 className={styles.footerHeading}>Company</h4>
              <a href="#about" className={styles.footerLink}>About Us</a>
              <a href="#careers" className={styles.footerLink}>Careers</a>
              <a href="#contact" className={styles.footerLink}>Contact</a>
            </div>
            <div className={styles.footerLinkColumn}>
              <h4 className={styles.footerHeading}>Resources</h4>
              <a href="#blog" className={styles.footerLink}>Blog</a>
              <a href="#support" className={styles.footerLink}>Support</a>
              <a href="#docs" className={styles.footerLink}>Documentation</a>
            </div>
          </div>
        </div>
        <div className={styles.copyright}>
          © {new Date().getFullYear()} Stamurai. All rights reserved.
        </div>
      </footer>
    </div>
  );
}