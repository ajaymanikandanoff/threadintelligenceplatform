import React, { useState } from 'react';
import { Crosshair, Bug, Target, ShieldAlert, Copy, Check, ExternalLink, ChevronDown, ChevronUp, Globe } from 'lucide-react';

export default function OverviewTab({ threatData, onSwitchTab }) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [checkedSteps, setCheckedSteps] = useState({});
  const [showAllIocs, setShowAllIocs] = useState(false);

  if (!threatData) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-3)' }}>
        <ShieldAlert size={40} strokeWidth={1.2} style={{ marginBottom: '16px', opacity: 0.4 }} />
        <p style={{ fontSize: '1rem' }}>No threat intelligence loaded</p>
        <p style={{ fontSize: '0.84rem', marginTop: '6px' }}>Click <strong>Ingest</strong> to upload a PDF or select a sample advisory.</p>
      </div>
    );
  }

  const { title, threat_actor = {}, target_sectors = [], cves = [], mitre_techniques = [], iocs = [], executive_summary, attack_flow_steps = [], blue_team_actions = [] } = threatData;

  const copy = (text, i) => { navigator.clipboard.writeText(text); setCopiedIdx(i); setTimeout(() => setCopiedIdx(null), 1500); };

  const displayedIocs = showAllIocs ? iocs : iocs.slice(0, 5);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Hero: Threat Title */}
      <div className="surface" style={{ padding: '28px 32px', borderLeft: '3px solid var(--red)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span className="tag tag-red">{threat_actor.motivation || 'Threat Campaign'}</span>
          {target_sectors.slice(0, 3).map((s, i) => <span key={i} className="tag tag-purple">{s}</span>)}
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-0)', lineHeight: '1.35', marginBottom: '12px' }}>
          {title}
        </h2>
        <div style={{ display: 'flex', gap: '28px', fontSize: '0.84rem', color: 'var(--text-2)', flexWrap: 'wrap' }}>
          <span>Actor: <strong style={{ color: 'var(--red)' }}>{threat_actor.name || 'Unknown'}</strong></span>
          <span>Origin: <strong style={{ color: 'var(--text-1)' }}>{threat_actor.country || '—'}</strong></span>
          <span>CVEs: <strong style={{ color: 'var(--amber)' }}>{cves.length}</strong></span>
          <span>TTPs: <strong style={{ color: 'var(--cyan)' }}>{mitre_techniques.length}</strong></span>
          <span>IoCs: <strong style={{ color: 'var(--green)' }}>{iocs.length}</strong></span>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Threat Actor', value: threat_actor.name || 'APT', sub: threat_actor.country, color: 'var(--red)', icon: Crosshair },
          { label: 'Critical CVEs', value: cves.length, sub: cves[0]?.id || '—', color: 'var(--amber)', icon: Bug },
          { label: 'MITRE TTPs', value: mitre_techniques.length, sub: mitre_techniques[0]?.id || '—', color: 'var(--cyan)', icon: Target },
          { label: 'IoCs Extracted', value: iocs.length, sub: 'IPs, Hashes, Domains', color: 'var(--green)', icon: Globe }
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="surface" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: '600' }}>{kpi.label}</span>
                <Icon size={16} color={kpi.color} strokeWidth={1.8} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: kpi.color, lineHeight: '1' }}>{kpi.value}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-3)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Two columns: Summary + Attack Chain */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Executive Summary + CVEs */}
        <div className="surface" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '14px', color: 'var(--text-0)' }}>Executive Assessment</h3>
          <p style={{ fontSize: '0.86rem', lineHeight: '1.65', color: 'var(--text-2)', marginBottom: '20px' }}>
            {executive_summary}
          </p>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', marginBottom: '10px', fontWeight: '600' }}>Exploited Vulnerabilities</h4>
            {cves.map((cve, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < cves.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--amber)', fontSize: '0.88rem' }}>{cve.id}</span>
                  <span className="tag tag-red" style={{ marginLeft: '8px' }}>CVSS {cve.cvss}</span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '3px' }}>{cve.description?.substring(0, 80)}...</p>
                </div>
                <a href={`https://nvd.nist.gov/vuln/detail/${cve.id}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-3)' }}>
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Attack Chain */}
        <div className="surface" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '14px', color: 'var(--text-0)' }}>Attack Kill Chain</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {attack_flow_steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', paddingBottom: '16px', position: 'relative' }}>
                {/* Vertical line connector */}
                {i < attack_flow_steps.length - 1 && (
                  <div style={{ position: 'absolute', left: '12px', top: '28px', bottom: '0', width: '1px', background: 'var(--border)' }}></div>
                )}
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                  background: 'var(--bg-3)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: '700', color: 'var(--purple)',
                  fontFamily: 'var(--font-mono)', zIndex: 1
                }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: '1.5', paddingTop: '3px' }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two columns: Remediation Checklist + IoC Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Blue Team Checklist */}
        <div className="surface" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '14px', color: 'var(--text-0)' }}>Remediation Checklist</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {blue_team_actions.map((action, i) => (
              <label key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '10px 12px', borderRadius: '6px', cursor: 'pointer',
                background: checkedSteps[i] ? 'rgba(104, 211, 145, 0.06)' : 'transparent',
                border: `1px solid ${checkedSteps[i] ? 'rgba(104, 211, 145, 0.2)' : 'var(--border)'}`,
                transition: 'all 0.15s ease'
              }}>
                <input
                  type="checkbox"
                  checked={!!checkedSteps[i]}
                  onChange={() => setCheckedSteps(prev => ({ ...prev, [i]: !prev[i] }))}
                  style={{
                    width: '16px', height: '16px', marginTop: '2px', flexShrink: 0,
                    accentColor: 'var(--green)', cursor: 'pointer'
                  }}
                />
                <span style={{
                  fontSize: '0.84rem', lineHeight: '1.45', color: checkedSteps[i] ? 'var(--text-3)' : 'var(--text-2)',
                  textDecoration: checkedSteps[i] ? 'line-through' : 'none'
                }}>
                  {action}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* IoC Table */}
        <div className="surface" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-0)' }}>Indicators of Compromise</h3>
            <span className="tag tag-cyan">{iocs.length}</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '6px 0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', fontWeight: '600' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '6px 0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', fontWeight: '600' }}>Value</th>
                <th style={{ textAlign: 'right', padding: '6px 0', width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {displayedIocs.map((ioc, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '8px 0' }}>
                    <span className={`tag ${ioc.type === 'ipv4' ? 'tag-cyan' : ioc.type === 'sha256' ? 'tag-purple' : 'tag-amber'}`}>{ioc.type}</span>
                  </td>
                  <td style={{ padding: '8px 0', fontFamily: 'var(--font-mono)', color: 'var(--text-1)', fontSize: '0.78rem', wordBreak: 'break-all' }}>
                    {ioc.value}
                  </td>
                  <td style={{ padding: '8px 0', textAlign: 'right' }}>
                    <button onClick={() => copy(ioc.value, i)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: copiedIdx === i ? 'var(--green)' : 'var(--text-3)',
                      display: 'inline-flex', alignItems: 'center', padding: '4px'
                    }}>
                      {copiedIdx === i ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {iocs.length > 5 && (
            <button
              onClick={() => setShowAllIocs(!showAllIocs)}
              className="btn-ghost"
              style={{ marginTop: '10px', width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
            >
              {showAllIocs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{showAllIocs ? 'Show Less' : `Show All ${iocs.length} Indicators`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
