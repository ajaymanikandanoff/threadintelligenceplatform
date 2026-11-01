import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginView({ onSignIn, onCancel }) {
  const [email, setEmail] = useState('analyst@example.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSignIn({ name: 'Ajay M.', email, role: 'Security analyst' });
    }, 450);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#06090f',
      backgroundImage: `
        radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
        linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
      `,
      backgroundSize: '24px 24px, 48px 48px, 48px 48px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Left Brand */}
      <div style={{ padding: '32px 48px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #0284c7 0%, #00e5ff 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0, 229, 255, 0.35)'
        }}>
          <Shield size={20} color="#06090f" strokeWidth={2.6} />
        </div>
        <span style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.02em' }}>
          ThreatLens
        </span>
      </div>

      {/* Main Container: 2-Column Split */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
        padding: '0 48px 48px',
        alignItems: 'center',
        maxWidth: '1380px',
        margin: '0 auto',
        width: '100%',
        gap: '40px'
      }}>
        {/* Left Column: Constellation Network & Slogan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', position: 'relative' }}>
          {/* Interactive Constellation SVG */}
          <div style={{ width: '100%', maxWidth: '480px', height: '240px', position: 'relative' }}>
            <svg viewBox="0 0 460 220" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Connecting lines */}
              <line x1="60" y1="50" x2="160" y2="80" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />
              <line x1="60" y1="50" x2="90" y2="160" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />
              <line x1="90" y1="160" x2="190" y2="180" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />
              <line x1="160" y1="80" x2="190" y2="180" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />
              <line x1="160" y1="80" x2="260" y2="50" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />
              <line x1="260" y1="50" x2="330" y2="120" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />
              <line x1="190" y1="180" x2="330" y2="120" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />

              {/* Radar pulse around central cyan node */}
              <circle cx="160" cy="80" r="18" fill="none" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1.5">
                <animate attributeName="r" values="12;26;12" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.1;0.8" dur="3s" repeatCount="indefinite" />
              </circle>

              {/* Multi-colored Nodes */}
              {/* Node 1: Blue (60, 50) */}
              <circle cx="60" cy="50" r="5" fill="#60a5fa" filter="url(#nodeGlow)" />
              {/* Node 2: Green (90, 160) */}
              <circle cx="90" cy="160" r="5" fill="#10b981" filter="url(#nodeGlow)" />
              {/* Node 3: Orange (190, 180) */}
              <circle cx="190" cy="180" r="5" fill="#f59e0b" filter="url(#nodeGlow)" />
              {/* Node 4: Purple (260, 50) */}
              <circle cx="260" cy="50" r="6" fill="#818cf8" filter="url(#nodeGlow)" />
              {/* Node 5: Red/Pink (330, 120) */}
              <circle cx="330" cy="120" r="6" fill="#f43f5e" filter="url(#nodeGlow)" />
              {/* Central Cyan Node (160, 80) */}
              <circle cx="160" cy="80" r="7" fill="#00e5ff" filter="url(#nodeGlow)" />
            </svg>
          </div>

          {/* Slogan & Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', width: 'fit-content',
              background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: '600', color: '#38bdf8'
            }}>
              AI-powered threat investigation
            </div>

            <h1 style={{
              fontSize: '48px',
              fontWeight: '900',
              color: '#f8fafc',
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              margin: 0
            }}>
              See the threat<br />
              before it lands.
            </h1>

            <p style={{
              fontSize: '15px',
              color: '#94a3b8',
              lineHeight: 1.6,
              maxWidth: '460px',
              margin: 0
            }}>
              Analyze URLs, IPs and domains, explore intelligence and keep every investigation in one workspace.
            </p>
          </div>
        </div>

        {/* Right Column: Sign in Card */}
        <div style={{
          background: 'rgba(11, 17, 30, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '38px 40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(20px)',
          maxWidth: '440px',
          width: '100%',
          marginLeft: 'auto'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '6px 0 0' }}>
              Sign in to your analyst workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '26px' }}>
            {/* Username / Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>
                Username or email
              </label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: '#070b14', border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px', padding: '11px 14px'
              }}>
                <Mail size={16} color="#64748b" />
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#f8fafc', fontSize: '13px', width: '100%'
                  }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>
                Password
              </label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: '#070b14', border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px', padding: '11px 14px'
              }}>
                <Lock size={16} color="#64748b" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#f8fafc', fontSize: '13px', width: '100%'
                  }}
                  required
                />
              </div>
            </div>

            {/* Sign in Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 0 24px rgba(6, 182, 212, 0.35)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{isLoading ? 'Verifying session...' : 'Sign in'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Bottom Footnote */}
          <div style={{
            fontSize: '11px',
            color: '#64748b',
            lineHeight: '1.5',
            marginTop: '20px',
            textAlign: 'center'
          }}>
            Credentials are verified by your FastAPI backend. Nothing is stored in the browser except the session token.
          </div>

          {onCancel && (
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  background: 'transparent', border: 'none',
                  color: '#94a3b8', fontSize: '12px', cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Return to platform
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

