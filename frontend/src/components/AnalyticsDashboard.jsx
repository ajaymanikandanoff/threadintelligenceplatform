import React, { useMemo } from 'react';
import { AlertTriangle, Shield, TrendingUp, PieChart, Activity } from 'lucide-react';

const PALETTE = ['#f43f5e', '#f59e0b', '#38bdf8', '#818cf8', '#10b981', '#ec4899'];

function DonutChart({ segments, size = 130 }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const computedSegments = segments.reduce((acc, seg) => {
    const strokeDashoffset = circumference - (seg.value / total) * circumference;
    const rotateAngle = acc.running * 360;
    return {
      running: acc.running + seg.value / total,
      items: [...acc.items, { ...seg, strokeDashoffset, rotateAngle }]
    };
  }, { running: 0, items: [] }).items;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--bg-overlay)" strokeWidth={strokeWidth}
        />
        {computedSegments.map((seg, i) => (
          <circle
            key={i}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={seg.strokeDashoffset}
            style={{
              transformOrigin: '50% 50%',
              transform: `rotate(${seg.rotateAngle}deg)`,
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        ))}
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          {total}
        </span>
        <span style={{ fontSize: '9.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.06em' }}>
          TOTAL IOCS
        </span>
      </div>
    </div>
  );
}

function MetricProgressBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{label}</span>
        <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
          {value} <span style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height: '6px', background: 'var(--bg-overlay)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: '3px', transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }} />
      </div>
    </div>
  );
}

