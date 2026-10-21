import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Target, 
  Bug, 
  GitCommit, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  Terminal,
  Crosshair,
  Globe
} from 'lucide-react';

export default function OverviewTab({ threatData, onSwitchTab }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});

  if (!threatData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <p>No active threat intelligence loaded. Click "Ingest Report" to begin analysis.</p>
      </div>
    );
  }

  const {
    title,
    threat_actor = {},
    target_sectors = [],
    cves = [],
    mitre_techniques = [],
    iocs = [],
    executive_summary,
    attack_flow_steps = [],
    blue_team_actions = []
  } = threatData;

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleStep = (index) => {
    setCompletedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Threat Banner */}
      <div className="cyber-card cyber-card-threat" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-red">
                <span className="pulse-dot" style={{ background: 'var(--accent-red)' }}></span>
                CRITICAL THREAT DOSSIER
              </span>
              <span className="badge badge-purple">{threat_actor.motivation || 'Cyber Espionage & Extortion'}</span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
              {title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span><strong>Attributed Actor:</strong> <span style={{ color: 'var(--accent-red)', fontWeight: '600' }}>{threat_actor.name || 'Unknown APT'}</span></span>
              <span><strong>Origin:</strong> {threat_actor.country || 'Undetermined'}</span>
              <span><strong>Target Sectors:</strong> {target_sectors.join(', ') || 'Global Enterprise'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="cyber-btn-secondary" 
              onClick={() => onSwitchTab('graph')}
              style={{ background: 'rgba(0, 240, 255, 0.12)', borderColor: 'var(--accent-cyan)' }}
            >
              <GitCommit size={15} color="var(--accent-cyan)" />
              <span>Explore Graph</span>
            </button>
            <button 
              className="cyber-btn-secondary" 
              onClick={() => onSwitchTab('defense')}
              style={{ background: 'rgba(16, 185, 129, 0.12)', borderColor: 'var(--accent-green)' }}
            >
              <CheckCircle2 size={15} color="var(--accent-green)" />
              <span>Get Defense Rules</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div className="cyber-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Threat Actor</span>
            <Crosshair size={18} color="var(--accent-red)" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-red)' }}>
            {threat_actor.name || 'APT Unknown'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Nation: {threat_actor.country || 'Unknown'}
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active CVEs</span>
            <Bug size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-amber)' }}>
            {cves.length} Identified
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {cves[0]?.id || 'Zero-day / Logic flaw'} (CVSS {cves[0]?.cvss || '9.8'})
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MITRE Techniques</span>
            <Target size={18} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>
            {mitre_techniques.length} TTPs Mapped
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Top: {mitre_techniques[0]?.id || 'T1190'} ({mitre_techniques[0]?.tactic || 'Access'})
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>IoCs Extracted</span>
            <ShieldAlert size={18} color="var(--accent-green)" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-green)' }}>
            {iocs.length} Indicators
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            IPs, Domains & SHA256 Hashes
          </div>
        </div>
      </div>

      {/* Two Column Layout: Summary & Attack Path */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '20px'
      }}>
        {/* Executive Threat Summary */}
        <div className="cyber-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Terminal size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', letterSpacing: '0.02em' }}>
              Executive Intelligence Assessment
            </h3>
          </div>
          <p style={{
            fontSize: '0.9rem',
            lineHeight: '1.65',
            color: 'var(--text-muted)',
            marginBottom: '18px'
          }}>
            {executive_summary || 'Analysis indicates targeted threat campaign exploiting critical perimeter applications.'}
          </p>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '10px' }}>
              Exploited Vulnerabilities (CVE Details)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cves.map((cve, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent-amber)', fontSize: '0.9rem' }}>
                        {cve.id}
                      </span>
                      <span className="badge badge-red" style={{ fontSize: '0.68rem' }}>
                        CVSS {cve.cvss || '9.8'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {cve.description || cve.affected_product || 'Remote exploitation and unauthorized privilege escalation'}
                    </p>
                  </div>
                  <a 
                    href={`https://nvd.nist.gov/vuln/detail/${cve.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'var(--text-dim)', transition: 'color 0.2s' }}
                    title="View on NIST NVD"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attack Progression Chain */}
        <div className="cyber-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <GitCommit size={18} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', letterSpacing: '0.02em' }}>
              Adversary Attack Chain Progression
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {attack_flow_steps.map((step, idx) => (
              <div key={idx} style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                position: 'relative'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid var(--accent-purple)',
                  color: 'var(--accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  flex: 1,
                  fontSize: '0.86rem',
                  lineHeight: '1.45',
                  color: 'var(--text-main)'
                }}>
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Blue Team Containment Checklist & IoC Table */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '20px'
      }}>
        {/* Blue Team Actions Checklist */}
        <div className="cyber-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldAlert size={18} color="var(--accent-green)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', letterSpacing: '0.02em' }}>
              Blue Team Remediation Checklist
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            High-priority operational mitigations for network engineers and incident response teams:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {blue_team_actions.map((action, idx) => (
              <div 
                key={idx}
                onClick={() => toggleStep(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  background: completedSteps[idx] ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${completedSteps[idx] ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-subtle)'}`,
                  borderRadius: '8px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  border: `2px solid ${completedSteps[idx] ? 'var(--accent-green)' : 'var(--text-dim)'}`,
                  background: completedSteps[idx] ? 'var(--accent-green)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {completedSteps[idx] && <Check size={14} color="#040814" strokeWidth={3} />}
                </div>
                <div style={{
                  fontSize: '0.86rem',
                  lineHeight: '1.45',
                  color: completedSteps[idx] ? 'var(--text-muted)' : 'var(--text-main)',
                  textDecoration: completedSteps[idx] ? 'line-through' : 'none'
                }}>
                  {action}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicators of Compromise (IoC) Table */}
        <div className="cyber-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', letterSpacing: '0.02em' }}>
                Extracted Indicators of Compromise (IoCs)
              </h3>
            </div>
            <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
              {iocs.length} Indicators
            </span>
          </div>

          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '8px 10px', textTransform: 'uppercase', fontSize: '0.72rem' }}>Type</th>
                  <th style={{ padding: '8px 10px', textTransform: 'uppercase', fontSize: '0.72rem' }}>Indicator Value</th>
                  <th style={{ padding: '8px 10px', textTransform: 'uppercase', fontSize: '0.72rem' }}>Context</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', textTransform: 'uppercase', fontSize: '0.72rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {iocs.map((ioc, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '10px 10px' }}>
                      <span className={`badge ${
                        ioc.type === 'ipv4' ? 'badge-cyan' :
                        ioc.type === 'sha256' ? 'badge-purple' :
                        ioc.type === 'domain' ? 'badge-amber' : 'badge-green'
                      }`} style={{ fontSize: '0.65rem' }}>
                        {ioc.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '10px 10px', fontFamily: 'var(--font-mono)', color: '#fff', wordBreak: 'break-all' }}>
                      {ioc.value}
                    </td>
                    <td style={{ padding: '10px 10px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {ioc.context || 'Malicious Artifact'}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                      <button
                        onClick={() => copyToClipboard(ioc.value, idx)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 8px',
                          color: copiedIndex === idx ? 'var(--accent-green)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem'
                        }}
                        title="Copy indicator value"
                      >
                        {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                        {copiedIndex === idx ? 'Copied' : 'Copy'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
