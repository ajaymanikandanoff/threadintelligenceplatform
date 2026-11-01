import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Bug, ShieldCheck,
  Volume2, VolumeX,
  Zap, TrendingUp, Activity, Eye, Lock,
  ChevronRight, ExternalLink, Terminal, Layers
} from 'lucide-react';
import ThreatRadarGauge from './ThreatRadarGauge';
import CyberKillChainVisual from './CyberKillChainVisual';
import KnowledgeGraph from './KnowledgeGraph';

/* ─── Severity helpers ─── */
const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];
const SEVERITY_COLORS = {
  critical: { text: 'var(--red)', bg: 'var(--red-dim)', border: 'rgba(244,63,94,0.25)' },
  high:     { text: 'var(--amber)', bg: 'var(--amber-dim)', border: 'rgba(245,158,11,0.25)' },
  medium:   { text: 'var(--purple)', bg: 'var(--purple-dim)', border: 'rgba(129,140,248,0.25)' },
  low:      { text: 'var(--green)', bg: 'var(--green-dim)', border: 'rgba(16,185,129,0.25)' },
};
const getSev = (s = '') => SEVERITY_ORDER.find(k => s.toLowerCase().includes(k)) || 'medium';

/* ─── Sub-components ─── */

function KPICard({ label, value, sub, color = 'var(--accent)', icon: Icon }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
            {label}
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color, lineHeight: 1, letterSpacing: '-0.03em', fontFamily: 'var(--font-mono)' }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '5px' }}>{sub}</div>}
        </div>
        {Icon && (
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'var(--bg-overlay)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon size={16} color={color} />
          </div>
        )}
      </div>
    </div>
  );
}

function ChecklistItem({ step, idx, checked, onToggle }) {
  return (
    <div
      onClick={() => onToggle(idx)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        padding: '11px 14px', borderRadius: '8px', cursor: 'pointer',
        background: checked ? 'var(--green-dim)' : 'var(--bg-overlay)',
        border: `1px solid ${checked ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
        transition: 'all 0.15s ease'
      }}
    >
      <div style={{
        width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
        background: checked ? 'var(--green)' : 'transparent',
        border: `1.5px solid ${checked ? 'var(--green)' : 'var(--border-strong)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: '1px', transition: 'all 0.15s ease'
      }}>
        {checked && <span style={{ color: '#fff', fontSize: '11px', fontWeight: '900' }}>✓</span>}
      </div>
      <div style={{
        flex: 1, fontSize: '13px',
        color: checked ? 'var(--text-tertiary)' : 'var(--text-primary)',
        textDecoration: checked ? 'line-through' : 'none',
        lineHeight: '1.5'
      }}>
        {typeof step === 'string' ? step : step.action || step}
      </div>
      <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', flexShrink: 0, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
        PHASE {idx + 1}
      </span>
    </div>
  );
}

