'use client';
import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function InfoPage() {
  const steps = [
    {
      number: '01',
      title: 'Subscribe & Gear Up',
      description: 'Join the Digital Heroes community with a monthly or yearly subscription. Your membership fuels world-class charities from day one.',
      icon: '⛳'
    },
    {
      number: '02',
      title: 'Log Your Rounds',
      description: 'Play your favorite courses and log your Stableford scores. We track your progress and calculate your handicap impacts.',
      icon: '📊'
    },
    {
      number: '03',
      title: 'Support Your Charity',
      description: 'Select your preferred charity. 10% or more of every subscription pound goes directly to supporting environmental and community causes.',
      icon: '🤝'
    },
    {
      number: '04',
      title: 'Enter the Draw',
      description: 'Active subscribers are entered into our massive prize draws. Accuracy and participation increase your platform standing.',
      icon: '🏆'
    }
  ];

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '120px', minHeight: '100vh', background: '#0a0c10' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }} className="animate-fade-in">
            <h1 style={{ fontSize: '56px', fontWeight: '800', marginBottom: '24px', letterSpacing: '-2px' }}>
              How <span style={{ color: 'var(--accent-primary)' }}>Digital Heroes</span> Works
            </h1>
            <p style={{ fontSize: '20px', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
              We've combined the passion of golf with the power of giving. Discover the journey from the first tee to global impact.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '32px',
            marginBottom: '100px'
          }}>
            {steps.map((step, index) => (
              <div key={index} className="glass-panel" style={{ 
                padding: '40px', 
                position: 'relative',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'none'}>
                <div style={{ 
                  fontSize: '48px', 
                  fontWeight: '900', 
                  color: 'rgba(255,255,255,0.05)', 
                  position: 'absolute',
                  top: '20px',
                  right: '30px'
                }}>{step.number}</div>
                
                <div style={{ fontSize: '32px', marginBottom: '20px' }}>{step.icon}</div>
                <h3 style={{ fontSize: '22px', marginBottom: '16px', fontWeight: '700' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px' }}>{step.description}</p>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ 
            padding: '60px', 
            textAlign: 'center', 
            background: 'linear-gradient(135deg, rgba(0, 112, 243, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
            border: '1px solid rgba(0, 112, 243, 0.2)',
            marginBottom: '120px'
          }}>
            <h2 style={{ fontSize: '36px', marginBottom: '24px' }}>Ready to became a Hero?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              Join thousands of golfers making a real difference. Your first round logged is the first step toward a better world.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Link href="/signup" className="primary-btn" style={{ padding: '16px 40px', fontSize: '18px' }}>Get Started Now</Link>
              <Link href="/charities" className="secondary-btn" style={{ padding: '16px 40px', fontSize: '18px' }}>Browse Charities</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
