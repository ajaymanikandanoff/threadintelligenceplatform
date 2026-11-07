import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon
} from 'lucide-react';

export default function Header({
  activeTab,
  currentUser,
  theme,
  onToggleTheme,
  onSearchGlobal,
  onOpenAuth,
  onSignOut
}) {
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      if (onSearchGlobal) onSearchGlobal(searchValue.trim());
    }
  };

  return (
    <header style={{
      height: '56px',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0
    }}>
      {/* ─── Left: Platform Title & Brand Logo ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src="/logo.png"
          alt="AI ThreatLens Logo"
          style={{
            height: '34px',
            width: 'auto',
            objectFit: 'contain',
            flexShrink: 0,
            filter: 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.45))'
          }}
        />
        <h1 style={{
          fontSize: '18px',
          fontWeight: '800',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          margin: 0,
          userSelect: 'none'
        }}>
          AI ThreatLens
        </h1>
      </div>

      {/* ─── Right: Global Search & Operational Status Bar ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Global Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '6px 12px',
          width: '260px'
        }}>
          <Search size={14} color="var(--text-tertiary)" />
          <input
            type="text"
            placeholder="Search IPs, domains, URLs"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onKeyDown={handleSearchSubmit}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '12px',
              width: '100%'
            }}
          />
          <kbd style={{
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '1px 5px',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-tertiary)'
          }}>
            /
          </kbd>
        </div>

        {/* Operational Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '5px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          color: '#10b981',
          fontWeight: '600'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 6px #10b981'
          }} />
          <span>All systems operational</span>
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(p => !p)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              position: 'relative'
            }}
            title="Notifications"
          >
            <Bell size={15} />
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#f43f5e',
              boxShadow: '0 0 6px #f43f5e'
            }} />
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '40px',
              right: 0,
              width: '280px',
              background: 'var(--bg-glass-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '14px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              zIndex: 200
            }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>System Notifications</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                FastAPI threat engine connected on <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>:8000</code>. Ready for automated indicator triage.
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}
