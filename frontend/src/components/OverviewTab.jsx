import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, UserX, Bug, ShieldCheck, ArrowRight,
  Volume2, VolumeX, Languages, AlertTriangle, Clock,
  Zap, TrendingUp, Activity, Eye, Lock, Users,
  ChevronRight, ExternalLink
} from 'lucide-react';
import ThreatRadarGauge from './ThreatRadarGauge';
import CyberKillChainVisual from './CyberKillChainVisual';
import KnowledgeGraph from './KnowledgeGraph';

/* ─── Severity helpers ─── */
const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];
const SEVERITY_COLORS = {
  critical: { text: 'var(--red)', bg: 'var(--red-dim)', border: 'rgba(248,113,113,0.25)' },
  high:     { text: 'var(--amber)', bg: 'var(--amber-dim)', border: 'rgba(251,191,36,0.25)' },
  medium:   { text: 'var(--purple)', bg: 'var(--purple-dim)', border: 'rgba(167,139,250,0.25)' },
  low:      { text: 'var(--green)', bg: 'var(--green-dim)', border: 'rgba(52,211,153,0.25)' },
};
const getSev = (s = '') => SEVERITY_ORDER.find(k => s.toLowerCase().includes(k)) || 'medium';

/* ─── Sub-components ─── */

function KPICard({ label, value, sub, color = 'var(--accent)', icon: Icon }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
            {label}
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{sub}</div>}
        </div>
        {Icon && (
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `rgba(0,0,0,0.1)`, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={15} color={color} />
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{children}</h3>
      {action}
    </div>
  );
}

