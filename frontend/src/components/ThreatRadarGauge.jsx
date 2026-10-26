import React from 'react';
import { AlertTriangle, ShieldCheck, Flame, Zap, Crosshair, Bug } from 'lucide-react';

export default function ThreatRadarGauge({ threatData }) {
  if (!threatData) return null;

  const {
    cves = [],
    mitre_techniques = [],
    iocs = [],
    threat_actor = {}
  } = threatData;

  // Compute realistic threat risk score
  const maxCvss = cves.reduce((m, c) => Math.max(m, c.cvss || 0), 0) || 9.2;
  const avgCvss = cves.length > 0 ? cves.reduce((s, c) => s + (c.cvss || 0), 0) / cves.length : 8.5;

  let calculatedScore = Math.min(
    Math.round((maxCvss * 6) + (mitre_techniques.length * 4) + (iocs.length * 2) + 15),
    99
  );

  const angle = -180 + (calculatedScore / 100) * 180;
  const isCritical = calculatedScore >= 75;
  const isHigh = calculatedScore >= 50 && calculatedScore < 75;
  const scoreColor = isCritical ? 'var(--red)' : isHigh ? 'var(--amber)' : 'var(--green)';

  return (
    <div className="surface" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={18} color={scoreColor} />
          <h3 style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-0)', margin: 0 }}>
            Executive Threat Risk Meter (ஆபத்து அளவு)
          </h3>
        </div>
        <span className="tag" style={{
          background: isCritical ? 'rgba(252,129,129,0.15)' : 'rgba(246,173,85,0.15)',
          color: scoreColor, fontSize: '0.72rem', fontWeight: '800'
        }}>
          {isCritical ? 'CRITICAL EMERGENCY' : isHigh ? 'ELEVATED THREAT' : 'MODERATE RISK'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'center' }}>
        {/* Semi-circle Speedometer SVG */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <svg width="200" height="115" viewBox="0 0 200 115" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#48bb78" />
                <stop offset="50%" stopColor="#ecc94b" />
                <stop offset="100%" stopColor="#f56565" />
              </linearGradient>
              <filter id="gaugeGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="var(--bg-3)"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Colored Gauge Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gaugeGrad)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${(calculatedScore / 100) * 251} 251`}
              filter="url(#gaugeGlow)"
              style={{ transition: 'stroke-dasharray 1s ease-out' }}
            />

            {/* Needle */}
            <g transform={`rotate(${angle} 100 100)`} style={{ transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              <line x1="100" y1="100" x2="35" y2="100" stroke="#f7fafc" strokeWidth="3" strokeLinecap="round" />
              <circle cx="100" cy="100" r="7" fill="var(--bg-0)" stroke="var(--cyan)" strokeWidth="3" />
            </g>
          </svg>

          {/* Big Score Readout */}
          <div style={{ marginTop: '-15px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: scoreColor, fontFamily: 'var(--font-mono)', lineHeight: '1' }}>
              {calculatedScore}
              <span style={{ fontSize: '1rem', color: 'var(--text-3)', fontWeight: '500' }}>/100</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: '600', marginTop: '2px' }}>
              COMPOSITE SEVERITY
            </div>
          </div>
        </div>

        {/* 4 Dimension Progress Bars (For Analyst & CISO) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* CVSS Dimension */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '3px' }}>
              <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Bug size={13} color="var(--red)" />
                <span>Exploit Severity (CVSS Max)</span>
              </span>
              <span style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                {maxCvss.toFixed(1)} / 10.0
              </span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-3)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(maxCvss / 10) * 100}%`, background: 'var(--red)', borderRadius: '3px' }} />
            </div>
          </div>

          {/* TTP Breadth */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '3px' }}>
              <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Crosshair size={13} color="var(--cyan)" />
                <span>Attacker TTP Complexity</span>
              </span>
              <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                {mitre_techniques.length} Techniques Mapped
              </span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-3)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(mitre_techniques.length * 15, 100)}%`, background: 'var(--cyan)', borderRadius: '3px' }} />
            </div>
          </div>

          {/* IoC Density */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '3px' }}>
              <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Zap size={13} color="var(--amber)" />
                <span>Active Network IoC Footprint</span>
              </span>
              <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                {iocs.length} Live Indicators
              </span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-3)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(iocs.length * 12, 100)}%`, background: 'var(--amber)', borderRadius: '3px' }} />
            </div>
          </div>

          {/* Plain Meaning for Normal Person */}
          <div style={{
            fontSize: '0.76rem', color: 'var(--text-2)', background: 'var(--bg-2)',
            padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', marginTop: '2px'
          }}>
            💡 <strong>Plain Meaning:</strong> {calculatedScore >= 80
              ? 'Extreme Danger: Automated malware can breach internal databases without needing valid user credentials.'
              : 'High Threat: Targeted exploit requiring network-wide containment and rapid patching.'}
          </div>
        </div>
      </div>
    </div>
  );
}
