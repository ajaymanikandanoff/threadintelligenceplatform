import React from 'react';
import { Shield, Settings, FileText, BookOpen, Sun, Moon, Zap, Activity, Cpu } from 'lucide-react';

export default function Header({
  hasCustomKey,
  onOpenSettings,
  onOpenIngest,
  onOpenReport,
  onOpenGlossary,
  threatData,
  theme,
  onToggleTheme
}) {
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
      flexShrink: 0,
    }}>
      {/* Brand & Active Threat Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '9px',
          background: 'linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(129,140,248,0.2) 100%)',
          border: '1px solid rgba(56,189,248,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(56,189,248,0.18)',
          flexShrink: 0
        }}>
          <Shield size={17} color="var(--accent)" strokeWidth={2.4} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                CYBERINTEL<span style={{ color: 'var(--accent)' }}>.AI</span>
              </span>
              <span style={{
                fontSize: '9.5px',
                padding: '1.5px 6px',
                borderRadius: '3px',
                background: 'rgba(56,189,248,0.1)',
                color: 'var(--accent)',
                border: '1px solid rgba(56,189,248,0.22)',
                fontFamily: 'var(--font-mono)',
                fontWeight: '700',
                letterSpacing: '0.04em'
              }}>
                ENTERPRISE CTI
              </span>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', letterSpacing: '0.02em', marginTop: '1px' }}>
              Threat Intelligence & Defense Engineering
            </span>
          </div>
        </div>

        {/* Dynamic Threat Feed Status */}
        {threatData ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: '16px',
            paddingLeft: '16px',
            borderLeft: '1px solid var(--border)',
            background: 'rgba(244,63,94,0.06)',
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(244,63,94,0.2)'
          }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="status-dot" style={{ background: 'var(--red)', width: '7px', height: '7px' }} />
              <span className="status-dot status-dot-pulse" style={{ background: 'var(--red)', position: 'absolute', width: '7px', height: '7px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', fontSize: '10px', fontWeight: '700', letterSpacing: '0.05em' }}>
                Active Incident:
              </span>
              <span style={{ color: 'var(--red)', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                {threatData.threat_actor?.name || 'Unattributed Threat Campaign'}
              </span>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginLeft: '16px',
            paddingLeft: '16px',
            borderLeft: '1px solid var(--border)',
            fontSize: '11px',
            color: 'var(--text-tertiary)'
          }}>
            <Activity size={12} color="var(--green)" />
            <span>Telemetry Ingestion Ready</span>
          </div>
        )}
      </div>

      {/* Actions & Utilities */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Gemini Engine Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'var(--bg-overlay)',
          border: '1px solid var(--border)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          marginRight: '4px'
        }}>
          <Cpu size={12} color="var(--accent)" />
          <span>Gemini 2.5 Flash</span>
        </div>

        <button
          className="btn-ghost"
          onClick={onOpenGlossary}
          style={{ fontSize: '12px', padding: '6px 11px' }}
        >
          <BookOpen size={13} color="var(--text-secondary)" />
          <span>Platform Guide</span>
        </button>

        {threatData && (
          <button
            className="btn-ghost"
            onClick={onOpenReport}
            style={{ fontSize: '12px', padding: '6px 11px', borderColor: 'rgba(56,189,248,0.2)' }}
          >
            <FileText size={13} color="var(--accent)" />
            <span>Export CTI Dossier</span>
          </button>
        )}

        <button
          className="btn-primary"
          onClick={onOpenIngest}
          style={{ padding: '6px 14px', fontSize: '12px' }}
        >
          <Zap size={13} />
          <span>Analyze Advisory</span>
        </button>

        <div style={{ width: '1px', height: '22px', background: 'var(--border)', margin: '0 4px' }} />

        {/* Theme Toggle */}
        <button
          className="btn-ghost"
          onClick={onToggleTheme}
          style={{ padding: '7px 9px' }}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light'
            ? <Moon size={14} color="var(--purple)" />
            : <Sun size={14} color="var(--amber)" />
          }
        </button>

        {/* API Settings */}
        <button
          className="btn-ghost"
          onClick={onOpenSettings}
          style={{
            padding: '7px 9px',
            borderColor: hasCustomKey ? 'rgba(16,185,129,0.3)' : undefined,
            color: hasCustomKey ? 'var(--green)' : undefined,
            position: 'relative'
          }}
          title={hasCustomKey ? "Custom API Key Active" : "Configure Gemini API Key"}
        >
          <Settings size={14} />
          {hasCustomKey && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'var(--green)'
            }} />
          )}
        </button>
      </div>
    </header>
  );
}
