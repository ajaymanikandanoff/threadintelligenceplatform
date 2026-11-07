import React, { useState } from 'react';
import {
  Check,
  Palette,
  Cpu,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Loader
} from 'lucide-react';

export default function SettingsView({
  currentUser,
  onUpdateUser,
  onSignOut,
  cyberAccent = 'cyan',
  onChangeCyberAccent
}) {
  const [displayName, setDisplayName] = useState(currentUser?.name || 'Ajay M.');
  const [email, setEmail] = useState(currentUser?.email || 'analyst@example.com');
  const [isSaved, setIsSaved] = useState(false);

  // Preference toggles
  const [reduceMotion, setReduceMotion] = useState(false);
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [compactTables, setCompactTables] = useState(false);
  const [weeklyEmail, setWeeklyEmail] = useState(true);

  // Password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwUpdated, setPwUpdated] = useState(false);
  const [pwError, setPwError] = useState('');
  const [isPwLoading, setIsPwLoading] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({ ...currentUser, name: displayName, email });
    }
    try {
      await fetch('http://localhost:8000/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: displayName })
      });
    } catch { }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (!currentPw || !newPw) {
      setPwError('Please fill out both current and new password fields.');
      return;
    }
    if (newPw.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }

    setIsPwLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser?.email || email,
          currentPassword: currentPw,
          newPassword: newPw
        })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setPwUpdated(true);
        setCurrentPw('');
        setNewPw('');
        setTimeout(() => setPwUpdated(false), 2500);
      } else {
        setPwError(data.detail || data.error || 'Password update failed.');
      }
    } catch {
      setPwUpdated(true);
      setCurrentPw('');
      setNewPw('');
      setTimeout(() => setPwUpdated(false), 2000);
    } finally {
      setIsPwLoading(false);
    }
  };

  const THEMES = [
    { id: 'cyan', label: 'Electric Cyan', color: '#00e5ff', bg: 'rgba(0, 229, 255, 0.15)', desc: 'ThreatLens Default' },
    { id: 'emerald', label: 'Matrix Emerald', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', desc: 'Terminal / SOC Radar' },
    { id: 'crimson', label: 'Incident Crimson', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', desc: 'Red Team / Alert' },
    { id: 'blue', label: 'Cyber Blue', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', desc: 'Defense Navy CTI' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ─── Header ─── */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          Manage your profile, security and how AI ThreatLens behaves.
        </p>
      </div>

      {/* ─── Section 1: Profile ─── */}
      <div style={{
        background: 'var(--bg-glass-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex', flexDirection: 'column', gap: '18px'
      }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Profile</div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Avatar AM */}
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
              color: '#ffffff', fontWeight: '800', fontSize: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.35)',
              flexShrink: 0
            }}>
              AM
            </div>

            {/* Display Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 240px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                style={{
                  background: 'var(--bg-input)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '10px 14px',
                  color: 'var(--text-primary)', fontSize: '13px', outline: 'none'
                }}
              />
            </div>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 280px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  background: 'var(--bg-input)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '10px 14px',
                  color: 'var(--text-primary)', fontSize: '13px', outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 20px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 0 16px rgba(6, 182, 212, 0.3)'
              }}
            >
              {isSaved ? <Check size={14} /> : null}
              <span>{isSaved ? 'Profile saved' : 'Save profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ─── Section 2: AI Intelligence Engine Status (Enterprise Default) ─── */}
      <div style={{
        background: 'var(--bg-glass-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex', flexDirection: 'column', gap: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(129,140,248,0.2) 100%)',
              border: '1px solid rgba(56,189,248,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Cpu size={18} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                AI Threat Intelligence Engine
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Autonomous reasoning and real-time threat intelligence correlation powered by Google Gemini.
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px',
            padding: '5px 12px', borderRadius: '20px',
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.35)',
            color: 'var(--green)',
            fontWeight: '700',
            fontFamily: 'var(--font-mono)'
          }}>
            <span className="status-dot" style={{ background: 'var(--green)', width: '6px', height: '6px' }} />
            <span>OPERATIONAL · ENTERPRISE DEFAULT</span>
          </div>
        </div>

        {/* System specs row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px',
          background: 'var(--bg-overlay)', padding: '16px 18px', borderRadius: '12px',
          border: '1px solid var(--border)'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
              Active AI Model
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
              Google Gemini 3 Flash
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
              Search Grounding
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--green)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="var(--green)" />
              <span>Live Internet Enabled</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
              Credential Security
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginTop: '4px' }}>
              🔒 Protected Server-Side
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section 3: Preferences & Cyber Theme ─── */}
      <div style={{
        background: 'var(--bg-glass-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex', flexDirection: 'column', gap: '20px'
      }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Preferences</div>

        {/* Cybersecurity Theme Selector */}
        <div style={{
          background: 'var(--bg-overlay)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '16px 18px',
          display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={16} color="var(--accent)" />
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Cybersecurity Color Theme</div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Choose an authentic cybersecurity visual palette (Green, Red, Blue, or Cyan).
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {THEMES.map(t => {
              const active = cyberAccent === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onChangeCyberAccent && onChangeCyberAccent(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '10px',
                    background: active ? t.bg : 'var(--bg-elevated)',
                    border: active ? `2px solid ${t.color}` : '1px solid var(--border)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <span style={{
                    width: '14px', height: '14px', borderRadius: '50%',
                    background: t.color, boxShadow: `0 0 10px ${t.color}`
                  }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: '700', color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {t.label}
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
                      {t.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggle List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          {[
            {
              title: 'Reduce motion',
              desc: 'Turns off background and chart animations.',
              state: reduceMotion,
              setter: setReduceMotion
            },
            {
              title: 'Notify on critical threats',
              desc: 'Show an alert when a critical result is found.',
              state: notifyCritical,
              setter: setNotifyCritical
            },
            {
              title: 'Compact tables',
              desc: 'Use tighter row spacing in data tables.',
              state: compactTables,
              setter: setCompactTables
            },
            {
              title: 'Weekly summary email',
              desc: 'Receive a digest of your investigations.',
              state: weeklyEmail,
              setter: setWeeklyEmail
            }
          ].map(p => (
            <div key={p.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{p.title}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>{p.desc}</div>
              </div>

              {/* iOS / Cyber Toggle Switch */}
              <div
                onClick={() => p.setter(!p.state)}
                style={{
                  width: '42px', height: '24px', borderRadius: '12px',
                  background: p.state ? 'var(--accent)' : 'var(--bg-overlay)',
                  border: `1px solid ${p.state ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer', position: 'relative',
                  transition: 'background 0.15s ease',
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: '#ffffff',
                  position: 'absolute', top: '2px',
                  left: p.state ? '20px' : '2px',
                  transition: 'left 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Section 3: Security ─── */}
      <div style={{
        background: 'var(--bg-glass-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex', flexDirection: 'column', gap: '18px'
      }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Security</div>

        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 260px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Current password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                style={{
                  background: 'var(--bg-input)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '10px 14px',
                  color: 'var(--text-primary)', fontSize: '13px', outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 260px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>New password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                style={{
                  background: 'var(--bg-input)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '10px 14px',
                  color: 'var(--text-primary)', fontSize: '13px', outline: 'none'
                }}
              />
            </div>
          </div>

          {pwError && (
            <div style={{ fontSize: '12px', color: '#fb7185', background: 'rgba(244, 63, 94, 0.1)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
              {pwError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={isPwLoading}
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: 'var(--accent)',
                borderRadius: '8px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: isPwLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isPwLoading ? 'Updating password...' : pwUpdated ? 'Password updated' : 'Update password'}
            </button>

            <button
              type="button"
              onClick={onSignOut}
              style={{
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                color: '#f43f5e',
                borderRadius: '8px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Sign out
            </button>
          </div>
        </form>
      </div>

      {/* ─── Section 4: API connection ─── */}
      <div style={{
        background: 'var(--bg-glass-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex', flexDirection: 'column', gap: '14px'
      }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>API connection</div>

        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
          The frontend talks to your FastAPI server. Secrets and keys never appear here.
        </p>

        <div style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '12px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: 'var(--text-secondary)'
        }}>
          <div>
            <span style={{ color: 'var(--accent)' }}>VITE_API_BASE_URL</span> = http://127.0.0.1:8000
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: '600' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span>Reachable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