function ChecklistItem({ step, idx, checked, onToggle }) {
  return (
    <div
      onClick={() => onToggle(idx)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
        background: checked ? 'var(--green-dim)' : 'var(--bg-overlay)',
        border: `1px solid ${checked ? 'rgba(52,211,153,0.25)' : 'var(--border)'}`,
        transition: 'all 0.15s ease'
      }}
    >
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
        background: checked ? 'var(--green)' : 'transparent',
        border: `2px solid ${checked ? 'var(--green)' : 'var(--border-strong)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: '1px', transition: 'all 0.15s ease'
      }}>
        {checked && <span style={{ color: '#fff', fontSize: '10px', fontWeight: '800' }}>✓</span>}
      </div>
      <div style={{ flex: 1, fontSize: '13px', color: checked ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: checked ? 'line-through' : 'none', lineHeight: '1.5' }}>
        {typeof step === 'string' ? step : step.action || step}
      </div>
      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', flexShrink: 0, marginTop: '3px' }}>
        Step {idx + 1}
      </span>
    </div>
  );
}

function PlainEnglishCard({ summary, actor, sectors, languageMode, onToggle }) {
  const isTA = languageMode === 'ta';

  const labels = {
    whathappened: isTA ? '📋 என்ன நடந்தது' : '📋 What Happened',
    whoattacked:  isTA ? '🕵️ யார் தாக்கினார்கள்' : '🕵️ Who Attacked',
    whytarget:    isTA ? '🏭 ஏன் தாக்கப்பட்டது' : '🏭 Who Was Targeted',
    toggle:       isTA ? '🌐 Switch to English' : '🌐 தமிழில் படிக்கவும்',
  };

  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={14} color="var(--accent)" />
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {isTA ? 'எளிய விளக்கம்' : 'Plain English Briefing'}
          </span>
          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '3px', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(56,189,248,0.2)', fontWeight: '700' }}>
            {isTA ? 'தமிழ்' : 'ENGLISH'}
          </span>
        </div>
        <button
          onClick={onToggle}
          style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '6px', background: 'var(--bg-overlay)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          {labels.toggle}
        </button>
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ padding: '12px', background: 'var(--bg-overlay)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: '6px' }}>{labels.whathappened}</div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.65', margin: 0 }}>
            {isTA
              ? (summary ? `${summary.slice(0, 200)}... — இந்த தாக்குதல் இலக்கு கணினிகளில் தரவை திருடவும் அல்லது சேவைகளை நிறுத்தவும் மேற்கொள்ளப்பட்டது.` : 'தரவு கிடைக்கவில்லை.')
              : (summary || 'No summary available.')}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ padding: '12px', background: 'var(--red-dim)', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.2)' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--red)', marginBottom: '6px' }}>{labels.whoattacked}</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{actor?.name || 'Unknown Actor'}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{actor?.origin || actor?.type || ''}</div>
          </div>
          <div style={{ padding: '12px', background: 'var(--amber-dim)', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.2)' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--amber)', marginBottom: '6px' }}>{labels.whytarget}</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{sectors.slice(0, 2).join(', ') || 'Multiple Sectors'}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{sectors.length > 2 ? `+${sectors.length - 2} more sectors` : 'Targeted industries'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function OverviewTab({ threatData, onSwitchTab, onOpenIngest }) {
  const [checkedSteps, setCheckedSteps]   = useState({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [languageMode, setLanguageMode]   = useState('en');
  const [activeSection, setActiveSection] = useState('briefing');

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

  const riskScore = Math.min(100, Math.round(
    (cves.filter(c => c.severity === 'critical').length * 20) +
    (mitre_techniques.length * 4) +
    (iocs.length * 1.5)
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
    { id: 'briefing',  label: 'AI Briefing' },
    { id: 'killchain', label: 'Attack Chain' },
    { id: 'checklist', label: 'Response Checklist' },
    { id: 'graph',     label: 'Knowledge Graph' },
  ];

  const doneCount = Object.values(checkedSteps).filter(Boolean).length;
  const totalSteps = blue_team_actions.length || attack_flow_steps.length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Page Title ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-red">ACTIVE THREAT</span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              {threat_actor?.origin && `Origin: ${threat_actor.origin}`}
            </span>
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em', lineHeight: '1.3', maxWidth: '680px' }}>
            {title}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={toggleAudio}
            className="btn-ghost"
            style={{ fontSize: '12px', color: isPlayingAudio ? 'var(--red)' : undefined }}
            title={isPlayingAudio ? 'Stop audio' : 'Listen to briefing'}
          >
            {isPlayingAudio ? <VolumeX size={13} /> : <Volume2 size={13} />}
            {isPlayingAudio ? 'Stop Audio' : 'Listen'}
          </button>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <KPICard label="Risk Score"       value={`${riskScore}%`} sub="Composite severity" color={riskScore > 70 ? 'var(--red)' : riskScore > 40 ? 'var(--amber)' : 'var(--green)'} icon={Activity} />
        <KPICard label="CVEs Found"       value={cves.length}  sub={`${cves.filter(c=>c.severity==='critical').length} Critical`} color="var(--amber)"  icon={Bug} />
        <KPICard label="Attack Techniques" value={mitre_techniques.length} sub="MITRE ATT&CK mapped" color="var(--purple)" icon={TrendingUp} />
        <KPICard label="Threat Indicators" value={iocs.length}  sub="IPs, hashes & domains" color="var(--red)" icon={ShieldAlert} />
      </div>

      {/* ── Risk Gauge + Plain English ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px' }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Threat Risk Level
          </div>
          <ThreatRadarGauge score={riskScore} cveCount={cves.length} iocCount={iocs.length} tacticCount={mitre_techniques.length} />
        </div>

        <PlainEnglishCard
          summary={executive_summary}
          actor={threat_actor}
          sectors={target_sectors}
          languageMode={languageMode}
          onToggle={() => setLanguageMode(p => p === 'en' ? 'ta' : 'en')}
        />
      </div>

      {/* ── Section Sub-Tabs ── */}
      <div>
        <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
          {SECTION_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveSection(t.id)}
              style={{
                padding: '8px 14px', fontSize: '13px', fontWeight: '600',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: activeSection === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                borderBottom: `2px solid ${activeSection === t.id ? 'var(--accent)' : 'transparent'}`,
                fontFamily: 'var(--font-sans)', transition: 'all 0.12s ease', marginBottom: '-1px'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* AI Briefing */}
        {activeSection === 'briefing' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* CVEs */}
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Bug size={13} color="var(--amber)" />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Software Vulnerabilities</span>
                </div>
                <span className="badge badge-amber">{cves.length} CVEs</span>
              </div>
              <div style={{ padding: '8px' }}>
                {cves.slice(0, 5).map((cve, i) => {
                  const sev = getSev(cve.severity);
                  const col = SEVERITY_COLORS[sev];
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '6px', marginBottom: '2px', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: col.text, background: col.bg, border: `1px solid ${col.border}`, padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                        {cve.id || `CVE-${i}`}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cve.description || cve.software || 'Vulnerability details'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
                          CVSS: {cve.cvss_score || '—'} · {cve.software || ''}
                        </div>
                      </div>
                      <a href={`https://nvd.nist.gov/vuln/detail/${cve.id}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>
                        <ExternalLink size={11} color="var(--text-tertiary)" />
                      </a>
                    </div>
                  );
                })}
                {cves.length > 5 && (
                  <button onClick={() => onSwitchTab('technical')} style={{ width: '100%', padding: '8px', marginTop: '4px', background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                    View all {cves.length} CVEs →
                  </button>
                )}
                {cves.length === 0 && <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: 'var(--text-tertiary)' }}>No CVEs identified in this report</div>}
              </div>
            </div>

            {/* MITRE Techniques */}
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Zap size={13} color="var(--purple)" />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Attack Techniques</span>
                </div>
                <span className="badge badge-purple">MITRE ATT&CK</span>
              </div>
              <div style={{ padding: '8px' }}>
                {mitre_techniques.slice(0, 5).map((tech, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px', borderRadius: '6px', marginBottom: '2px', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--purple)', background: 'var(--purple-dim)', border: '1px solid rgba(167,139,250,0.2)', padding: '2px 6px', borderRadius: '4px', flexShrink: 0, marginTop: '1px' }}>
                      {tech.id || `T${1000 + i}`}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{tech.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '1px' }}>{tech.tactic || 'Attack Tactic'}</div>
                    </div>
                  </div>
                ))}
                {mitre_techniques.length > 5 && (
                  <button onClick={() => onSwitchTab('technical')} style={{ width: '100%', padding: '8px', marginTop: '4px', background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                    View all {mitre_techniques.length} techniques →
                  </button>
                )}
                {mitre_techniques.length === 0 && <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: 'var(--text-tertiary)' }}>No techniques mapped yet</div>}
              </div>
            </div>
          </div>
        )}

        {/* Attack Kill Chain */}
        {activeSection === 'killchain' && (
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Visualizing the attacker's step-by-step progression through your network — from initial access to their final objective.
            </div>
            <CyberKillChainVisual attackFlowSteps={attack_flow_steps} />
          </div>
        )}

        {/* Response Checklist */}
        {activeSection === 'checklist' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Complete each action to contain the threat. Click to mark as done.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {totalSteps > 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--green)', fontWeight: '700' }}>{doneCount}</span> / {totalSteps} complete
                  </div>
                )}
                {totalSteps > 0 && (
                  <div style={{ width: '80px', height: '5px', background: 'var(--bg-raised)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(doneCount / totalSteps) * 100}%`, background: 'var(--green)', borderRadius: '99px', transition: 'width 0.4s ease' }} />
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(blue_team_actions.length ? blue_team_actions : attack_flow_steps).map((step, i) => (
                <ChecklistItem key={i} step={step} idx={i} checked={!!checkedSteps[i]} onToggle={toggleCheck} />
              ))}
              {!blue_team_actions.length && !attack_flow_steps.length && (
                <div style={{ textAlign: 'center', padding: '40px', fontSize: '13px', color: 'var(--text-tertiary)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                  No response actions extracted from this report.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Knowledge Graph */}
        {activeSection === 'graph' && (
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Interactive network map showing how the attacker, malware, vulnerabilities and targets are connected. Click nodes to explore.
            </div>
            {graph_data ? (
              <KnowledgeGraph graphData={graph_data} height={400} />
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                <div style={{ marginBottom: '8px', fontSize: '24px' }}>🕸️</div>
                Knowledge graph not available for this report.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Quick Navigation Shortcuts ── */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        <div className="section-label" style={{ marginBottom: '10px' }}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {[
            { tab: 'defense',   icon: ShieldCheck, label: 'Generate Firewall Rules',    desc: 'Block attack vectors instantly', color: 'var(--green)' },
            { tab: 'iocs',      icon: Lock,        label: 'View Block Indicators',       desc: `${iocs.length} IoCs ready to block`, color: 'var(--red)' },
            { tab: 'technical', icon: TrendingUp,  label: 'MITRE ATT&CK Matrix',         desc: `${mitre_techniques.length} mapped techniques`, color: 'var(--purple)' },
          ].map(a => (
            <button
              key={a.tab}
              onClick={() => onSwitchTab(a.tab)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '10px', textAlign: 'left',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.15s ease',
                fontFamily: 'var(--font-sans)'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = 'var(--bg-overlay)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
            >
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--bg-overlay)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <a.icon size={15} color={a.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1px' }}>{a.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{a.desc}</div>
              </div>
              <ChevronRight size={13} color="var(--text-tertiary)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
