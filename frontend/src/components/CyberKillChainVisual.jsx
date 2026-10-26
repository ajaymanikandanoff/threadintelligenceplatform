import React, { useState } from 'react';
import { Target, Terminal, Bug, Radio, AlertOctagon, ShieldCheck, ChevronRight, CheckCircle2, Lock, Eye, Zap, Layers } from 'lucide-react';

const DEFAULT_STAGES = [
  {
    id: 'recon',
    name: 'Initial Access & Infiltration',
    tamil: 'முதல் நுழைவு (Entry Point)',
    simpleExplain: 'Attackers find an unlocked digital door—like an unpatched software bug or phishing email—to break in.',
    analystForensics: 'Exploitation of public edge gateway, CVE remote code execution, or credential theft.',
    defenseControl: 'Patch perimeter CVEs immediately, enforce MFA, and restrict edge management ports.',
    icon: Target,
    color: 'var(--red)',
    badge: 'STAGE 1'
  },
  {
    id: 'execution',
    name: 'Execution & Defense Evasion',
    tamil: 'கட்டளை இயக்கம் (Running Malware)',
    simpleExplain: 'The hacker runs hidden commands, turns off antivirus alerts, and slips past security sensors.',
    analystForensics: 'Living-off-the-land binaries (LOLBins), PowerShell obfuscation, security log clearing (T1070).',
    defenseControl: 'Enable PowerShell Script Block Logging, block unauthorized script executions via AppLocker/WDAC.',
    icon: Terminal,
    color: 'var(--amber)',
    badge: 'STAGE 2'
  },
  {
    id: 'persistence',
    name: 'Persistence & Privilege Escalation',
    tamil: 'நிலையான இருப்பு (Backdoor Implant)',
    simpleExplain: 'They install a secret trapdoor so even if the system restarts, they stay inside your network.',
    analystForensics: 'Webshell placement, scheduled tasks creation, admin account hijacking, registry run keys.',
    defenseControl: 'Audit autorun registry keys, monitor server directories for newly spawned .aspx/.php files.',
    icon: Bug,
    color: '#a855f7',
    badge: 'STAGE 3'
  },
  {
    id: 'c2',
    name: 'Command & Control (C2)',
    tamil: 'கட்டுப்பாட்டு தொடர்பு (Beaconing)',
    simpleExplain: 'The infected computer dials out secretly to the hackers server waiting for instructions.',
    analystForensics: 'Encrypted HTTPS/DNS beaconing, dynamic domain generation algorithms (DGA), proxy routing.',
    defenseControl: 'Block outbound traffic to newly registered domains & known malicious C2 IP blocks in firewall.',
    icon: Radio,
    color: 'var(--accent)',
    badge: 'STAGE 4'
  },
  {
    id: 'impact',
    name: 'Exfiltration & Extortion',
    tamil: 'தரவு திருட்டு மற்றும் சேதம் (Data Theft)',
    simpleExplain: 'The grand prize for hackers: stealing confidential company files and demanding millions in ransom.',
    analystForensics: 'Data staging in hidden archives, megaupload exfiltration, VSS shadow copy deletion, ransomware deployment.',
    defenseControl: 'Isolate affected subnet, revoke API tokens, take offline immutable backups, report to CERT/CISA.',
    icon: AlertOctagon,
    color: '#ef4444',
    badge: 'STAGE 5'
  }
];

