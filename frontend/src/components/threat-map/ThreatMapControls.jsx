import React from 'react';
import {
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  RotateCcw,
  Layers,
  Clock,
  Radio,
  Eye,
  EyeOff
} from 'lucide-react';

export default function ThreatMapControls({
  onZoomIn,
  onZoomOut,
  onResetView,
  isFullscreen,
  onToggleFullscreen,
  activeTimeRange,
  onChangeTimeRange,
  visibleLayers,
  onToggleLayer
}) {
  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      right: '16px',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'auto'
    }}>
      {/* Zoom & Fullscreen Controls Group */}
      <div style={{
        background: 'rgba(7, 11, 20, 0.88)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '9px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
      }}>
        <button
          type="button"
          onClick={onZoomIn}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#cbd5e1',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          title="Zoom in (+)"
          onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'}
          onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
        >
          <Plus size={16} />
        </button>

        <button
          type="button"
          onClick={onZoomOut}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#cbd5e1',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          title="Zoom out (-)"
          onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'}
          onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
        >
          <Minus size={16} />
        </button>

        <button
          type="button"
          onClick={onResetView}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#cbd5e1',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          title="Reset World View"
          onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'}
          onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
        >
          <RotateCcw size={14} />
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'}
          onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      {/* Layer Toggles Popover */}
      <div style={{
        background: 'rgba(7, 11, 20, 0.88)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '9px',
        padding: '6px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 4px' }}>
          Layers
        </div>

        {[
          { key: 'routes', label: 'Attack Routes' },
          { key: 'markers', label: 'Threat Nodes' },
          { key: 'borders', label: 'Borders' }
        ].map(layer => {
          const isVisible = visibleLayers[layer.key] !== false;
          return (
            <button
              key={layer.key}
              type="button"
              onClick={() => onToggleLayer(layer.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                background: isVisible ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                border: 'none',
                borderRadius: '5px',
                padding: '4px 6px',
                cursor: 'pointer',
                color: isVisible ? '#f8fafc' : '#64748b',
                fontSize: '10.5px',
                fontWeight: isVisible ? '600' : '400',
                transition: 'all 0.12s ease'
              }}
            >
              <span>{layer.label}</span>
              {isVisible ? <Eye size={12} color="#00e5ff" /> : <EyeOff size={12} color="#64748b" />}
            </button>
          );
        })}
      </div>

      {/* Time Range Selector */}
      <div style={{
        background: 'rgba(7, 11, 20, 0.88)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '9px',
        padding: '4px',
        display: 'flex',
        gap: '3px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
      }}>
        {['1H', '24H', '7D'].map(tr => (
          <button
            key={tr}
            type="button"
            onClick={() => onChangeTimeRange(tr)}
            style={{
              background: activeTimeRange === tr ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
              border: activeTimeRange === tr ? '1px solid rgba(0, 229, 255, 0.4)' : '1px solid transparent',
              color: activeTimeRange === tr ? '#00e5ff' : '#94a3b8',
              borderRadius: '5px',
              padding: '3px 7px',
              fontSize: '10px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {tr}
          </button>
        ))}
      </div>
    </div>
  );
}

