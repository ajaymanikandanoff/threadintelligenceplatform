import React from 'react';
import GlobalThreatMap from '../components/GlobalThreatMap';
import { Radio, ArrowLeft, Shield, Globe } from 'lucide-react';

export default function ThreatMapView({ onNavigateTab }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '0 0 24px 0',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Top Banner & Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            background: 'rgba(0, 229, 255, 0.08)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Radio size={18} color="var(--accent)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{
                fontSize: '22px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                Global Threat & Data Transfer Map
              </h1>
              <span style={{
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#f43f5e',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f43f5e', animation: 'pulse 1.5s infinite' }} />
                Real-Time Telemetry
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Geospatial attack tracking: adversary origins, compromised bastions, and live cross-border data exfiltration streams.
            </p>
          </div>
        </div>

        {onNavigateTab && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onNavigateTab('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--bg-glass-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Global Threat Map Component */}
      <GlobalThreatMap
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
}

