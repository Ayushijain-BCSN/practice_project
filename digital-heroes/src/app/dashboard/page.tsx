"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

export default function Dashboard() {
  const [scores, setScores] = useState<any[]>([]);
  const [newScore, setNewScore] = useState('');
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Profile & subscription state
  const [profile, setProfile] = useState<any>(null);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  // Charity modal state
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [charities, setCharities] = useState<any[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState('');
  const [charityPercentage, setCharityPercentage] = useState('10');
  const [savingCharity, setSavingCharity] = useState(false);

  // Winnings state
  const [winnings, setWinnings] = useState<any[]>([]);

  const searchParams = useSearchParams();
  const wasCanceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    fetchProfile();
    fetchScores();
    fetchWinnings();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setSubscriptionActive(data.data.subscription?.status === 'active');
        if (data.data.charity) setSelectedCharityId(data.data.charity._id);
        if (data.data.charityPercentage) setCharityPercentage(String(data.data.charityPercentage));
      } else {
        setSubscriptionActive(false);
      }
    } catch (e) {
      console.error(e);
      setSubscriptionActive(false);
    }
  };

  const fetchScores = async () => {
    try {
      const res = await fetch('/api/scores');
      const data = await res.json();
      if (data.success) {
        setScores(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchWinnings = async () => {
    try {
      const res = await fetch('/api/user/verify-win');
      const data = await res.json();
      if (data.success) {
        setWinnings(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitScore = async () => {
    if (!newScore || !newDate) return alert('Please enter score and date');
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: newScore, datePlayed: newDate })
      });
      const data = await res.json();
      if (data.success) {
        setNewScore('');
        setNewDate('');
        fetchScores();
      } else {
        alert(data.error || 'Failed to save score');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubscribe = async (plan: string) => {
    setSubscribing(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout');
      }
    } catch (e) {
      alert('Subscription checkout failed');
    } finally {
      setSubscribing(false);
    }
  };

  const openCharityModal = async () => {
    try {
      const res = await fetch('/api/charities');
      const data = await res.json();
      if (data.success) setCharities(data.data);
    } catch (e) {
      console.error(e);
    }
    setShowCharityModal(true);
  };

  const saveCharity = async () => {
    if (!selectedCharityId) return alert('Please select a charity');
    if (Number(charityPercentage) < 10) return alert('Minimum contribution is 10%');
    setSavingCharity(true);
    try {
      const res = await fetch('/api/user/charity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charityId: selectedCharityId, percentage: Number(charityPercentage) })
      });
      const data = await res.json();
      if (data.success) {
        alert('Charity preference saved!');
        setShowCharityModal(false);
        fetchProfile();
      } else {
        alert(data.error || 'Failed to save');
      }
    } catch (e) {
      alert('Failed to save charity preference');
    } finally {
      setSavingCharity(false);
    }
  };

  const uploadProof = async (entryId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('entryId', entryId);
      formData.append('proof', file);
      try {
        const res = await fetch('/api/user/verify-win', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          alert('Proof uploaded successfully! Admin will review soon.');
          fetchWinnings();
        } else {
          alert(data.error || 'Upload failed');
        }
      } catch (err) {
        alert('Upload failed');
      }
    };
    input.click();
  };

  // Loading state — prevents full dashboard flash before subscription is confirmed
  if (subscriptionActive === null) {
    return (
      <>
        <Navbar />
        <div className={`container ${styles.dashboardLayout}`} style={{ textAlign: 'center', paddingTop: '120px' }}>
          <div style={{ fontSize: '18px', color: '#64748b' }}>⏳ Loading your dashboard...</div>
        </div>
      </>
    );
  }

  // Subscription guard overlay
  if (subscriptionActive === false) {
    return (
      <>
        <Navbar />
        <div className={`container ${styles.dashboardLayout}`}>
          <div className={styles.dashboardHeader}>
            <h2>Player Dashboard</h2>
          </div>
          {wasCanceled && (
            <div style={{
              padding: '16px',
              marginBottom: '24px',
              borderRadius: '10px',
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              color: '#fbbf24',
              fontSize: '14px'
            }}>
              ⚠️ Subscription checkout was cancelled. You can subscribe anytime below.
            </div>
          )}
          <div className={styles.card} style={{ textAlign: 'center', padding: '60px 32px' }}>
            <h3 style={{ fontSize: '28px', marginBottom: '16px' }}>🔒 Subscription Required</h3>
            <p style={{ color: '#94a3b8', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
              You need an active subscription to access the dashboard, enter scores, and participate in draws.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="primary-btn" onClick={() => handleSubscribe('month')} disabled={subscribing}>
                {subscribing ? 'Redirecting...' : '📅 Subscribe Monthly'}
              </button>
              <button className="secondary-btn" onClick={() => handleSubscribe('year')} disabled={subscribing}>
                {subscribing ? 'Redirecting...' : '🎯 Subscribe Yearly (Save 15%)'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={`container ${styles.dashboardLayout} animate-fade-in`}>
        <div className={styles.dashboardHeader}>
          <h2>Player Dashboard</h2>
          <div className="secondary-btn" style={{ backgroundColor: subscriptionActive ? '#10b981' : '#ef4444', border: 'none' }}>
            {subscriptionActive ? '✅ Subscription Active' : '❌ No Subscription'}
            {profile?.subscription?.planInterval ? ` (${profile.subscription.planInterval}ly)` : ''}
          </div>
        </div>

        <div className={styles.dashboardGrid}>
          {/* Main Column */}
          <div className={`${styles.mainCol} animate-slide-up`} style={{ animationDelay: '0.1s' }}>
            <div className={styles.card} id="scores">
              <h3 className={styles.cardTitle}>Your Latest Scores (Stableford)</h3>
              <p style={{color: '#94a3b8', fontSize: '14px', marginBottom: '16px'}}>
                Only your 5 most recent scores are kept. Entering a new score will replace the oldest one.
              </p>
              
              <div className={styles.scoreList}>
                {loading ? <p>Loading scores...</p> : scores.length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>No scores yet. Submit your first score below!</p>
                ) : scores.map(s => (
                  <div key={s._id} className={styles.scoreRow}>
                    <span>{new Date(s.datePlayed).toLocaleDateString()}</span>
                    <span className={styles.scoreVal}>{s.score} pts</span>
                  </div>
                ))}
              </div>

              <div style={{marginTop: '32px'}}>
                <h4>Add New Score</h4>
                <div style={{display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap'}}>
                  <input type="number" className={styles.input} placeholder="Score (1-45)" min="1" max="45" value={newScore} onChange={e => setNewScore(e.target.value)} />
                  <input type="date" className={styles.input} value={newDate} onChange={e => setNewDate(e.target.value)} />
                  <button className="primary-btn" onClick={submitScore}>Submit</button>
                </div>
              </div>
            </div>

            {/* Winnings Section */}
            {winnings.length > 0 && (
              <div className={`${styles.card} animate-slide-up`} style={{ marginTop: '32px', animationDelay: '0.2s' }}>
                <h3 className={styles.cardTitle}>🏆 Your Winnings</h3>
                {/* ... */}
                {winnings.map((w: any) => (
                  <div key={w._id} style={{ padding: '16px', marginBottom: '12px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{w.matchCount}-Number Match</span>
                        <span style={{ color: '#94a3b8', marginLeft: '12px' }}>£{w.winnings?.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          backgroundColor: w.verificationStatus === 'verified' ? '#10b981' : w.verificationStatus === 'rejected' ? '#ef4444' : '#f59e0b',
                          color: '#fff'
                        }}>
                          {w.verificationStatus}
                        </span>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          backgroundColor: w.payoutStatus === 'paid' ? '#10b981' : '#6366f1',
                          color: '#fff'
                        }}>
                          Payout: {w.payoutStatus}
                        </span>
                        {!w.proofUrl && w.verificationStatus === 'pending' && (
                          <button className="primary-btn" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => uploadProof(w._id)}>
                            📤 Upload Proof
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side Column */}
          <div className={`${styles.sideCol} animate-slide-up`} style={{ animationDelay: '0.3s' }}>
             <div className={styles.card}>
              <h3 className={styles.cardTitle}>Impact Center</h3>
              <p>You are currently supporting:</p>
              <div className={styles.charitySelection}>
                <h4 style={{marginBottom: '8px', color: '#10b981'}}>
                  {profile?.charity?.name || 'No charity selected'}
                </h4>
                <p style={{fontSize: '14px', color: 'rgba(255,255,255,0.7)'}}>
                  {profile?.charityPercentage || 10}% of your subscription goes here.
                </p>
              </div>
              
              <div style={{marginTop: '24px'}}>
                 <button className="secondary-btn" style={{width: '100%'}} onClick={openCharityModal}>Change Charity</button>
              </div>
             </div>

             <div className={styles.card} style={{marginTop: '32px'}} id="participation">
              <h3 className={styles.cardTitle}>The Draw</h3>
              <p style={{color: '#94a3b8', fontSize: '14px'}}>Next draw is on May 1st, 2026.</p>
              <div style={{marginTop: '16px', fontSize: '24px', fontWeight: 'bold'}}>
                Pool: <span style={{color: '#f59e0b'}}>$24,500</span>
              </div>
             </div>
          </div>

        </div>
      </div>

      {/* Charity Selection Modal */}
      {showCharityModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#1e293b', borderRadius: '16px', padding: '32px',
            maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '24px' }}>Select Your Charity</h3>
            
            {charities.map((c: any) => (
              <div key={c._id}
                onClick={() => setSelectedCharityId(c._id)}
                style={{
                  padding: '16px', marginBottom: '12px', borderRadius: '8px', cursor: 'pointer',
                  border: selectedCharityId === c._id ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.1)',
                  backgroundColor: selectedCharityId === c._id ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.2)'
                }}
              >
                <h4 style={{ color: selectedCharityId === c._id ? '#10b981' : '#e2e8f0' }}>{c.name}</h4>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{c.description}</p>
              </div>
            ))}

            <div style={{ marginTop: '20px' }}>
              <label style={{ fontSize: '14px', color: '#94a3b8' }}>Contribution Percentage (min 10%)</label>
              <input type="number" min="10" max="100" value={charityPercentage}
                onChange={e => setCharityPercentage(e.target.value)}
                className={styles.input} style={{ width: '100%', marginTop: '8px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="primary-btn" onClick={saveCharity} disabled={savingCharity} style={{ flex: 1 }}>
                {savingCharity ? 'Saving...' : 'Save Charity'}
              </button>
              <button className="secondary-btn" onClick={() => setShowCharityModal(false)} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
