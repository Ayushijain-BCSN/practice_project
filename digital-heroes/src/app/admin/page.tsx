"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AdminGuard from '@/components/AdminGuard';
import styles from '../dashboard/page.module.css';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [drawResult, setDrawResult] = useState<any>(null);

  // Verification state
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [loadingVerifications, setLoadingVerifications] = useState(true);

  // User Management state
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [editingScores, setEditingScores] = useState<any[]>([]);

  // Draw Configuration state
  const [drawLogic, setDrawLogic] = useState<'random' | 'algorithmic'>('random');

  // Stats state
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchVerifications();
    fetchStats();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchVerifications = async () => {
    setLoadingVerifications(true);
    try {
      const res = await fetch('/api/admin/verify-win');
      const data = await res.json();
      if (data.success) {
        setPendingVerifications(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVerifications(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/reports');
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunDraw = async (simulate: boolean = false) => {
    const actionText = simulate ? 'run a simulation' : 'execute the official draw';
    if (!confirm(`⚠️ WARNING: This will ${actionText}. ${simulate ? '' : 'This will compute all winners, distribute prizes, and send email notifications. This action CANNOT be undone.'}\n\nAre you sure you want to proceed?`)) return;
    
    setLoading(true);
    setDrawResult(null);
    try {
      const res = await fetch('/api/admin/run-draw', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulate, logic: drawLogic })
      });
      const data = await res.json();
      if (data.success) {
        setDrawResult(data);
        alert(simulate ? '✅ Simulation completed successfully!' : '✅ Draw executed successfully! Email notifications have been dispatched.');
        if (!simulate) {
          fetchVerifications();
          fetchStats();
        }
      } else {
        alert('❌ ' + (data.error || 'Draw execution failed.'));
      }
    } catch(e) {
      alert('Draw execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (entryId: string, action: 'approve' | 'reject') => {
    const label = action === 'approve' ? 'APPROVE' : 'REJECT';
    if (!confirm(`Are you sure you want to ${label} this submission?`)) return;
    try {
      const res = await fetch('/api/admin/verify-win', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, action })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Submission ${label.toLowerCase()}d successfully`);
        fetchVerifications();
      } else {
        alert(data.error || 'Action failed');
      }
    } catch (e) {
      alert('Failed to process verification');
    }
  };

  const handleMarkPaid = async (entryId: string) => {
    if (!confirm('Mark this winner as PAID? This confirms funds have been transferred.')) return;
    try {
      const res = await fetch('/api/admin/verify-win', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId })
      });
      const data = await res.json();
      if (data.success) {
        alert('Payout marked as completed ✅');
        fetchVerifications();
      } else {
        alert(data.error || 'Failed');
      }
    } catch (e) {
      alert('Failed to mark payout');
    }
  };

  const openScoreEditor = (user: any) => {
    setSelectedUser(user);
    setEditingScores(user.scores || []);
    setShowScoreModal(true);
  };

  const handleScoreUpdate = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser._id}/scores`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores: editingScores })
      });
      const data = await res.json();
      if (data.success) {
        alert('Scores updated successfully');
        setShowScoreModal(false);
        fetchUsers();
      } else {
        alert(data.error || 'Failed to update scores');
      }
    } catch (e) {
      alert('Error updating scores');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <Navbar />
      <div className={`container ${styles.dashboardLayout} animate-fade-in`}>
        <div className={styles.dashboardHeader}>
          <h2>🛡️ Admin Control Panel</h2>
        </div>

        <div className={styles.dashboardGrid}>
          {/* Main Column */}
          <div className={styles.mainCol}>
            {/* Draw Engine */}
            <div className={`${styles.card} animate-slide-up`} style={{ animationDelay: '0.1s' }}>
              <h3 className={styles.cardTitle}>⚙️ Draw Engine Control</h3>
              <p style={{color: '#94a3b8', fontSize: '14px', marginBottom: '20px'}}>
                Management of the monthly draw. Run a simulation to pre-analyze results, or execute the official draw to finalize winners and notify participants.
              </p>

              {/* Draw Logic Config */}
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>Draw Policy (Section 06)</p>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                    <input type="radio" checked={drawLogic === 'random'} onChange={() => setDrawLogic('random')} />
                    Random (Standard)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                    <input type="radio" checked={drawLogic === 'algorithmic'} onChange={() => setDrawLogic('algorithmic')} />
                    Algorithmic (Weighted)
                  </label>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button 
                  className="secondary-btn" 
                  onClick={() => handleRunDraw(true)} 
                  disabled={loading}
                  style={{ fontSize: '14px', padding: '10px 20px' }}>
                  {loading ? '⏳ Processing...' : '📋 Run Simulation'}
                </button>
                <button 
                  className="primary-btn" 
                  onClick={() => handleRunDraw(false)} 
                  disabled={loading}
                  style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', fontSize: '14px', padding: '10px 20px' }}>
                  {loading ? '⏳ Processing...' : '🎰 Execute Official Draw'}
                </button>
              </div>

              {drawResult && (
                <div className="animate-slide-up" style={{
                  marginTop: '24px', padding: '20px', 
                  backgroundColor: drawResult.isSimulation ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)', 
                  borderRadius: '12px', 
                  border: `1px solid ${drawResult.isSimulation ? 'rgba(59,130,246,0.3)' : 'rgba(16,185,129,0.3)'}`
                }}>
                  <h4 style={{color: drawResult.isSimulation ? '#3b82f6' : '#10b981', marginBottom: '12px'}}>
                    {drawResult.isSimulation ? '📋 Simulation Results' : '✅ Draw Results'}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                    <span style={{color: '#94a3b8'}}>Winning Numbers:</span>
                    <span style={{color: '#f59e0b', fontWeight: 'bold'}}>{drawResult.statistics.winningNumbers.join(' | ')}</span>
                    <span style={{color: '#94a3b8'}}>Participants:</span>
                    <span>{drawResult.statistics.participants}</span>
                    <span style={{color: '#94a3b8'}}>5-Match (Jackpot):</span>
                    <span style={{color: drawResult.statistics.winners.match5 > 0 ? '#10b981' : '#ef4444'}}>{drawResult.statistics.winners.match5} winner(s)</span>
                    <span style={{color: '#94a3b8'}}>4-Match:</span>
                    <span style={{color: drawResult.statistics.winners.match4 > 0 ? '#10b981' : '#ef4444'}}>{drawResult.statistics.winners.match4} winner(s)</span>
                    <span style={{color: '#94a3b8'}}>3-Match:</span>
                    <span style={{color: drawResult.statistics.winners.match3 > 0 ? '#10b981' : '#ef4444'}}>{drawResult.statistics.winners.match3} winner(s)</span>
                  </div>
                  {drawResult.isSimulation && (
                    <p style={{ marginTop: '12px', fontSize: '12px', fontStyle: 'italic', color: '#94a3b8' }}>
                      * Note: This was a simulation. No winners were recorded and no emails were sent.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Winner Verifications */}
            <div className={`${styles.card} animate-slide-up`} style={{marginTop: '32px', animationDelay: '0.2s'}}>
              <h3 className={styles.cardTitle}>📋 Winner Verifications</h3>
              <p style={{color: '#94a3b8', fontSize: '14px', marginBottom: '20px'}}>
                Review submitted proof screenshots from winners. Approve to confirm eligibility, or reject invalid submissions.
              </p>

              {loadingVerifications ? (
                <p style={{color: '#94a3b8'}}>Loading verifications...</p>
              ) : pendingVerifications.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  No pending verifications at the moment.
                </div>
              ) : (
                pendingVerifications.map((entry: any) => (
                  <div key={entry._id} style={{
                    padding: '20px', marginBottom: '16px',
                    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <strong style={{color: '#e2e8f0'}}>{entry.userId?.fullName || 'Unknown User'}</strong>
                        <span style={{color: '#64748b', marginLeft: '8px', fontSize: '13px'}}>{entry.userId?.email}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '12px', fontSize: '12px',
                          backgroundColor: '#f59e0b', color: '#000', fontWeight: 'bold'
                        }}>
                          {entry.matchCount}-Match
                        </span>
                        <span style={{
                          padding: '4px 10px', borderRadius: '12px', fontSize: '12px',
                          backgroundColor: entry.verificationStatus === 'verified' ? '#10b981' : entry.verificationStatus === 'rejected' ? '#ef4444' : '#6366f1',
                          color: '#fff'
                        }}>
                          {entry.verificationStatus}
                        </span>
                        <span style={{
                          padding: '4px 10px', borderRadius: '12px', fontSize: '12px',
                          backgroundColor: entry.payoutStatus === 'paid' ? '#10b981' : '#334155',
                          color: '#fff'
                        }}>
                          Payout: {entry.payoutStatus}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '12px' }}>
                      Winnings: <strong style={{color: '#10b981'}}>£{entry.winnings?.toFixed(2)}</strong> &nbsp;|&nbsp;
                      Numbers: {entry.userNumbers?.join(', ')}
                    </div>

                    {/* Proof Image */}
                    {entry.proofUrl && (
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Submitted Proof:</p>
                        <img
                          src={entry.proofUrl}
                          alt="Score proof"
                          style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {entry.verificationStatus === 'pending' && (
                        <>
                          <button className="primary-btn" style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontSize: '13px', padding: '8px 16px' }}
                            onClick={() => handleVerification(entry._id, 'approve')}>
                            ✅ Approve
                          </button>
                          <button className="primary-btn" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', fontSize: '13px', padding: '8px 16px' }}
                            onClick={() => handleVerification(entry._id, 'reject')}>
                            ❌ Reject
                          </button>
                        </>
                      )}
                      {entry.verificationStatus === 'verified' && entry.payoutStatus !== 'paid' && (
                        <button className="primary-btn" style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6', fontSize: '13px', padding: '8px 16px' }}
                          onClick={() => handleMarkPaid(entry._id)}>
                          💰 Mark as Paid
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* User Management Section */}
            <div className={`${styles.card} animate-slide-up`} style={{marginTop: '32px', animationDelay: '0.2s'}}>
              <h3 className={styles.cardTitle}>👥 User Management</h3>
              <p style={{color: '#94a3b8', fontSize: '14px', marginBottom: '20px'}}>
                View registered users, manage their roles, and edit their historical golf scores.
              </p>

              {loadingUsers ? (
                <p style={{color: '#94a3b8'}}>Loading users...</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Role</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Scores</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u: any) => (
                        <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ color: '#e2e8f0', fontWeight: 'bold' }}>{u.fullName}</div>
                            <div style={{ color: '#64748b', fontSize: '12px' }}>{u.email}</div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ 
                              fontSize: '11px', padding: '2px 8px', borderRadius: '10px', 
                              backgroundColor: u.role === 'admin' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                              color: u.role === 'admin' ? '#3b82f6' : '#94a3b8'
                            }}>{u.role}</span>
                          </td>
                          <td style={{ padding: '12px', color: '#94a3b8' }}>
                            {u.scores?.length || 0} / 5 entered
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button className="secondary-btn" style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => openScoreEditor(u)}>
                              ✏️ Edit Scores
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Draw History Section */}
            <div className={`${styles.card} animate-slide-up`} style={{marginTop: '32px', animationDelay: '0.3s'}}>
              <h3 className={styles.cardTitle}>📜 Historical Draw Data</h3>
              <p style={{color: '#94a3b8', fontSize: '14px', marginBottom: '20px'}}>
                Review previous draw results, winning numbers, and final prize pools.
              </p>

              {(stats?.history?.length > 0) ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Month</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Numbers</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Pool</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.history.map((h: any) => (
                        <tr key={h._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px', color: '#e2e8f0' }}>{new Date(h.drawMonth).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</td>
                          <td style={{ padding: '12px', color: '#f59e0b' }}>{h.winningNumbers?.join(' | ') || '--'}</td>
                          <td style={{ padding: '12px', color: '#10b981' }}>£{h.totalPrizePool?.toLocaleString()}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#334155', color: '#fff' }}>{h.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  No historical data available.
                </div>
              )}
            </div>
          </div>

          {/* Side Column */}
          <div className={styles.sideCol}>
             <div className={`${styles.card} animate-slide-up`} style={{ animationDelay: '0.3s' }}>
              <h3 className={styles.cardTitle}>📊 Platform Health</h3>
              <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Active Users</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>{stats?.totalUsers || '--'}</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Total Prize Pool</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>£{stats?.totalPrizePool?.toLocaleString() || '--'}</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Raised for Charity</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>£{stats?.totalCharityRaised?.toLocaleString() || '--'}</div>
                </div>
              </div>
             </div>

             <div className={`${styles.card} animate-slide-up`} style={{ marginTop: '32px', animationDelay: '0.4s' }}>
              <h3 className={styles.cardTitle}>🔑 Quick Actions</h3>
              <div style={{ display: 'grid', gap: '8px', marginTop: '16px' }}>
                <a href="/admin/charities" className="secondary-btn" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                  Manage Charities
                </a>
                <a href="/dashboard" className="secondary-btn" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                  View User Dashboard
                </a>
              </div>
             </div>
          </div>

        </div>
      </div>

      {/* Score Editor Modal */}
      {showScoreModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ padding: '32px', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ marginBottom: '8px' }}>✏️ Edit Scores: {selectedUser?.fullName}</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              Modify the latest 5 scores for this user. Stableford range: 1–45.
            </p>

            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              {editingScores.map((score: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Score</label>
                    <input 
                      type="number" value={score.score} 
                      onChange={(e) => {
                        const newScores = [...editingScores];
                        newScores[idx] = { ...newScores[idx], score: parseInt(e.target.value) };
                        setEditingScores(newScores);
                      }}
                      style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                    />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Date</label>
                    <input 
                      type="date" value={new Date(score.datePlayed).toISOString().split('T')[0]} 
                      onChange={(e) => {
                        const newScores = [...editingScores];
                        newScores[idx] = { ...newScores[idx], datePlayed: new Date(e.target.value) };
                        setEditingScores(newScores);
                      }}
                      style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              ))}
              
              {editingScores.length < 5 && (
                <button 
                  onClick={() => setEditingScores([...editingScores, { score: 0, datePlayed: new Date() }])}
                  style={{ fontSize: '12px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                >
                  + Add score entry
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="primary-btn" style={{ flex: 1 }} onClick={handleScoreUpdate} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setShowScoreModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminGuard>
  );
}
