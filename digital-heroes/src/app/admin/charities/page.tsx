"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import styles from '../../dashboard/page.module.css';

export default function AdminCharities() {
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState<any>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/charities');
      const data = await res.json();
      if (data.success) setCharities(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCharity(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (charity: any) => {
    setEditingCharity(charity);
    setName(charity.name);
    setDescription(charity.description);
    setImageUrl(charity.imageUrl || charity.img);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editingCharity ? 'PUT' : 'POST';
      const url = editingCharity ? `/api/admin/charities/${editingCharity._id}` : '/api/charities';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, imageUrl })
      });
      
      const data = await res.json();
      if (data.success) {
        alert(editingCharity ? 'Charity updated!' : 'Charity added!');
        setIsModalOpen(false);
        fetchCharities();
      } else {
        alert(data.error || 'Failed to save charity');
      }
    } catch (e) {
      alert('Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/charities/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Charity deleted');
        fetchCharities();
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <>
      <Navbar />
      <div className={`container animate-fade-in`} style={{ paddingTop: '120px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '36px' }}>🛡️ Charity Management</h1>
            <p style={{ color: '#94a3b8' }}>Maintain the directory of supported global organizations.</p>
          </div>
          <button className="primary-btn" onClick={openAddModal}>
            ➕ Add Charity
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading directory...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px', paddingBottom: '80px' }}>
            {charities.map((c: any, i: number) => (
              <div key={c._id} className={`${styles.card} animate-slide-up`} style={{ animationDelay: `${i * 0.05}s`, padding: '0', overflow: 'hidden' }}>
                <div style={{ height: '180px', backgroundImage: `url(${c.imageUrl || c.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{c.name}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', height: '60px', overflow: 'hidden' }}>{c.description}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
                      £{c.totalRaised?.toLocaleString()}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEditModal(c)} className="secondary-btn" style={{ padding: '6px 14px', fontSize: '13px' }}>Edit</button>
                      <button onClick={() => handleDelete(c._id, c.name)} className="secondary-btn" style={{ padding: '6px 14px', fontSize: '13px', borderColor: '#ef4444', color: '#ef4444' }}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-panel animate-slide-up" style={{ width: '90%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ marginBottom: '24px' }}>{editingCharity ? 'Edit Charity' : 'Add New Charity'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required
                  className={styles.input} 
                  style={{ width: '100%' }}
                  placeholder="e.g. Golfers For Good"
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  className={styles.input} 
                  style={{ width: '100%', height: '100px', resize: 'none', padding: '12px' }}
                  placeholder="Describe the mission..."
                ></textarea>
              </div>
              <div style={{ marginBottom: '32px' }}>
                <label style={{ fontSize: '14px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Cover Image URL</label>
                <input 
                  type="url" 
                  value={imageUrl} 
                  onChange={e => setImageUrl(e.target.value)}
                  className={styles.input} 
                  style={{ width: '100%' }}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="primary-btn" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Charity'}
                </button>
                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
