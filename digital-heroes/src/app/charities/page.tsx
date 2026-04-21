'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

export default function Charities() {
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/charities')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCharities(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: '120px', minHeight: '100vh' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>Our Charity Directory</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '48px', maxWidth: '600px' }}>
          At the core of Digital Heroes is our commitment to giving back. Discover the fantastic organizations your subscriptions fuel every single month.
        </p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <div className="shimmer" style={{ width: '100%', maxWidth: '800px', height: '20px', borderRadius: '10px' }}></div>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '40px',
            paddingBottom: '80px' 
          }}>
            {charities.map((c, i) => (
               <div key={i} className="glass-panel" style={{ 
                 overflow: 'hidden', 
                 display: 'flex', 
                 flexDirection: 'column',
                 transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease',
                 cursor: 'pointer',
                 padding: '0'
               }}
               onMouseOver={(e) => {
                 e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                 e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 112, 243, 0.2)';
               }}
               onMouseOut={(e) => {
                 e.currentTarget.style.transform = 'none';
                 e.currentTarget.style.boxShadow = 'none';
               }}>
                 <div style={{ 
                   height: '240px', 
                   backgroundImage: `url(${c.imageUrl || c.img})`, 
                   backgroundSize: 'cover', 
                   backgroundPosition: 'center',
                   position: 'relative',
                   borderBottom: '1px solid rgba(255,255,255,0.1)'
                 }}>
                   <div style={{ 
                     position: 'absolute', 
                     bottom: 0, 
                     left: 0, 
                     right: 0, 
                     height: '50%', 
                     background: 'linear-gradient(to top, rgba(10, 12, 16, 1), transparent)' 
                   }}></div>
                 </div>
                 <div style={{ padding: '32px' }}>
                   <h3 style={{ 
                     fontSize: '24px', 
                     marginBottom: '12px', 
                     fontWeight: '700',
                     letterSpacing: '-0.5px' 
                   }}>{c.name}</h3>
                   <p style={{ 
                     color: 'var(--text-secondary)', 
                     fontSize: '15px', 
                     lineHeight: '1.6', 
                     height: '72px',
                     overflow: 'hidden' 
                   }}>{c.description}</p>
                   
                   <div style={{ 
                     marginTop: '32px', 
                     paddingTop: '24px', 
                     borderTop: '1px solid rgba(255,255,255,0.05)',
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'baseline'
                   }}>
                      <div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Produced To Date</p>
                        <p style={{ 
                          fontSize: '32px', 
                          fontWeight: '800', 
                          background: 'linear-gradient(135deg, #fff 0%, var(--accent-primary) 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>${c.totalRaised?.toLocaleString() || 0}</p>
                      </div>
                      <div style={{ 
                        padding: '8px 16px', 
                        borderRadius: '20px', 
                        background: 'rgba(0, 112, 243, 0.1)', 
                        border: '1px solid rgba(0, 112, 243, 0.2)',
                        fontSize: '12px',
                        color: 'var(--accent-primary)',
                        fontWeight: '600'
                      }}>
                        Active Program
                      </div>
                   </div>
                 </div>
               </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
