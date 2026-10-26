import React from 'react';
import { Shield, FileUp, Settings, FileText, BookOpen, Sun, Moon } from 'lucide-react';

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
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-1)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 24px',
      height: '58px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'background 0.2s ease, border-color 0.2s ease'
    }}>
      {/* Left: Brand + Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Jargon Buster / Dictionary */}
        <button
          className="btn-ghost"
          onClick={onOpenGlossary}
          style={{ padding: '6px 12px', fontSize: '0.78rem', color: 'var(--text-1)' }}
          title="Open Cyber Jargon Buster (Terms explained in plain words)"
        >
          <BookOpen size={14} color="var(--cyan)" />
          <span>Jargon Buster</span>
        </button>

        {/* Executive Report */}
        {threatData && (
          <button
            className="btn-ghost"
            onClick={onOpenReport}
            style={{ padding: '6px 12px', fontSize: '0.78rem', color: 'var(--text-1)' }}
            title="Download formatted C-Suite executive briefing report"
          >
            <FileText size={14} color="var(--cyan)" />
            <span>Executive Report</span>
          </button>
        )}

        {/* Primary Action Button */}
        <button
          className="btn-primary"
          onClick={onOpenIngest}
          style={{ padding: '7px 15px', fontSize: '0.8rem' }}
        >
          <FileUp size={14} />
          <span>Analyze Threat</span>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          className="btn-ghost"
          onClick={onToggleTheme}
          style={{ padding: '7px 10px' }}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={15} color="var(--purple)" /> : <Sun size={15} color="var(--amber)" />}
        </button>

        {/* Settings */}
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
