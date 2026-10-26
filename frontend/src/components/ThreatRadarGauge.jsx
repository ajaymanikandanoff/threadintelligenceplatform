import React from 'react';

export default function ThreatRadarGauge({ score = 0, cveCount = 0, iocCount = 0, tacticCount = 0 }) {
  const s = Math.max(0, Math.min(100, score));
  const angle = -135 + (s / 100) * 270;
  const isCritical = s >= 75;
  const isHigh     = s >= 50 && s < 75;
  const color      = isCritical ? '#f87171' : isHigh ? '#fbbf24' : '#34d399';
  const label      = isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : 'MODERATE';

  // Build arc path for the filled portion
  const toRad = (deg) => (deg * Math.PI) / 180;
  const cx = 100, cy = 100, r = 70;
  const startAngle = -135;
  const endAngle   = startAngle + (s / 100) * 270;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const large = endAngle - startAngle > 180 ? 1 : 0;

  // Needle tip
  const nx = cx + 52 * Math.cos(toRad(angle));
  const ny = cy + 52 * Math.sin(toRad(angle));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
      <svg width="190" height="140" viewBox="0 0 200 145" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#34d399" />
            <stop offset="50%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
          <filter id="needleGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track arc (background) */}
        <path
          d={`M ${cx + r * Math.cos(toRad(startAngle))} ${cy + r * Math.sin(toRad(startAngle))} A ${r} ${r} 0 1 1 ${cx + r * Math.cos(toRad(startAngle + 270))} ${cy + r * Math.sin(toRad(startAngle + 270))}`}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" strokeLinecap="round"
        />

        {/* Filled arc */}
        {s > 0 && (
          <path
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
            fill="none" stroke={`url(#arcGrad)`} strokeWidth="14" strokeLinecap="round"
          />
        )}

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map(v => {
          const a = toRad(startAngle + (v / 100) * 270);
          const r1 = 78, r2 = 86;
          return (
            <line
              key={v}
              x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)}
              x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)}
              stroke="rgba(255,255,255,0.15)" strokeWidth="2"
            />
          );
        })}

        {/* Center */}
        <circle cx={cx} cy={cy} r="7" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

        {/* Needle */}
        <line
          x1={cx} y1={cy} x2={nx} y2={ny}
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
          filter="url(#needleGlow)"
          style={{ transition: 'x2 0.8s ease, y2 0.8s ease' }}
        />

        {/* Score text */}
        <text x={cx} y={cy + 24} textAnchor="middle" fill={color} fontSize="26" fontWeight="800" fontFamily="Inter, sans-serif">{s}</text>
        <text x={cx} y={cy + 38} textAnchor="middle" fill="rgba(148,163,184,0.8)" fontSize="9" fontFamily="Inter, sans-serif" letterSpacing="1">RISK SCORE</text>

        {/* Labels */}
        <text x={cx - 68} y={cy + 22} fill="rgba(52,211,153,0.7)" fontSize="9" fontFamily="Inter">LOW</text>
        <text x={cx + 52} y={cy + 22} fill="rgba(248,113,113,0.7)" fontSize="9" fontFamily="Inter">HIGH</text>
      </svg>

      {/* Severity label */}
      <div style={{
        padding: '4px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
        letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif',
        background: `${color}20`, color, border: `1px solid ${color}40`
      }}>
        {label} THREAT
      </div>

      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', width: '100%' }}>
        {[
          { label: 'CVEs', value: cveCount, c: '#fbbf24' },
          { label: 'IoCs', value: iocCount, c: '#f87171' },
          { label: 'TTPs', value: tacticCount, c: '#a78bfa' },
        ].map(m => (
          <div key={m.label} style={{ textAlign: 'center', padding: '7px 4px', background: 'rgba(255,255,255,0.03)', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', color: m.c, lineHeight: 1, fontFamily: 'Inter' }}>{m.value}</div>
            <div style={{ fontSize: '9px', color: 'rgba(148,163,184,0.7)', marginTop: '2px', fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
