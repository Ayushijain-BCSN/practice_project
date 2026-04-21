'use client';
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '' });
    
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Administrative authentication failed');
      
      // Force reload to dashboard which is protected by middleware/guard
      window.location.href = '/admin';
    } catch (err: any) {
      setStatus({ loading: false, error: err.message });
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ 
        paddingTop: '120px', 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #1a1a2e 0%, #0c0c1e 100%)' 
      }} className="container">
        <div className="glass-panel" style={{ 
          padding: '48px', 
          maxWidth: '450px', 
          width: '100%', 
          height: 'fit-content',
          border: '1px solid rgba(0, 112, 243, 0.3)',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'rgba(0, 112, 243, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '1px solid var(--accent-primary)'
            }}>
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-primary)' }}>
                 <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                 <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
               </svg>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-1px' }}>Admin Console</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Security Clearance Required</p>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             {status.error && (
               <div style={{ 
                 color: '#fca5a5', 
                 padding: '16px', 
                 borderRadius: '8px',
                 background: 'rgba(239, 68, 68, 0.1)',
                 border: '1px solid rgba(239, 68, 68, 0.2)',
                 fontSize: '14px'
               }}>
                 {status.error}
               </div>
             )}
             
             <div>
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Admin Identity</label>
               <input 
                 type="email" 
                 required
                 placeholder="internal@digitalheroes.com"
                 style={{ 
                   width: '100%', 
                   padding: '14px', 
                   borderRadius: '10px', 
                   background: 'rgba(0,0,0,0.3)', 
                   color: 'white', 
                   border: '1px solid rgba(255,255,255,0.1)',
                   outline: 'none',
                   fontSize: '15px'
                 }}
                 onChange={e => setFormData({...formData, email: e.target.value})}
               />
             </div>
             
             <div>
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Access Key</label>
               <input 
                 type="password" 
                 required
                 placeholder="••••••••"
                 style={{ 
                   width: '100%', 
                   padding: '14px', 
                   borderRadius: '10px', 
                   background: 'rgba(0,0,0,0.3)', 
                   color: 'white', 
                   border: '1px solid rgba(255,255,255,0.1)',
                   outline: 'none',
                   fontSize: '15px'
                 }}
                 onChange={e => setFormData({...formData, password: e.target.value})}
               />
             </div>

             <button type="submit" className="primary-btn" disabled={status.loading} style={{ 
               marginTop: '20px',
               padding: '16px',
               fontSize: '16px',
               fontWeight: '700',
               textShadow: '0 2px 4px rgba(0,0,0,0.3)'
             }}>
               {status.loading ? 'Verifying Access...' : 'Authenticate'}
             </button>
             
             <div style={{ textAlign: 'center', marginTop: '16px' }}>
               <Link href="/login" style={{ color: 'var(--text-secondary)', fontSize: '13px', textDecoration: 'none' }}>
                 Standard User Login?
               </Link>
             </div>
          </form>
        </div>
      </div>
    </>
  );
}
