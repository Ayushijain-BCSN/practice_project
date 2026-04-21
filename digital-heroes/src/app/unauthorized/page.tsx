"use client";

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Unauthorized() {
  return (
    <>
      <Navbar />
      <div className="container" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div className="glass-panel" style={{ padding: '64px', maxWidth: '600px' }}>
          <div style={{ fontSize: '72px', marginBottom: '24px' }}>🛡️</div>
          <h1 style={{ fontSize: '48px', marginBottom: '16px', fontWeight: '800' }}>
            Access Denied
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', marginBottom: '40px', lineHeight: '1.6' }}>
            It looks like you don't have the required administrative permissions to view this page. 
            If you believe this is an error, please contact the system administrator.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link href="/" className="primary-btn" style={{ padding: '12px 32px' }}>
              Return Home
            </Link>
            <Link href="/login" className="secondary-btn" style={{ padding: '12px 32px' }}>
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
