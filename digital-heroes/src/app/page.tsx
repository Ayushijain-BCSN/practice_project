import React from 'react';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Navbar />
      <div className={`${styles.heroSection} animate-fade-in`}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <div className={`${styles.badge} animate-slide-up`} style={{ animationDelay: '0.1s' }}>
              <span className={styles.badgeDot}></span> Transform Your Game, Change Lives
            </div>
            <h1 className={`${styles.headline} animate-slide-up`} style={{ animationDelay: '0.2s' }}>
              Play with <span className={styles.highlight}>Purpose.</span><br />
              Win for <span className={styles.highlight}>Good.</span>
            </h1>
            <p className={`${styles.subhead} animate-slide-up`} style={{ animationDelay: '0.3s' }}>
              Track your performance, enter the monthly draw, and drive real charitable impact. 
              Join a dynamic community of players making every stroke count.
            </p>
            <div className={`${styles.ctaGroup} animate-slide-up`} style={{ animationDelay: '0.4s' }}>
              <Link href="/signup" className="primary-btn" style={{ fontSize: '16px', padding: '16px 32px' }}>
                Join the Movement
              </Link>
              <Link href="/login" className="secondary-btn" style={{ fontSize: '16px', padding: '16px 32px' }}>
                Log In
              </Link>
            </div>
            
            <div className={`${styles.stats} animate-slide-up`} style={{ animationDelay: '0.5s' }}>
              <div className={styles.statItem}>
                <h3>$145K+</h3>
                <p>Raised for Charity</p>
              </div>
              <div className={styles.statItem}>
                <h3>12</h3>
                <p>Jackpots Won</p>
              </div>
              <div className={styles.statItem}>
                <h3>4.5K</h3>
                <p>Active Players</p>
              </div>
            </div>
          </div>
          <div className={`${styles.heroVisual} animate-fade-in`} style={{ animationDelay: '0.6s' }}>
             <div className={`${styles.visualCard} glass-panel animate-pulse-subtle`}>
                <h3>Next Draw</h3>
                <div className={styles.countdown}>14d : 08h : 22m</div>
                <div className={styles.prizePool}>
                   Current Pool: <span className="shimmer-text">$24,500</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
