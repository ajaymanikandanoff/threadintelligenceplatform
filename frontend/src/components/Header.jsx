import React from 'react';
import { Shield, Cpu, Key, FileText, Activity, AlertOctagon } from 'lucide-react';

export default function Header({ 
  provider, 
  activeThreatTitle, 
  onOpenSettings, 
  onOpenIngest,
  hasCustomKey 
}) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(5, 8, 17, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(168, 85, 247, 0.2))',
            border: '1px solid var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)'
          }}>
            <Shield size={24} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '800', 
                letterSpacing: '0.04em',
                background: 'linear-gradient(90deg, #ffffff, #00f0ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                CYBERINTEL // AI
              </h1>
              <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
                <span className="pulse-dot" style={{ background: 'var(--accent-cyan)' }}></span>
                CTI KNOWLEDGE PLATFORM
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Autonomous Threat Extraction, MITRE ATT&CK Mapping & Graph Reasoning
            </p>
          </div>
        </div>

        {/* Center Active Advisory Snippet */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 51, 102, 0.08)',
          border: '1px solid rgba(255, 51, 102, 0.25)',
          padding: '6px 14px',
          borderRadius: '20px',
          maxWidth: '450px'
        }} className="desktop-intel-badge">
          <AlertOctagon size={16} color="var(--accent-red)" />
          <span style={{ fontSize: '0.75rem', color: '#fca5a5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <strong>Active Intel:</strong> {activeThreatTitle || 'CL0P MOVEit Zero-Day'}
          </span>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Provider status badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: hasCustomKey ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0, 240, 255, 0.1)',
            border: `1px solid ${hasCustomKey ? 'rgba(16, 185, 129, 0.3)' : 'rgba(0, 240, 255, 0.25)'}`,
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)'
          }}>
            <Cpu size={14} color={hasCustomKey ? "var(--accent-green)" : "var(--accent-cyan)"} />
            <span style={{ color: hasCustomKey ? "var(--accent-green)" : "var(--accent-cyan)" }}>
              {hasCustomKey ? 'Gemini 2.5 Live' : (provider || 'CTI Engine')}
            </span>
          </div>

          {/* Ingest / Load Threat Report Button */}
          <button 
            className="cyber-btn-secondary"
            onClick={onOpenIngest}
            title="Upload or pick threat advisories"
          >
            <FileText size={15} />
            <span>Ingest Report</span>
          </button>

          {/* Settings / API Key Button */}
          <button 
            className="cyber-btn-secondary"
            onClick={onOpenSettings}
            style={{ borderColor: hasCustomKey ? 'var(--accent-green)' : 'var(--border-subtle)' }}
            title="Configure Gemini API Key & Model"
          >
            <Key size={15} color={hasCustomKey ? "var(--accent-green)" : "var(--text-muted)"} />
            <span>API Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
