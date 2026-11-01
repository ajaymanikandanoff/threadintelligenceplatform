import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon
} from 'lucide-react';

export default function Header({
  activeTab,
  theme,
  onToggleTheme,
  onSearchGlobal,
  onOpenAuth
}) {
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Map active tab to Breadcrumb
  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':
        return { section: 'Overview', title: 'Dashboard' };
      case 'analyzer':
        return { section: 'Analyzer', title: 'Threat Analyzer' };
      case 'intelligence':
        return { section: 'Intelligence', title: 'Threat Intelligence' };
      case 'attack-mapping':
        return { section: 'Attack Mapping', title: 'Attack Mapping' };
      case 'history':
        return { section: 'History', title: 'Investigation History' };
      case 'reports':
        return { section: 'Reports', title: 'Executive Reports' };
      case 'settings':
        return { section: 'Settings', title: 'Platform Settings' };
      case 'defense':
        return { section: 'Defense', title: 'Defense Engineering' };
      case 'copilot':
        return { section: 'Copilot', title: 'AI SOC Copilot' };
      default:
        return { section: 'Workspace', title: 'ThreatLens' };
    }
  };

  const breadcrumb = getBreadcrumb();

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
      {/* ─── Left: Breadcrumb Navigation ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', letterSpacing: '0.01em' }}>
          ThreatLens / {breadcrumb.section}
        </div>
        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {breadcrumb.title}
        </div>
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

        {/* User Avatar Circle */}
        <button
          onClick={onOpenAuth}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
            border: '1px solid rgba(129, 140, 248, 0.4)',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(99, 102, 241, 0.35)'
          }}
          title="Analyst Profile (Ajay M.) - Click to switch/view auth"
        >
          AM
        </button>
      </div>
    </header>
  );
}
