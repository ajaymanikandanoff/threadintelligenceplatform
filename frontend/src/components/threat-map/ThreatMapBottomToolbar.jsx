import React from 'react';
import {
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  RotateCcw,
  Layers,
  ShieldAlert,
  Eye,
  EyeOff
} from 'lucide-react';
import { SEVERITY_COLORS } from './threatData';

export default function ThreatMapBottomToolbar({
  onZoomIn,
  onZoomOut,
  onResetView,
  isFullscreen,
  onToggleFullscreen,
  activeTimeRange,
  onChangeTimeRange,
  visibleLayers,
  onToggleLayer,
  activeSeverity,
  onSelectSeverity
}) {
  const levels = [
    { key: 'critical', label: 'Critical', color: SEVERITY_COLORS.critical },
    { key: 'high', label: 'High', color: SEVERITY_COLORS.high },
    { key: 'medium', label: 'Medium', color: SEVERITY_COLORS.medium },
    { key: 'low', label: 'Low', color: SEVERITY_COLORS.low },
    { key: 'info', label: 'Info', color: SEVERITY_COLORS.info }
  ];

  return (
    <div style={{
      background: 'rgba(8, 14, 28, 0.98)',
      borderTop: '1px solid rgba(0, 229, 255, 0.22)',
      padding: '8px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px',
      zIndex: 10,
      userSelect: 'none'
    }}>
      {/* 1. Threat Severity Legend & Quick Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '2px' }}>
          <ShieldAlert size={13} color="#00e5ff" />
          <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Severity:
          </span>
        </div>

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
                gap: '4px',
                background: isSelected ? `${lvl.color}25` : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${isSelected ? lvl.color : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '5px',
                padding: '2px 7px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: isSelected ? '700' : '500',
                color: isSelected ? '#ffffff' : '#cbd5e1',
                transition: 'all 0.12s ease'
              }}
              title={`Filter by ${lvl.label}`}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: lvl.color,
                boxShadow: isSelected ? `0 0 6px ${lvl.color}` : 'none'
              }} />
              <span>{lvl.label}</span>
            </button>
          );
        })}

        {/* Node Symbols Key */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: '4px',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          paddingLeft: '8px',
          fontSize: '9.5px',
          color: '#94a3b8'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f43f5e' }} />
            Origin
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', border: '1.5px solid #00e5ff' }} />
            Bastion
          </span>
        </div>
      </div>

      {/* 2. Layer Visibility Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '2px' }}>
          <Layers size={13} color="#00e5ff" />
          <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Layers:
          </span>
        </div>

        {[
          { key: 'routes', label: 'Routes' },
          { key: 'markers', label: 'Nodes' },
          { key: 'targets', label: 'Bastions' },
          { key: 'borders', label: 'Borders' },
          { key: 'heatmap', label: 'Heatmap' }
        ].map(layer => {
          const isVis = visibleLayers[layer.key] !== false;
          return (
            <button
              key={layer.key}
              type="button"
              onClick={() => onToggleLayer(layer.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: isVis ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isVis ? '1px solid rgba(0, 229, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '5px',
                padding: '2px 7px',
                fontSize: '10px',
                fontWeight: isVis ? '700' : '500',
                color: isVis ? '#00e5ff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.12s ease'
              }}
            >
              <span>{layer.label}</span>
              {isVis ? <Eye size={11} color="#00e5ff" /> : <EyeOff size={11} color="#64748b" />}
            </button>
          );
        })}
      </div>

      {/* 3. Time Window & Map Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Time Selector */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '5px',
          padding: '2px',
          gap: '2px'
        }}>
          {['1H', '24H', '7D'].map(tr => (
            <button
              key={tr}
              type="button"
              onClick={() => onChangeTimeRange(tr)}
              style={{
                background: activeTimeRange === tr ? 'rgba(0, 229, 255, 0.22)' : 'transparent',
                border: activeTimeRange === tr ? '1px solid rgba(0, 229, 255, 0.45)' : '1px solid transparent',
                color: activeTimeRange === tr ? '#00e5ff' : '#94a3b8',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '9.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {tr}
            </button>
          ))}
        </div>

        {/* Zoom In, Zoom Out, Reset, Fullscreen */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          <button
            type="button"
            onClick={onZoomIn}
            title="Zoom in (+)"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              padding: '4px 7px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.12s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'}
            onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
          >
            <Plus size={13} />
          </button>

          <button
            type="button"
            onClick={onZoomOut}
            title="Zoom out (-)"
            style={{
              background: 'transparent',
              border: 'none',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              color: '#cbd5e1',
              padding: '4px 7px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.12s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'}
            onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
          >
            <Minus size={13} />
          </button>

          <button
            type="button"
            onClick={onResetView}
            title="Reset View (⟲)"
            style={{
              background: 'transparent',
              border: 'none',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              color: '#cbd5e1',
              padding: '4px 7px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.12s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'}
            onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
          >
            <RotateCcw size={12} />
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            style={{
              background: 'transparent',
              border: 'none',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              color: '#cbd5e1',
              padding: '4px 7px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.12s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'}
            onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}
