"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (data.authenticated && data.user.role === 'admin') {
          setAuthorized(true);
        } else if (data.authenticated) {
          router.push('/unauthorized');
        } else {
          router.push('/admin-login');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        router.push('/admin-login');
      }
    };

    checkAuth();
  }, [router]);

  if (authorized === null) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#0a0c10',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-pulse" style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            🛡️ Verifying Admin Access...
          </div>
          <div style={{ color: '#64748b' }}>Please wait while we secure your session.</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
