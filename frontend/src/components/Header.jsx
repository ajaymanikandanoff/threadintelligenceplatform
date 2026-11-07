import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, Menu, X } from 'lucide-react';

export default function Header({
  activeTab,
  currentUser,
  theme,
  onToggleTheme,
  onSearchGlobal,
  onSignOut,
  isMobileMenuOpen,
  onToggleMobileMenu
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
      height: '48px',
      background: 'var(--bg-elevated)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0
    }}>
      {/* Left: Hamburger Button (Mobile) + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="mobile-hamburger-btn"
          aria-label="Toggle navigation drawer"
          title="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <img
          src="/logo.png"
          alt="AI ThreatLens"
          style={{ height: '26px', width: 'auto', objectFit: 'contain', flexShrink: 0 }}
        />
        <span style={{
          fontSize: '15px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          userSelect: 'none',
          whiteSpace: 'nowrap'
        }}>
          AI ThreatLens
        </span>
        <span className="header-subtitle-badge" style={{
          fontSize: '10px',
          fontWeight: '600',
          color: 'var(--text-tertiary)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          borderLeft: '1px solid var(--border)',
          paddingLeft: '10px',
          marginLeft: '2px',
          whiteSpace: 'nowrap'
        }}>
          SOC Platform
        </span>
      </div>

      {/* Right: Search + Status + Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Search */}
        <div className="header-search-container">
          <Search size={13} color="var(--text-tertiary)" />
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
              width: '100%',
              fontFamily: 'inherit'
            }}
          />
          <kbd className="header-search-kbd" style={{
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border)',
            borderRadius: '3px',
            padding: '0 4px',
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-tertiary)',
            lineHeight: '16px'
          }}>/</kbd>
        </div>

        {/* Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(p => !p)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              width: '30px', height: '30px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
            title="Notifications"
          >
            <Bell size={14} />
            <span style={{
              position: 'absolute', top: '7px', right: '7px',
              width: '5px', height: '5px',
              borderRadius: '50%', background: '#f85149'
            }} />
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute', top: '36px', right: 0,
              width: '260px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: 'var(--shadow-md)',
              zIndex: 200
            }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Notifications</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                FastAPI engine connected on <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>:8000</code>. Ready for indicator triage.
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            width: '30px', height: '30px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
          title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </header>
  );
}
