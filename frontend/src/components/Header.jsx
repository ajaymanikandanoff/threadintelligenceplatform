import React from 'react';
import { Shield, FileUp, Settings, FileText, Sparkles } from 'lucide-react';

export default function Header({ hasCustomKey, onOpenSettings, onOpenIngest, onOpenReport, threatData }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'rgba(6, 9, 15, 0.95)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 24px',
      height: '58px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Left: Brand + Simple Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'rgba(99,179,237,0.12)', border: '1px solid rgba(99,179,237,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Shield size={18} color="var(--cyan)" strokeWidth={2.4} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.94rem', fontWeight: '800', letterSpacing: '0.04em', color: 'var(--text-0)' }}>
              CYBERINTEL<span style={{ color: 'var(--cyan)' }}>.AI</span>
            </span>
            <span className="tag tag-cyan" style={{ fontSize: '0.62rem' }}>
              <span className="status-dot" style={{ background: 'var(--cyan)' }}></span>
              READY
            </span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', display: 'none' }}>
            Automated Threat Intelligence & Defense Engine
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {threatData && (
          <button
            className="btn-ghost"
            onClick={onOpenReport}
            style={{ padding: '7px 12px', fontSize: '0.8rem', color: 'var(--text-1)' }}
            title="Download formatted C-Suite executive briefing report"
          >
            <FileText size={15} color="var(--cyan)" />
            <span>Executive Report</span>
          </button>
        )}

        {/* Primary Action Button */}
        <button
          className="btn-primary"
          onClick={onOpenIngest}
          style={{ padding: '7px 16px', fontSize: '0.82rem' }}
        >
          <FileUp size={15} />
          <span>Analyze Threat Report</span>
        </button>

        <button
          className="btn-ghost"
          onClick={onOpenSettings}
          style={{
            padding: '7px 10px',
            borderColor: hasCustomKey ? 'rgba(104, 211, 145, 0.4)' : undefined
          }}
          title="Configure Gemini API Key"
        >
          <Settings size={15} color={hasCustomKey ? 'var(--green)' : undefined} />
        </button>
      </div>
    </header>
  );
}