function ThreatDossierCard({ summary, actor, sectors }) {
  const safeSectors = Array.isArray(sectors) ? sectors : [];
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '13px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-overlay)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={15} color="var(--accent)" />
          <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Threat Incident Dossier
          </span>
          <span style={{
            fontSize: '9.5px', padding: '1.5px 6px', borderRadius: '3px',
            background: 'var(--accent-dim)', color: 'var(--accent)',
            border: '1px solid rgba(56,189,248,0.25)', fontWeight: '700', fontFamily: 'var(--font-mono)'
          }}>
            TACTICAL INTEL
          </span>
        </div>
      </div>

      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        <div style={{ padding: '14px', background: 'var(--bg-overlay)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent)', marginBottom: '6px' }}>
            🚨 Incident Overview & Attack Vector
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.65', margin: 0 }}>
            {summary || 'No threat summary available.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ padding: '12px 14px', background: 'var(--red-dim)', borderRadius: '8px', border: '1px solid rgba(244,63,94,0.25)' }}>
            <div style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--red)', marginBottom: '5px' }}>
              Attribution / Threat Actor
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {actor?.name || 'Unknown Actor'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {actor?.country || actor?.origin || actor?.type || 'Nation-State / Cybercrime Cartel'}
            </div>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--amber-dim)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.25)' }}>
            <div style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--amber)', marginBottom: '5px' }}>
              Targeted Critical Sectors
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {safeSectors.slice(0, 2).join(', ') || 'Multiple Infrastructure Sectors'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {safeSectors.length > 2 ? `+${safeSectors.length - 2} additional industries affected` : 'Enterprise Infrastructure'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function OverviewTab({ threatData, onSwitchTab, _onOpenIngest }) {
  const [checkedSteps, setCheckedSteps]     = useState({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSection, setActiveSection]   = useState('briefing');

  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  if (!threatData) return null;

  const {
    title = '',
    threat_actor = {},
    target_sectors = [],
    cves = [],
    mitre_techniques = [],
    iocs = [],
    executive_summary,
    attack_flow_steps = [],
    blue_team_actions = [],
    graph_data
  } = threatData;

  const safeCves    = Array.isArray(cves) ? cves : [];
  const safeMitre   = Array.isArray(mitre_techniques) ? mitre_techniques : [];
  const safeIocs    = Array.isArray(iocs) ? iocs : [];
  const safeFlow    = Array.isArray(attack_flow_steps) ? attack_flow_steps : [];
  const safeActions = Array.isArray(blue_team_actions) ? blue_team_actions : [];

  const riskScore = Math.min(100, Math.round(
    (safeCves.filter(c => c && c.severity === 'critical').length * 20) +
    (safeMitre.length * 4) +
    (safeIocs.length * 1.5)
  ));

  const toggleCheck = (idx) => setCheckedSteps(p => ({ ...p, [idx]: !p[idx] }));

  const toggleAudio = () => {
    if (!('speechSynthesis' in window)) { alert('Speech synthesis not supported in this browser.'); return; }
    if (isPlayingAudio) { window.speechSynthesis.cancel(); setIsPlayingAudio(false); return; }
    const text = `Threat Report: ${title}. ${executive_summary || ''}`;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US'; utt.rate = 0.95;
    utt.onend = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utt);
    setIsPlayingAudio(true);
  };

  const SECTION_TABS = [
    { id: 'briefing',  label: 'Threat Dossier',    icon: Eye },
    { id: 'killchain', label: 'Attack Lifecycle',  icon: Terminal },
    { id: 'checklist', label: 'Response Playbook', icon: ShieldCheck },
    { id: 'graph',     label: 'Knowledge Graph',   icon: Layers },
  ];

  const doneCount = Object.values(checkedSteps).filter(Boolean).length;
  const totalSteps = safeActions.length || safeFlow.length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* ── Page Title & Controls ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-red">VERIFIED ADVISORY</span>
            {threat_actor?.origin && (
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                ORIGIN: {threat_actor.origin.toUpperCase()}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em', lineHeight: '1.3', maxWidth: '780px' }}>
            {title}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={toggleAudio}
            className="btn-ghost"
            style={{ fontSize: '12px', color: isPlayingAudio ? 'var(--red)' : undefined }}
            title={isPlayingAudio ? 'Stop audio playback' : 'Listen to executive summary read-out'}
          >
            {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{isPlayingAudio ? 'Stop Audio' : 'Audio Brief'}</span>
          </button>
        </div>
      </div>

      {/* ── Executive KPI Metric Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <KPICard
          label="Composite Threat Index"
          value={`${riskScore}%`}
          sub="Risk severity score"
          color={riskScore > 70 ? 'var(--red)' : riskScore > 40 ? 'var(--amber)' : 'var(--green)'}
          icon={Activity}
        />
        <KPICard
          label="Identified CVE Exploits"
          value={cves.length}
          sub={`${cves.filter(c => c && c.severity === 'critical').length} Critical CVSS flaws`}
          color="var(--amber)"
          icon={Bug}
        />
        <KPICard
          label="MITRE ATT&CK Techniques"
          value={mitre_techniques.length}
          sub="Adversary behaviors mapped"
          color="var(--purple)"
          icon={TrendingUp}
        />
        <KPICard
          label="Network & File Indicators"
          value={iocs.length}
          sub="Actionable blocklist IoCs"
          color="var(--accent)"
          icon={ShieldAlert}
        />
      </div>

      {/* ── Dual-Pane Tactical Center: Gauge + Dossier ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'stretch' }}>
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Composite Risk Index
          </div>
          <ThreatRadarGauge score={riskScore} cveCount={cves.length} iocCount={iocs.length} tacticCount={mitre_techniques.length} />
        </div>

        <ThreatDossierCard
          summary={executive_summary}
          actor={threat_actor}
          sectors={target_sectors}
        />
      </div>

      {/* ── Segmented Sub-Tab Switcher ── */}
      <div>
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'var(--bg-overlay)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          width: 'fit-content',
          marginBottom: '16px'
        }}>
          {SECTION_TABS.map(t => {
            const Icon = t.icon;
            const active = activeSection === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveSection(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '7px 14px', fontSize: '12.5px', fontWeight: active ? '700' : '500',
                  background: active ? 'var(--bg-elevated)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  border: `1px solid ${active ? 'var(--border-strong)' : 'transparent'}`,
                  borderRadius: '7px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <Icon size={14} color={active ? 'var(--accent)' : 'var(--text-tertiary)'} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Threat Dossier: CVEs & MITRE Grid */}
        {activeSection === 'briefing' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* CVEs */}
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-overlay)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bug size={14} color="var(--amber)" />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>Software Vulnerabilities (CVEs)</span>
                </div>
                <span className="badge badge-amber">{cves.length} Identified</span>
              </div>
              <div style={{ padding: '10px' }}>
                {safeCves.slice(0, 5).map((cve, i) => {
                  const sev = getSev(cve.severity);
                  const col = SEVERITY_COLORS[sev];
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
                        background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)',
                        transition: 'border-color 0.12s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                    >
                      <span style={{
                        fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: '800',
                        color: col.text, background: col.bg, border: `1px solid ${col.border}`,
                        padding: '2.5px 7px', borderRadius: '4px', flexShrink: 0
                      }}>
                        {cve.id || `CVE-${i}`}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cve.description || cve.affected_product || cve.software || 'Vulnerability flaw'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                          CVSS: {cve.cvss ?? cve.cvss_score ?? '—'} · {cve.affected_product || cve.software || 'Impacted Gateway'}
                        </div>
                      </div>
                      <a
                        href={`https://nvd.nist.gov/vuln/detail/${cve.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ padding: '4px', borderRadius: '4px', color: 'var(--text-tertiary)' }}
                        title="View Official NIST NVD Advisory"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  );
                })}
                {safeCves.length > 5 && (
                  <button onClick={() => onSwitchTab('technical')} style={{ width: '100%', padding: '9px', marginTop: '6px', background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                    View all {safeCves.length} CVEs in Technical Deep Dive →
                  </button>
                )}
                {safeCves.length === 0 && <div style={{ textAlign: 'center', padding: '30px', fontSize: '12.5px', color: 'var(--text-tertiary)' }}>No CVEs extracted from this advisory.</div>}
              </div>
            </div>

            {/* MITRE Techniques */}
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-overlay)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={14} color="var(--purple)" />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>Adversary Techniques</span>
                </div>
                <span className="badge badge-purple">MITRE ATT&CK</span>
              </div>
              <div style={{ padding: '10px' }}>
                {safeMitre.slice(0, 5).map((tech, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '12px',
                      padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
                      background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)',
                      transition: 'border-color 0.12s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  >
                    <span style={{
                      fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: '800',
                      color: 'var(--purple)', background: 'var(--purple-dim)', border: '1px solid rgba(129,140,248,0.25)',
                      padding: '2.5px 7px', borderRadius: '4px', flexShrink: 0, marginTop: '1px'
                    }}>
                      {tech.id || `T${1000 + i}`}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)' }}>{tech.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{tech.tactic || 'Adversary Tactic'}</div>
                    </div>
                  </div>
                ))}
                {safeMitre.length > 5 && (
                  <button onClick={() => onSwitchTab('technical')} style={{ width: '100%', padding: '9px', marginTop: '6px', background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                    View full {safeMitre.length} techniques on Heatmap →
                  </button>
                )}
                {safeMitre.length === 0 && <div style={{ textAlign: 'center', padding: '30px', fontSize: '12.5px', color: 'var(--text-tertiary)' }}>No techniques mapped yet.</div>}
              </div>
            </div>
          </div>
        )}

        {/* Attack Kill Chain */}
        {activeSection === 'killchain' && (
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', padding: '22px' }}>
            <CyberKillChainVisual attackFlowSteps={attack_flow_steps} />
          </div>
        )}

        {/* Response Checklist */}
        {activeSection === 'checklist' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Execute and verify each containment action to neutralize the threat. Click item to mark as verified.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {totalSteps > 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: 'var(--green)', fontWeight: '800' }}>{doneCount}</span> / {totalSteps} COMPLETE
                  </div>
                )}
                {totalSteps > 0 && (
                  <div style={{ width: '100px', height: '6px', background: 'var(--bg-raised)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(doneCount / totalSteps) * 100}%`, background: 'var(--green)', borderRadius: '99px', transition: 'width 0.4s ease' }} />
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(safeActions.length ? safeActions : safeFlow).map((step, i) => (
                <ChecklistItem key={i} step={step} idx={i} checked={!!checkedSteps[i]} onToggle={toggleCheck} />
              ))}
              {!safeActions.length && !safeFlow.length && (
                <div style={{ textAlign: 'center', padding: '40px', fontSize: '13px', color: 'var(--text-tertiary)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                  No containment playbooks extracted from this report.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Knowledge Graph */}
        {activeSection === 'graph' && (
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Adversary ontology and relationship network connecting actor, exploits, malware strains and targeted sectors.
            </div>
            {graph_data ? (
              <KnowledgeGraph graphData={graph_data} height={420} />
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                Knowledge graph not available for this report.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Quick Navigation Shortcuts ── */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
        <div className="section-label" style={{ marginBottom: '10px' }}>Direct Incident Response Shortcuts</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {[
            { tab: 'defense',   icon: ShieldCheck, label: 'Perimeter Defense Generator', desc: 'Deploy firewall & SIEM rules', color: 'var(--green)' },
            { tab: 'iocs',      icon: Lock,        label: 'Blocklist IoC Telemetry',     desc: `${iocs.length} extracted indicators`, color: 'var(--red)' },
            { tab: 'technical', icon: TrendingUp,  label: 'MITRE ATT&CK Matrix Heatmap', desc: `${mitre_techniques.length} techniques mapped`, color: 'var(--purple)' },
          ].map(a => (
            <button
              key={a.tab}
              onClick={() => onSwitchTab(a.tab)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px', borderRadius: '10px', textAlign: 'left',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.15s ease',
                fontFamily: 'var(--font-sans)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = a.color;
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--bg-elevated)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '9px',
                background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <a.icon size={17} color={a.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>{a.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{a.desc}</div>
              </div>
              <ChevronRight size={14} color="var(--text-tertiary)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