export default function CyberKillChainVisual({ attackSteps = [], attackFlowSteps = [], threatData }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [viewMode, setViewMode] = useState('dual'); // 'dual' | 'simple' | 'technical'

  const rawSteps = (attackSteps && attackSteps.length > 0) ? attackSteps : (attackFlowSteps || []);

  const stages = DEFAULT_STAGES.map((def, idx) => {
    if (rawSteps[idx]) {
      const real = rawSteps[idx];
      return {
        ...def,
        name: real.title || real.tactic || def.name,
        analystForensics: real.description || real.evidence || def.analystForensics,
        tacticMapped: real.tactic || real.technique || null
      };
    }
    return def;
  });

  const activeStage = stages[selectedIdx] || stages[0];
  const ActiveIcon = activeStage.icon;

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: 'var(--red)', boxShadow: '0 0 10px var(--red)'
            }} />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Cyber Kill Chain — How the Attack Happened (தாக்குதல் வரைபடம்)
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Visual step-by-step adversary lifecycle. Click any phase below to examine attacker techniques and defense containment.
          </p>
        </div>

        {/* View Perspective Toggle */}
        <div style={{
          display: 'flex', background: 'var(--bg-base)', padding: '3px', borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          {[
            { id: 'dual', label: 'Balanced View' },
            { id: 'simple', label: 'Plain English' },
            { id: 'technical', label: 'SOC Analyst' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setViewMode(m.id)}
              style={{
                background: viewMode === m.id ? 'var(--bg-overlay)' : 'transparent',
                color: viewMode === m.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                border: 'none', borderRadius: '6px', padding: '5px 11px',
                fontSize: '12px', fontWeight: viewMode === m.id ? '600' : '400',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Track Stages */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${stages.length}, 1fr)`,
        gap: '8px',
        position: 'relative'
      }}>
        {stages.map((stage, idx) => {
          const isSelected = selectedIdx === idx;
          const isPast = idx < selectedIdx;
          const Icon = stage.icon;

          return (
            <button
              key={stage.id}
              onClick={() => setSelectedIdx(idx)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '14px 8px',
                borderRadius: '10px',
                background: isSelected
                  ? 'rgba(56, 189, 248, 0.1)'
                  : isPast
                  ? 'rgba(255, 255, 255, 0.02)'
                  : 'var(--bg-base)',
                border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                position: 'relative',
                textAlign: 'center'
              }}
            >
              {/* Top Phase Number */}
              <div style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: '700',
                color: isSelected ? 'var(--accent)' : 'var(--text-tertiary)',
                marginBottom: '8px'
              }}>
                {stage.badge}
              </div>

              {/* Icon Circle */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isSelected ? stage.color : 'var(--bg-overlay)',
                color: isSelected ? '#fff' : 'var(--text-secondary)',
                boxShadow: isSelected ? `0 0 16px ${stage.color}66` : 'none',
                marginBottom: '10px',
                transition: 'all 0.2s ease'
              }}>
                <Icon size={18} />
              </div>

              {/* Title */}
              <div style={{
                fontSize: '12px',
                fontWeight: isSelected ? '700' : '500',
                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                lineHeight: '1.25',
                minHeight: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {stage.name.split('&')[0]}
              </div>

              {/* Tamil subtitle hint */}
              <div style={{
                fontSize: '10px',
                color: 'var(--text-tertiary)',
                marginTop: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>
                {stage.tamil.split('(')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail Card */}
      <div style={{
        background: 'var(--bg-base)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '20px 24px',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '20px',
        alignItems: 'start'
      }}>
        {/* Stage Icon Showcase */}
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          background: `${activeStage.color}1a`,
          border: `1px solid ${activeStage.color}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: activeStage.color,
          flexShrink: 0
        }}>
          <ActiveIcon size={26} />
        </div>

        {/* Content Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{
                padding: '3px 8px', borderRadius: '4px', fontSize: '11px',
                fontWeight: '700', background: `${activeStage.color}22`, color: activeStage.color,
                fontFamily: 'var(--font-mono)'
              }}>
                {activeStage.badge}
              </span>
              <h4 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                {activeStage.name}
              </h4>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                {activeStage.tamil}
              </span>
              {activeStage.tacticMapped && (
                <span style={{
                  padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                  background: 'rgba(56,189,248,0.1)', color: 'var(--accent)',
                  border: '1px solid var(--border-accent)', marginLeft: 'auto'
                }}>
                  {activeStage.tacticMapped}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'dual' ? '1fr 1fr' : '1fr', gap: '16px' }}>
            {/* Plain English Box */}
            {(viewMode === 'dual' || viewMode === 'simple') && (
              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '14px 16px'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '12px', fontWeight: '700', color: 'var(--green)',
                  marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>
                  <Eye size={14} />
                  <span>Plain Language (எளிய விளக்கம்)</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  {activeStage.simpleExplain}
                </p>
              </div>
            )}

            {/* Technical Forensics Box */}
            {(viewMode === 'dual' || viewMode === 'technical') && (
              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '14px 16px'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '12px', fontWeight: '700', color: 'var(--amber)',
                  marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>
                  <Zap size={14} />
                  <span>Technical Telemetry & Evidence (SOC Forensics)</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, fontFamily: 'var(--font-mono)' }}>
                  {activeStage.analystForensics}
                </p>
              </div>
            )}
          </div>

          {/* Defense Mitigation Directive */}
          <div style={{
            background: 'rgba(56, 189, 248, 0.06)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <ShieldCheck size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent)', marginBottom: '3px' }}>
                Recommended Defense & Containment (எப்படி தடுப்பது?):
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {activeStage.defenseControl}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
