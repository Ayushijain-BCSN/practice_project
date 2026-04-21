"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [userRole, setUserRole] = React.useState<'guest' | 'user' | 'admin'>('guest');
  const [isSubscribed, setIsSubscribed] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (data.authenticated) {
          setUserRole(data.user.role || 'user');
          setIsSubscribed(!!data.user.subscriptionActive);
        } else {
          setUserRole('guest');
          setIsSubscribed(false);
        }
      } catch (e) {
        setUserRole('guest');
        setIsSubscribed(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUserRole('guest');
        setIsSubscribed(false);
        router.push('/login');
        router.refresh();
      }
    } catch (e) {
      console.error('Logout failed');
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.heroText}>Digital</span>Heroes
        </Link>

        {/* Hamburger Icon */}
        <button className={styles.hamburger} onClick={toggleMenu}>
          <div className={styles.line} style={{ transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></div>
          <div className={styles.line} style={{ opacity: isMenuOpen ? 0 : 1 }}></div>
          <div className={styles.line} style={{ transform: isMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></div>
        </button>

        <nav className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksActive : ''}`}>
          {/* Main Public Links */}
          <Link href="/charities" className={styles.link} onClick={closeMenu}>Charities</Link>
          <Link href="/info" className={styles.link} onClick={closeMenu}>Info</Link>

          {/* Subscriber Specific Links */}
          {userRole === 'user' && (
            <>
              <Link href="/dashboard" className={styles.link} onClick={closeMenu}>Dashboard</Link>
              {isSubscribed && (
                <>
                  <Link href="/dashboard#scores" className={styles.link} onClick={closeMenu}>Scores</Link>
                  <Link href="/dashboard#participation" className={styles.link} onClick={closeMenu}>Participation</Link>
                </>
              )}
            </>
          )}

          {/* Admin Specific Links */}
          {userRole === 'admin' && (
            <Link href="/admin" className={styles.link} onClick={closeMenu}>Admin Portal</Link>
          )}

          <div className={styles.authButtons}>
            {userRole === 'guest' ? (
              <>
                <Link href="/admin-login" className={styles.link} style={{ padding: '8px 16px', fontSize: '14px' }} onClick={closeMenu}>Admin Login</Link>
                <Link href="/login" className="secondary-btn" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={closeMenu}>Log In</Link>
                <Link href="/signup" className="primary-btn" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={closeMenu}>Subscribe</Link>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {userRole === 'user' && (
                  <Link href="/dashboard" className={styles.link} style={{ 
                    fontSize: '13px', 
                    fontWeight: 'bold', 
                    color: isSubscribed ? 'var(--accent-primary)' : '#f87171' 
                  }}>
                    {isSubscribed ? '● Active' : '○ Pending Setup'}
                  </Link>
                )}
                <button className="secondary-btn" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={handleLogout}>Log Out</button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

