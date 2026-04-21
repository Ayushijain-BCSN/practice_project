'use client';
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '' });
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to login');
      
      window.location.href = '/dashboard';
    } catch (err: any) {
      setStatus({ loading: false, error: err.message });
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '120px', minHeight: '100vh', display: 'flex', justifyContent: 'center' }} className="container">
        <div className="glass-panel" style={{ padding: '48px', maxWidth: '400px', width: '100%', height: 'fit-content' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '32px' }}>
            <Link href="/login" style={{ 
              flex: 1, textAlign: 'center', padding: '12px', color: 'white', 
              borderBottom: '2px solid var(--accent-primary)', textDecoration: 'none',
              fontWeight: '600'
            }}>Login</Link>
            <Link href="/signup" style={{ 
              flex: 1, textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', 
              textDecoration: 'none', transition: 'color 0.2s' 
            }} onMouseOver={(e) => e.currentTarget.style.color = 'white'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Sign Up</Link>
          </div>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Log in to your Digital Heroes account.</p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             {status.error && <div style={{ color: '#ef4444', padding: '12px', background: 'rgba(239, 68, 68, 0.1)' }}>{status.error}</div>}
             <div>
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Email</label>
               <input 
                 type="email" required
                 style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                 onChange={e => setFormData({...formData, email: e.target.value})}
               />
             </div>
             <div>
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Password</label>
               <input 
                 type="password" required
                 style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                 onChange={e => setFormData({...formData, password: e.target.value})}
               />
             </div>

             <button type="submit" className="primary-btn" disabled={status.loading} style={{ marginTop: '16px' }}>
               {status.loading ? 'Authenticating...' : 'Sign In'}
             </button>
             
             <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Don't have an account? <Link href="/signup" style={{ color: 'var(--accent-primary)' }}>Subscribe here</Link>
             </p>
          </form>
        </div>
      </div>
    </>
  );
}
