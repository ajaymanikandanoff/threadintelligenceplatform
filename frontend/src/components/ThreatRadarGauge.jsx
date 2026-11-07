import React from 'react';

export default function ThreatRadarGauge({ score = 0, cveCount = 0, iocCount = 0, tacticCount = 0 }) {
  const s = Math.max(0, Math.min(100, score));
  const angle = -135 + (s / 100) * 270;
  const isCritical = s >= 75;
  const isHigh = s >= 50 && s < 75;
  const isMedium = s >= 25 && s < 50;

  const color = isCritical ? 'var(--red)' : isHigh ? 'var(--amber)' : isMedium ? '#fbbf24' : 'var(--green)';
  const label = isCritical ? 'CRITICAL RISK' : isHigh ? 'HIGH RISK' : isMedium ? 'ELEVATED' : 'GUARDED';
  const badgeBg = isCritical ? 'var(--red-dim)' : isHigh ? 'var(--amber-dim)' : 'var(--green-dim)';
  const badgeBorder = isCritical ? 'rgba(244,63,94,0.35)' : isHigh ? 'rgba(245,158,11,0.35)' : 'rgba(16,185,129,0.35)';

  // Build arc path for the filled portion
  const toRad = (deg) => (deg * Math.PI) / 180;
  const cx = 100, cy = 95, r = 68;
  const startAngle = -135;
  const endAngle = startAngle + (s / 100) * 270;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const large = endAngle - startAngle > 180 ? 1 : 0;

  // Needle tip
  const nx = cx + 50 * Math.cos(toRad(angle));
  const ny = cy + 50 * Math.sin(toRad(angle));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
      <svg width="200" height="135" viewBox="0 0 200 135" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track arc (background) */}
        <path
          d={`M ${cx + r * Math.cos(toRad(startAngle))} ${cy + r * Math.sin(toRad(startAngle))} A ${r} ${r} 0 1 1 ${cx + r * Math.cos(toRad(startAngle + 270))} ${cy + r * Math.sin(toRad(startAngle + 270))}`}
          fill="none" stroke="var(--bg-overlay)" strokeWidth="12" strokeLinecap="round"
        />

        {/* Active filled arc */}
        {s > 0 && (
          <path
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
            fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round"
          />
        )}

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map(v => {
          const a = toRad(startAngle + (v / 100) * 270);
          const r1 = 76, r2 = 83;
          return (
            <line
              key={v}
              x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)}
              x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)}
              stroke="var(--border-strong)" strokeWidth="1.5"
            />
          );
        })}

        {/* Needle with glow */}
        <line
          x1={cx} y1={cy} x2={nx} y2={ny}
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
          filter="url(#needleGlow)"
          style={{ transition: 'x2 0.7s cubic-bezier(0.16, 1, 0.3, 1), y2 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        {/* Pivot Center Hub */}
        <circle cx={cx} cy={cy} r="6.5" fill="var(--bg-elevated)" stroke={color} strokeWidth="2.5" />
        <circle cx={cx} cy={cy} r="2.5" fill="#fff" />

        {/* Central Numeric Score Display */}
        <text x={cx} y={cy + 24} textAnchor="middle" fill="var(--text-primary)" fontSize="26" fontWeight="900" fontFamily="var(--font-mono)">
          {s}
        </text>
        <text x={cx} y={cy + 36} textAnchor="middle" fill="var(--text-tertiary)" fontSize="8.5" fontWeight="700" fontFamily="var(--font-mono)" letterSpacing="1.2">
          COMPOSITE INDEX
        </text>

        {/* Range Labels */}
        <text x={cx - 68} y={cy + 18} fill="var(--green)" fontSize="8.5" fontWeight="700" fontFamily="var(--font-mono)">0</text>
        <text x={cx + 60} y={cy + 18} fill="var(--red)" fontSize="8.5" fontWeight="700" fontFamily="var(--font-mono)">100</text>
      </svg>

      {/* Severity Pill */}
      <div style={{
        padding: '3px 12px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '800',
        letterSpacing: '0.06em', fontFamily: 'var(--font-mono)',
        background: badgeBg, color, border: `1px solid ${badgeBorder}`,
        boxShadow: isCritical ? 'var(--shadow-glow-red)' : 'none'
      }}>
        {label}
      </div>

      {/* Telemetry Counter Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', width: '100%' }}>
        {[
          { label: 'CVEs', value: cveCount, c: 'var(--amber)' },
          { label: 'IoCs', value: iocCount, c: 'var(--red)' },
          { label: 'TTPs', value: tacticCount, c: 'var(--purple)' },
        ].map(m => (
          <div key={m.label} style={{
            textAlign: 'center', padding: '8px 4px',
            background: 'var(--bg-overlay)', borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '15px', fontWeight: '800', color: m.c, lineHeight: 1, fontFamily: 'var(--font-mono)' }}>
              {m.value}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginTop: '3px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
