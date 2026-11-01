import React from 'react';
import { ShieldAlert, Crosshair, ArrowUpRight, Flame, Layers } from 'lucide-react';
import { SEVERITY_COLORS } from './threatData';

export default function ThreatMapLegend({ activeSeverity, onSelectSeverity }) {
  const levels = [
    { key: 'critical', label: 'Critical', color: SEVERITY_COLORS.critical },
    { key: 'high', label: 'High', color: SEVERITY_COLORS.high },
    { key: 'medium', label: 'Medium', color: SEVERITY_COLORS.medium },
    { key: 'low', label: 'Low', color: SEVERITY_COLORS.low },
    { key: 'info', label: 'Informational', color: SEVERITY_COLORS.info }
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: '16px',
      left: '16px',
      zIndex: 10,
      background: 'rgba(7, 11, 20, 0.88)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      padding: '10px 14px',
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxWidth: '320px',
      pointerEvents: 'auto'
    }}>
      {/* Legend Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldAlert size={13} color="#00e5ff" />
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#f8fafc', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Threat Severity Legend
          </span>
        </div>
        <span style={{ fontSize: '9.5px', color: '#94a3b8' }}>
          Live Geospatial SOC
        </span>
      </div>

      {/* Severity Badges (Clickable filters) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {levels.map(lvl => {
          const isSelected = activeSeverity === lvl.key;
          return (
            <button
              key={lvl.key}
              type="button"
              onClick={() => onSelectSeverity && onSelectSeverity(activeSeverity === lvl.key ? 'ALL' : lvl.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: isSelected ? `${lvl.color}25` : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${isSelected ? lvl.color : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '5px',
                padding: '3px 7px',
                cursor: 'pointer',
                transition: 'all 0.12s ease'
              }}
              title={`Filter by ${lvl.label} severity`}
            >
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: lvl.color,
                boxShadow: `0 0 6px ${lvl.color}`
              }} />
              <span style={{ fontSize: '10.5px', fontWeight: isSelected ? '700' : '500', color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                {lvl.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Node Indicators Explanation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '10px',
        color: '#94a3b8',
        paddingTop: '4px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f43f5e', transform: 'rotate(45deg)' }} />
          <span>Threat Origin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1.5px solid #00e5ff' }} />
          <span>Target Bastion</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '14px', height: '2px', background: '#f43f5e', borderRadius: '1px' }} />
          <span>Attack Vector</span>
        </div>
      </div>
    </div>
  );
}

