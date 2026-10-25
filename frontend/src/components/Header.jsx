import React from 'react';
import { Shield, Key, FileUp, Settings } from 'lucide-react';

export default function Header({ hasCustomKey, onOpenSettings, onOpenIngest }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'rgba(6, 9, 15, 0.92)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 28px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Left: Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Shield size={20} color="var(--cyan)" strokeWidth={2.2} />
        <span style={{
          fontSize: '0.92rem',
          fontWeight: '700',
          letterSpacing: '0.06em',
          color: 'var(--text-0)'
        }}>
          CYBERINTEL<span style={{ color: 'var(--text-3)', fontWeight: '400', margin: '0 6px' }}>/</span>AI
        </span>
        <span className="tag tag-cyan" style={{ fontSize: '0.62rem', marginLeft: '4px' }}>
          <span className="status-dot" style={{ background: 'var(--cyan)' }}></span>
          LIVE
        </span>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button className="btn-ghost" onClick={onOpenIngest} style={{ padding: '6px 12px' }}>
          <FileUp size={15} />
          <span>Ingest</span>
        </button>
        <button
          className="btn-ghost"
          onClick={onOpenSettings}
          style={{
            padding: '6px 12px',
            borderColor: hasCustomKey ? 'rgba(104, 211, 145, 0.4)' : undefined
          }}
        >
          <Settings size={15} color={hasCustomKey ? 'var(--green)' : undefined} />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
}
