import React, { useMemo } from 'react';
import { AlertTriangle, Shield, TrendingUp, PieChart } from 'lucide-react';

const COLORS = ['var(--red)', 'var(--amber)', 'var(--cyan)', 'var(--purple)', 'var(--green)'];

function MiniPie({ segments, size = 100 }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let cum = 0;
  const paths = segments.map((seg, i) => {
    const start = cum / total;
    cum += seg.value;
    const end = cum / total;
    const startAngle = start * 2 * Math.PI - Math.PI / 2;
    const endAngle = end * 2 * Math.PI - Math.PI / 2;
    const r = size / 2 - 4;
    const cx = size / 2, cy = size / 2;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
    const large = seg.value / total > 0.5 ? 1 : 0;
    return <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill={seg.color} opacity={0.85} />;
  });
  return <svg width={size} height={size}>{paths}</svg>;
}

function HBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
        <span style={{ color: 'var(--text-2)' }}>{label}</span>
        <span style={{ color: 'var(--text-1)', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{value}</span>
      </div>
      <div style={{ height: '6px', background: 'var(--bg-3)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
      </div>
    </div>
  );
}

function RiskGauge({ score }) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const angle = -90 + (clampedScore / 100) * 180;
  const label = clampedScore >= 80 ? 'CRITICAL' : clampedScore >= 60 ? 'HIGH' : clampedScore >= 40 ? 'MEDIUM' : 'LOW';
  const color = clampedScore >= 80 ? 'var(--red)' : clampedScore >= 60 ? 'var(--amber)' : clampedScore >= 40 ? '#ecc94b' : 'var(--green)';
  
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="160" height="90" viewBox="0 0 160 90">
        <path d="M 15 80 A 65 65 0 0 1 145 80" fill="none" stroke="var(--bg-3)" strokeWidth="10" strokeLinecap="round" />
        <path d="M 15 80 A 65 65 0 0 1 145 80" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${(clampedScore / 100) * 204} 204`} style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        <line x1="80" y1="80" x2={80 + 45 * Math.cos((angle * Math.PI) / 180)} y2={80 + 45 * Math.sin((angle * Math.PI) / 180)}
          stroke="var(--text-0)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="80" cy="80" r="4" fill="var(--text-0)" />
      </svg>
      <div style={{ fontSize: '1.6rem', fontWeight: '800', color, marginTop: '-4px', fontFamily: 'var(--font-mono)' }}>{clampedScore}</div>
      <div style={{ fontSize: '0.72rem', fontWeight: '700', color, letterSpacing: '0.08em', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

export default function AnalyticsDashboard({ threatData }) {
  const stats = useMemo(() => {
    if (!threatData) return null;
    const { cves = [], mitre_techniques = [], iocs = [], target_sectors = [], threat_actor = {} } = threatData;

    const iocByType = {};
    iocs.forEach(i => { iocByType[i.type] = (iocByType[i.type] || 0) + 1; });

    const tacticCount = {};
    mitre_techniques.forEach(t => { tacticCount[t.tactic] = (tacticCount[t.tactic] || 0) + 1; });

    const maxCvss = cves.reduce((m, c) => Math.max(m, c.cvss || 0), 0);
    const avgCvss = cves.length > 0 ? cves.reduce((s, c) => s + (c.cvss || 0), 0) / cves.length : 0;

    // Risk score calculation
    let riskScore = 0;
    riskScore += Math.min(maxCvss * 8, 40);            // Max 40 from CVSS
    riskScore += Math.min(mitre_techniques.length * 5, 25); // Max 25 from TTPs
    riskScore += Math.min(iocs.length * 2, 20);          // Max 20 from IoCs
    riskScore += cves.length >= 2 ? 10 : cves.length * 5;  // Max 10 from CVE count
    riskScore += target_sectors.length >= 3 ? 5 : 0;     // 5 bonus for multi-sector
    riskScore = Math.min(Math.round(riskScore), 100);

    return { iocByType, tacticCount, maxCvss, avgCvss, riskScore, cves, mitre_techniques, iocs, target_sectors, threat_actor };
  }, [threatData]);

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-3)' }}>
        <PieChart size={40} strokeWidth={1.2} style={{ marginBottom: '16px', opacity: 0.4 }} />
        <p>No data to visualize. Ingest a threat report first.</p>
      </div>
    );
  }

  const iocPieData = Object.entries(stats.iocByType).map(([type, count], i) => ({ label: type.toUpperCase(), value: count, color: COLORS[i % COLORS.length] }));
  const tacticEntries = Object.entries(stats.tacticCount).sort((a, b) => b[1] - a[1]);
  const maxTactic = tacticEntries.length > 0 ? tacticEntries[0][1] : 1;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-0)' }}>Threat Analytics Dashboard</h2>

      {/* Top row: Risk Gauge + Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px' }}>
        {/* Risk Gauge */}
        <div className="surface" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: '600' }}>Overall Threat Risk Score</div>
          <RiskGauge score={stats.riskScore} />
          <div style={{ fontSize: '0.76rem', color: 'var(--text-3)', textAlign: 'center', lineHeight: '1.4' }}>
            Computed from CVSS severity, TTP coverage, IoC volume, and attack surface.
          </div>
        </div>

        {/* Quick stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { label: 'Max CVSS Score', value: stats.maxCvss.toFixed(1), sub: `Average: ${stats.avgCvss.toFixed(1)}`, color: 'var(--red)', icon: AlertTriangle },
            { label: 'Attack Techniques', value: stats.mitre_techniques.length, sub: `Across ${tacticEntries.length} tactics`, color: 'var(--cyan)', icon: TrendingUp },
            { label: 'Target Sectors', value: stats.target_sectors.length, sub: stats.target_sectors.slice(0, 2).join(', '), color: 'var(--purple)', icon: Shield },
            { label: 'Total Indicators', value: stats.iocs.length, sub: Object.entries(stats.iocByType).map(([k, v]) => `${v} ${k}`).join(', '), color: 'var(--green)', icon: PieChart }
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="surface" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: '600' }}>{s.label}</span>
                  <Icon size={15} color={s.color} strokeWidth={1.8} />
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '700', color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '4px' }}>{s.sub}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom row: IoC Pie + Tactic Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* IoC Distribution Pie */}
        <div className="surface" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-0)', marginBottom: '16px' }}>IoC Type Distribution</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <MiniPie segments={iocPieData} size={110} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {iocPieData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: d.color, flexShrink: 0 }}></span>
                  <span style={{ color: 'var(--text-2)' }}>{d.label}</span>
                  <span style={{ color: 'var(--text-1)', fontWeight: '600', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tactic Coverage Bar Chart */}
        <div className="surface" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-0)', marginBottom: '16px' }}>MITRE Tactic Coverage</h3>
          {tacticEntries.map(([tactic, count], i) => (
            <HBar key={i} label={tactic} value={count} max={maxTactic} color={COLORS[i % COLORS.length]} />
          ))}
        </div>
      </div>
    </div>
  );
}
