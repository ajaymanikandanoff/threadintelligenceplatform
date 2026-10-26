import React from 'react';
import { Shield, FileUp, Settings, FileText, BookOpen, Sun, Moon, Zap } from 'lucide-react';

export default function Header({ hasCustomKey, onOpenSettings, onOpenIngest, onOpenReport, onOpenGlossary, threatData, theme, onToggleTheme }) {
  return (
    <header style={{
      height: '52px',
      background: 'var(--bg-elevated)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 12px rgba(14,165,233,0.35)',
          flexShrink: 0
        }}>
          <Shield size={15} color="#fff" strokeWidth={2.5} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            CyberIntel<span style={{ color: 'var(--accent)' }}>.AI</span>
          </span>
          <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '3px', background: 'rgba(56,189,248,0.1)', color: 'var(--accent)', border: '1px solid rgba(56,189,248,0.2)', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
            v2.5 · LIVE
          </span>
        </div>

        {threatData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '16px', paddingLeft: '16px', borderLeft: '1px solid var(--border)' }}>
            <span className="status-dot" style={{ background: 'var(--red)' }}></span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Analyzing: <span style={{ color: 'var(--red)', fontWeight: '600' }}>{threatData.threat_actor?.name || 'Active Threat'}</span>
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button className="btn-ghost" onClick={onOpenGlossary} style={{ fontSize: '12px', padding: '6px 10px' }}>
          <BookOpen size={13} />
          <span>Dictionary</span>
        </button>

        {threatData && (
          <button className="btn-ghost" onClick={onOpenReport} style={{ fontSize: '12px', padding: '6px 10px' }}>
            <FileText size={13} />
            <span>Export Report</span>
          </button>
        )}

        <button className="btn-primary" onClick={onOpenIngest} style={{ padding: '7px 14px', fontSize: '12px' }}>
          <Zap size={13} />
          <span>Analyze Threat</span>
        </button>

        <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 2px' }} />

        <button
          className="btn-ghost"
          onClick={onToggleTheme}
          style={{ padding: '6px 8px', border: 'none', background: 'transparent' }}
          title={theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
        >
          {theme === 'light'
            ? <Moon size={15} color="var(--purple)" />
            : <Sun size={15} color="var(--amber)" />
          }
        </button>

        <button
          className="btn-ghost"
          onClick={onOpenSettings}
          style={{
            padding: '6px 8px',
            borderColor: hasCustomKey ? 'rgba(52,211,153,0.3)' : undefined,
            color: hasCustomKey ? 'var(--green)' : undefined
          }}
          title="API Settings"
        >
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
}
