'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

export default function Draws() {
  const [draw, setDraw] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/draws')
      .then(res => res.json())
      .then(data => {
        if (data.success) setDraw(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: '120px', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1 style={{ fontSize: '56px', marginBottom: '16px', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>The Monthly Draw</h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Every month, active subscribers are entered using their latest 5 rolling Stableford scores. Match all 5 numbers to win the jackpot!
          </p>
        </div>

        {loading ? <p style={{textAlign: 'center'}}>Loading Draw status from database...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '48px' }}>
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
               <h3 style={{ textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Current Pool Status</h3>
               <div style={{ fontSize: '48px', fontWeight: '800', color: '#f59e0b', marginBottom: '32px' }}>
                 ${draw?.totalPrizePool?.toLocaleString() || 0}
               </div>
               
               <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>5-Match Jackpot (40%)</p>
                  <div style={{ fontSize: '24px', fontWeight: '600' }}>
                    ${(draw?.totalPrizePool * 0.40).toLocaleString() || 0} + Rollover
                  </div>
               </div>
               
               <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>4-Match Split (35%)</p>
                  <div style={{ fontSize: '24px', fontWeight: '600' }}>
                     ${(draw?.totalPrizePool * 0.35).toLocaleString() || 0}
                  </div>
               </div>
               
               <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>3-Match Split (25%)</p>
                  <div style={{ fontSize: '24px', fontWeight: '600' }}>
                     ${(draw?.totalPrizePool * 0.25).toLocaleString() || 0}
                  </div>
               </div>
            </div>
            
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Previous Winners</h2>
              <div className="glass-panel" style={{ padding: '0' }}>
                 <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                   <thead>
                     <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                       <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Player</th>
                       <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Matches</th>
                       <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Prize Won</th>
                       <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Verification</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr>
                       <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Alex M.</td>
                       <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><span style={{ color: '#10b981' }}>5 Numbers</span></td>
                       <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold' }}>$8,400</td>
                       <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                         <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Verified</span>
                       </td>
                     </tr>
                     <tr>
                       <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Sarah T.</td>
                       <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>4 Numbers</td>
                       <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold' }}>$1,200</td>
                       <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                         <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Verified</span>
                       </td>
                     </tr>
                     <tr>
                       <td style={{ padding: '16px' }}>John D.</td>
                       <td style={{ padding: '16px' }}>4 Numbers</td>
                       <td style={{ padding: '16px', fontWeight: 'bold' }}>$1,200</td>
                       <td style={{ padding: '16px' }}>
                         <span style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Pending Admin</span>
                       </td>
                     </tr>
                   </tbody>
                 </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
