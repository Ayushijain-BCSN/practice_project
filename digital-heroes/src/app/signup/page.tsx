'use client';
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: false });

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sign up');
      
      setStatus({ loading: false, error: '', success: true });
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      setStatus({ loading: false, error: err.message, success: false });
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '120px', minHeight: '100vh', display: 'flex', justifyContent: 'center' }} className="container">
        <div className="glass-panel" style={{ padding: '48px', maxWidth: '480px', width: '100%' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '32px' }}>
            <Link href="/login" style={{ 
              flex: 1, textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', 
              textDecoration: 'none', transition: 'color 0.2s' 
            }} onMouseOver={(e) => e.currentTarget.style.color = 'white'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Login</Link>
            <Link href="/signup" style={{ 
              flex: 1, textAlign: 'center', padding: '12px', color: 'white', 
              borderBottom: '2px solid var(--accent-primary)', textDecoration: 'none',
              fontWeight: '600'
            }}>Sign Up</Link>
          </div>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Join the Movement</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Start tracking, start helping.</p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             {status.error && <div style={{ color: '#ef4444', padding: '12px', background: 'rgba(239, 68, 68, 0.1)' }}>{status.error}</div>}
             {status.success && <div style={{ color: '#10b981', padding: '12px', background: 'rgba(16, 185, 129, 0.1)' }}>Success! Redirecting...</div>}
             <div>
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Full Name</label>
               <input 
                 type="text" required
                 style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                 onChange={e => setFormData({...formData, fullName: e.target.value})}
               />
             </div>
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
             
             <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginTop: '8px' }}>
                <p style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-secondary)' }}>Subscription Plan</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="radio" checked readOnly/> $15 / Month (10% to Charity)
                </label>
             </div>

             <button type="submit" className="primary-btn" disabled={status.loading} style={{ marginTop: '16px' }}>
               {status.loading ? 'Creating...' : 'Subscribe & Sign Up'}
             </button>
          </form>
        </div>
      </div>
    </>
  );
}