function RiskMeter({ score }) {
  const clamped = Math.max(0, Math.min(100, score));
  const angle = -135 + (clamped / 100) * 270;
  const isCritical = clamped >= 75;
  const isHigh = clamped >= 50 && clamped < 75;
  const isMedium = clamped >= 25 && clamped < 50;
  const color = isCritical ? 'var(--red)' : isHigh ? 'var(--amber)' : isMedium ? '#fbbf24' : 'var(--green)';
  const label = isCritical ? 'CRITICAL RISK' : isHigh ? 'HIGH RISK' : isMedium ? 'MODERATE' : 'GUARDED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <svg width="220" height="130" viewBox="0 0 220 130">
        <path
          d="M 25 115 A 85 85 0 1 1 195 115"
          fill="none" stroke="var(--bg-overlay)" strokeWidth="14" strokeLinecap="round"
        />
        <path
          d="M 25 115 A 85 85 0 1 1 195 115"
          fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * 267} 267`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <circle cx="110" cy="115" r="7" fill="var(--bg-elevated)" stroke={color} strokeWidth="2.5" />
        <line
          x1="110" y1="115"
          x2={110 + 60 * Math.cos((angle * Math.PI) / 180)}
          y2={115 + 60 * Math.sin((angle * Math.PI) / 180)}
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div style={{
        fontSize: '28px', fontWeight: '900', color, fontFamily: 'var(--font-mono)',
        marginTop: '-16px', letterSpacing: '-0.02em'
      }}>
        {clamped}<span style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>/100</span>
      </div>
      <div style={{
        fontSize: '10.5px', fontWeight: '800', color, letterSpacing: '0.08em',
        padding: '3px 10px', borderRadius: '4px', background: `${color}18`,
        border: `1px solid ${color}33`, marginTop: '4px', fontFamily: 'var(--font-mono)'
      }}>
        {label}
      </div>
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

    let riskScore = 0;
    riskScore += Math.min(maxCvss * 8, 40);
    riskScore += Math.min(mitre_techniques.length * 5, 25);
    riskScore += Math.min(iocs.length * 2, 20);
    riskScore += cves.length >= 2 ? 10 : cves.length * 5;
    riskScore += target_sectors.length >= 3 ? 5 : 0;
    riskScore = Math.min(Math.round(riskScore), 100);

    return { iocByType, tacticCount, maxCvss, avgCvss, riskScore, cves, mitre_techniques, iocs, target_sectors, threat_actor };
  }, [threatData]);

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
        <PieChart size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
        <p>No active threat telemetry to analyze. Ingest an advisory first.</p>
      </div>
    );
  }

  const iocSegments = Object.entries(stats.iocByType).map(([type, count], i) => ({
    label: type.toUpperCase(),
    value: count,
    color: PALETTE[i % PALETTE.length]
  }));

  const tacticEntries = Object.entries(stats.tacticCount).sort((a, b) => b[1] - a[1]);
  const maxTactic = tacticEntries.length > 0 ? tacticEntries[0][1] : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Top Banner */}
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '18px 22px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--accent)" />
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              SOC Threat Metrics & Behavioral Analytics
            </h2>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Multi-dimensional risk analysis computed from CVSS vulnerability scores, MITRE ATT&CK coverage, and extracted network telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{
            padding: '5px 12px', borderRadius: '6px', fontSize: '11px',
            background: 'var(--bg-base)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)'
          }}>
            Adversary Attribution: <strong style={{ color: 'var(--text-primary)' }}>{stats.threat_actor?.name || 'Unknown'}</strong>
          </span>
        </div>
      </div>

      {/* Row 1: Risk Gauge + Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px' }}>
        {/* Risk Gauge Card */}
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '24px 20px', display: 'flex',
          flexDirection: 'column', alignItems: 'center', gap: '10px'
        }}>
          <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', fontWeight: '700' }}>
            Aggregate Risk Index
          </div>
          <RiskMeter score={stats.riskScore} />
          <div style={{
            fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center',
            lineHeight: '1.5', marginTop: '6px', background: 'var(--bg-base)',
            padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)'
          }}>
            {stats.riskScore >= 75
              ? '🚨 Critical risk advisory active. Enforce emergency perimeter blocks and patch public gateways.'
              : '⚠️ Targeted activity detected. Review network telemetry and enforce detection rules.'}
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            {
              label: 'Max Exploit CVSS',
              value: stats.maxCvss > 0 ? stats.maxCvss.toFixed(1) : 'None',
              sub: `Average: ${stats.avgCvss > 0 ? stats.avgCvss.toFixed(1) : 'N/A'}`,
              color: 'var(--red)',
              icon: AlertTriangle
            },
            {
              label: 'Attack Techniques',
              value: stats.mitre_techniques.length,
              sub: `Across ${tacticEntries.length} MITRE tactics`,
              color: 'var(--accent)',
              icon: TrendingUp
            },
            {
              label: 'Target Sectors',
              value: stats.target_sectors.length,
              sub: stats.target_sectors.slice(0, 2).join(', ') || 'Global Infrastructure',
              color: '#818cf8',
              icon: Shield
            },
            {
              label: 'Active Indicators',
              value: stats.iocs.length,
              sub: Object.entries(stats.iocByType).map(([k, v]) => `${v} ${k}`).join(', ') || 'Zero IoCs',
              color: 'var(--green)',
              icon: PieChart
            }
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="stat-card"
                style={{ padding: '18px 20px', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', fontWeight: '700' }}>
                    {s.label}
                  </span>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '7px',
                    background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={15} color={s.color} />
                  </div>
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: s.color, fontFamily: 'var(--font-mono)', margin: '8px 0 2px' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2: IoC Distribution Donut + MITRE Tactic Coverage Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* IoC Type Donut Card */}
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '22px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 16px' }}>
            IoC Indicator Breakdown
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <DonutChart segments={iocSegments} size={130} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {iocSegments.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color, flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{d.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '800', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MITRE Tactic Coverage Progress Bars */}
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '22px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 16px' }}>
            MITRE ATT&CK Tactic Density
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '180px', overflowY: 'auto' }}>
            {tacticEntries.map(([tactic, count], i) => (
              <MetricProgressBar
                key={i}
                label={tactic}
                value={count}
                max={maxTactic}
                color={PALETTE[i % PALETTE.length]}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
