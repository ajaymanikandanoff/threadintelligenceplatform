import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  UserX,
  Bug,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function OverviewTab({ threatData, onSwitchTab, onOpenIngest }) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [checkedSteps, setCheckedSteps] = useState({});
  const [showExplainer, setShowExplainer] = useState(true);

  if (!threatData) {
    return (
      <div className="surface" style={{ textAlign: 'center', padding: '60px 24px', maxWidth: '640px', margin: '40px auto' }}>
        <ShieldAlert size={48} color="var(--cyan)" style={{ marginBottom: '16px', opacity: 0.8 }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-0)', marginBottom: '8px' }}>
          No Threat Report Loaded Yet
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: '1.6', marginBottom: '20px' }}>
          Upload any cybersecurity advisory PDF, incident log, or choose a live government threat advisory to let the AI analyze it automatically.
        </p>
        <button className="btn-primary" onClick={onOpenIngest} style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
          Analyze a Threat Report
        </button>
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

  const copy = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const toggleCheck = (idx) => {
    setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* 1. Problem & Solution Banner (Explains what this tool does in plain words) */}
      {showExplainer && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,179,237,0.08) 0%, rgba(183,148,244,0.05) 100%)',
          border: '1px solid rgba(99,179,237,0.25)',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Sparkles size={20} color="var(--cyan)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--cyan)', marginBottom: '4px' }}>
                How to understand this threat analysis:
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', margin: 0, lineHeight: '1.5' }}>
                This platform automatically broke down a dense 20+ page security advisory into plain English below.
                Review <strong>Who attacked</strong>, <strong>How they got in</strong>, and your <strong>Immediate Defense Checklist</strong> to protect your systems.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowExplainer(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '0.74rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Threat Title Header */}
      <div className="surface" style={{ padding: '24px 28px', borderLeft: '4px solid var(--red)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span className="tag tag-red" style={{ fontSize: '0.72rem' }}>CRITICAL ADVISORY</span>
          <span className="tag tag-amber" style={{ fontSize: '0.72rem' }}>
            {threat_actor.motivation || 'Financial Extortion / Espionage'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginLeft: 'auto' }}>
            Threat Analysis Engine: Gemini 2.5 Flash
          </span>
        </div>

        <h1 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-0)', lineHeight: '1.35', margin: '4px 0 12px 0' }}>
          {title}
        </h1>

        {/* Target Sectors in simple badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: '600' }}>Targeted Industries:</span>
          {target_sectors.length > 0 ? (
            target_sectors.map((sec, i) => (
              <span key={i} className="tag tag-purple" style={{ fontSize: '0.72rem' }}>{sec}</span>
            ))
          ) : (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Broad Commercial & Enterprise Organizations</span>
          )}
        </div>
      </div>

      {/* 3. The 3 Core Answers (Who, How, What to do) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>

        {/* Card 1: WHO ATTACKED? */}
        <div className="surface" style={{ padding: '20px 22px', borderTop: '3px solid var(--red)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <UserX size={18} color="var(--red)" />
            <span style={{ fontSize: '0.76rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)' }}>
              1. The Hacker Group
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--red)', marginBottom: '6px' }}>
            {threat_actor.name || 'Unattributed Group'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: '1.4', marginBottom: '10px' }}>
            Origin: <strong>{threat_actor.country || 'Global / Unknown'}</strong>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: 0, lineHeight: '1.45' }}>
            {threat_actor.description || 'Known advanced cyber threat group operating active intrusion campaigns.'}
          </p>
        </div>

        {/* Card 2: HOW DID THEY ENTER? */}
        <div className="surface" style={{ padding: '20px 22px', borderTop: '3px solid var(--amber)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Bug size={18} color="var(--amber)" />
            <span style={{ fontSize: '0.76rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)' }}>
              2. Security Flaw (CVE)
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--amber)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
            {cves.length > 0 ? cves[0].id : 'Zero-Day / Phishing'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: '1.4', marginBottom: '10px' }}>
            Severity: <strong style={{ color: 'var(--red)' }}>{cves.length > 0 ? `CVSS ${cves[0].cvss || '9.8'} Critical` : 'High'}</strong>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: 0, lineHeight: '1.45' }}>
            {cves.length > 0
              ? (cves[0].description || 'Vulnerability in public-facing software allowed attackers remote access.')
              : 'Initial entry gained via compromised credentials without Multi-Factor Authentication.'}
          </p>
        </div>

        {/* Card 3: HOW TO STOP THEM? */}
        <div className="surface" style={{ padding: '20px 22px', borderTop: '3px solid var(--green)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={18} color="var(--green)" />
            <span style={{ fontSize: '0.76rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)' }}>
              3. Defense Action
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--green)', marginBottom: '6px' }}>
            {iocs.length} Indicators to Block
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: '1.4', marginBottom: '10px' }}>
            Ready-to-use Firewall & SIEM Rules
          </div>
          <button
            className="btn-primary"
            onClick={() => onSwitchTab('defense')}
            style={{ width: '100%', justifyContent: 'center', padding: '7px 12px', fontSize: '0.78rem' }}
          >
            <span>View Defense Checklist</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </div>

      {/* 4. Plain English Explanation */}
      <div className="surface" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-0)', margin: 0 }}>
            What Happened? (Plain English Summary)
          </h3>
        </div>
        <p style={{ fontSize: '0.88rem', lineHeight: '1.7', color: 'var(--text-1)', margin: 0 }}>
          {executive_summary || threatData.summary || 'Attackers exploited security loopholes to breach network environments, steal credentials, and compromise sensitive databases.'}
        </p>
      </div>

      {/* 5. Attack Flow (Step-by-Step in plain words) */}
      {attack_flow_steps.length > 0 && (
        <div className="surface" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Clock size={17} color="var(--cyan)" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-0)', margin: 0 }}>
              How the Attack Unfolded (Step-by-Step Flow)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {attack_flow_steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex', gap: '14px', alignItems: 'flex-start',
                  padding: '12px 16px', background: 'var(--bg-2)', borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'rgba(99,179,237,0.15)', color: 'var(--cyan)',
                  fontSize: '0.76rem', fontWeight: '700', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: '600', color: 'var(--text-0)', marginBottom: '3px' }}>
                    {step.title || `Stage ${idx + 1}: ${step.tactic || 'Intrusion Step'}`}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: '1.5' }}>
                    {step.description || step.details || step}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Immediate Action Items Checklist */}
      <div className="surface" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-0)', margin: 0 }}>
              Immediate Security Action Items (Checklist)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: '4px 0 0 0' }}>
              Tick off each step as your IT or security team implements it:
            </p>
          </div>
          <button
            className="btn-ghost"
            onClick={() => onSwitchTab('defense')}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <span>View Firewall & SIEM Rules</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(blue_team_actions.length > 0 ? blue_team_actions : [
            'Block all malicious C2 IP addresses and suspicious domains on perimeter firewall and DNS.',
            'Apply emergency security patches for exploited software versions immediately.',
            'Enforce Multi-Factor Authentication (MFA) on all remote desktop, VPN, and email accounts.',
            'Scan endpoint servers with provided YARA signatures for unauthorized webshells or malware payloads.',
            'Isolate any systems exhibiting abnormal outbound traffic or high-volume data transfers.'
          ]).map((action, i) => {
            const isDone = !!checkedSteps[i];
            const text = typeof action === 'string' ? action : (action.action || action.title || '');
            return (
              <div
                key={i}
                onClick={() => toggleCheck(i)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '10px 14px', borderRadius: '6px',
                  background: isDone ? 'rgba(104,211,145,0.06)' : 'var(--bg-2)',
                  border: `1px solid ${isDone ? 'rgba(104,211,145,0.3)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '18px', height: '18px', borderRadius: '4px',
                  border: `1.5px solid ${isDone ? 'var(--green)' : 'var(--text-3)'}`,
                  background: isDone ? 'var(--green)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: '1px', flexShrink: 0
                }}>
                  {isDone && <Check size={12} color="#000" strokeWidth={3} />}
                </div>
                <div style={{
                  fontSize: '0.82rem',
                  color: isDone ? 'var(--text-3)' : 'var(--text-1)',
                  textDecoration: isDone ? 'line-through' : 'none',
                  lineHeight: '1.4'
                }}>
                  {text}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
