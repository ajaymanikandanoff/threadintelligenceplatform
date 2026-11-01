import React, { useState } from 'react';
import { Target, Terminal, Bug, Radio, AlertOctagon, ShieldCheck, Eye, Zap } from 'lucide-react';

const DEFAULT_STAGES = [
  {
    id: 'recon',
    name: 'Initial Access & Infiltration',
    phaseRole: 'Perimeter Breach',
    attackActivity: 'Adversary probes public perimeter assets, exploits unpatched remote code execution vulnerabilities, or uses spear-phishing to establish initial corporate network access.',
    analystForensics: 'Exploitation of public edge gateway, CVE remote code execution, or credential theft.',
    defenseControl: 'Patch perimeter CVEs immediately, enforce MFA, and restrict edge management ports.',
    icon: Target,
    color: 'var(--red)',
    badge: 'STAGE 1'
  },
  {
    id: 'execution',
    name: 'Execution & Defense Evasion',
    phaseRole: 'Malware Execution',
    attackActivity: 'Adversary executes unauthorized payloads, utilizes Living-off-the-Land binaries (LOLBins), and disables endpoint telemetry to evade security detection.',
    analystForensics: 'Living-off-the-land binaries (LOLBins), PowerShell obfuscation, security log clearing (T1070).',
    defenseControl: 'Enable PowerShell Script Block Logging, block unauthorized script executions via AppLocker/WDAC.',
    icon: Terminal,
    color: 'var(--amber)',
    badge: 'STAGE 2'
  },
  {
    id: 'persistence',
    name: 'Persistence & Privilege Escalation',
    phaseRole: 'Backdoor Implant',
    attackActivity: 'Adversary deploys web shells, creates scheduled tasks, or modifies registry keys to retain network access across system restarts.',
    analystForensics: 'Webshell placement, scheduled tasks creation, admin account hijacking, registry run keys.',
    defenseControl: 'Audit autorun registry keys, monitor server directories for newly spawned .aspx/.php files.',
    icon: Bug,
    color: '#a855f7',
    badge: 'STAGE 3'
  },
  {
    id: 'c2',
    name: 'Command & Control (C2)',
    phaseRole: 'C2 Beaconing',
    attackActivity: 'Compromised systems establish encrypted outbound communication with attacker infrastructure to receive commands and stage payloads.',
    analystForensics: 'Encrypted HTTPS/DNS beaconing, dynamic domain generation algorithms (DGA), proxy routing.',
    defenseControl: 'Block outbound traffic to newly registered domains & known malicious C2 IP blocks in firewall.',
    icon: Radio,
    color: 'var(--accent)',
    badge: 'STAGE 4'
  },
  {
    id: 'impact',
    name: 'Exfiltration & Extortion',
    phaseRole: 'Data Theft & Ransom',
    attackActivity: 'Adversary aggregates confidential enterprise data, compresses archives, transfers them to external staging servers, or encrypts production assets.',
    analystForensics: 'Data staging in hidden archives, megaupload exfiltration, VSS shadow copy deletion, ransomware deployment.',
    defenseControl: 'Isolate affected subnet, revoke API tokens, take offline immutable backups, report to CERT/CISA.',
    icon: AlertOctagon,
    color: '#ef4444',
    badge: 'STAGE 5'
  }
];

export default function CyberKillChainVisual({ attackSteps = [], attackFlowSteps = [] }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [viewMode, setViewMode] = useState('dual'); // 'dual' | 'simple' | 'technical'

  const rawSteps = (attackSteps && attackSteps.length > 0) ? attackSteps : (attackFlowSteps || []);

  const stages = DEFAULT_STAGES.map((def, idx) => {
    if (rawSteps[idx]) {
      const real = rawSteps[idx];
      if (typeof real === 'string') {
        const clean = real.replace(/^\d+[.)]\s*/, '').trim();
        return {
          ...def,
          attackActivity: clean,
          analystForensics: clean,
          tacticMapped: def.id.toUpperCase()
        };
      }
      return {
        ...def,
        name: real.title || real.tactic || def.name,
        attackActivity: real.description || def.attackActivity,
        analystForensics: real.evidence || real.details || real.description || def.analystForensics,
        tacticMapped: real.tactic || real.technique || null
      };
    }
    return def;
  });

  const activeStage = stages[selectedIdx] || stages[0];
  const ActiveIcon = activeStage.icon;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: 'var(--red)', boxShadow: '0 0 10px var(--red)'
            }} />
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Adversary Cyber Kill Chain & Intrusion Lifecycle
            </h3>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
            Step-by-step adversary execution timeline. Click any phase to inspect attacker techniques and defense containment controls.
          </p>
        </div>

        {/* View Perspective Toggle */}
        <div style={{
          display: 'flex', background: 'var(--bg-overlay)', padding: '3px', borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          {[
            { id: 'dual', label: 'Full Breakdown' },
            { id: 'simple', label: 'Attack Vector' },
            { id: 'technical', label: 'SOC Forensics' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setViewMode(m.id)}
              style={{
                background: viewMode === m.id ? 'var(--bg-elevated)' : 'transparent',
                color: viewMode === m.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                border: `1px solid ${viewMode === m.id ? 'var(--border-strong)' : 'transparent'}`,
                borderRadius: '6px', padding: '5px 12px',
                fontSize: '11.5px', fontWeight: viewMode === m.id ? '700' : '500',
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
        gap: '10px',
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
                padding: '14px 10px',
                borderRadius: '10px',
                background: isSelected
                  ? 'linear-gradient(180deg, rgba(56, 189, 248, 0.12) 0%, rgba(56, 189, 248, 0.02) 100%)'
                  : isPast
                  ? 'rgba(255, 255, 255, 0.02)'
                  : 'var(--bg-overlay)',
                border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                boxShadow: isSelected ? '0 0 16px rgba(56, 189, 248, 0.15)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                position: 'relative',
                textAlign: 'center'
              }}
            >
              {/* Top Phase Number */}
              <div style={{
                fontSize: '9.5px',
                fontFamily: 'var(--font-mono)',
                fontWeight: '800',
                color: isSelected ? 'var(--accent)' : 'var(--text-tertiary)',
                marginBottom: '8px',
                letterSpacing: '0.04em'
              }}>
                {stage.badge}
              </div>

              {/* Icon Circle */}
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isSelected ? stage.color : 'var(--bg-base)',
                color: isSelected ? '#fff' : 'var(--text-secondary)',
                boxShadow: isSelected ? `0 0 16px ${stage.color}66` : 'none',
                marginBottom: '10px',
                transition: 'all 0.2s ease',
                border: `1px solid ${isSelected ? 'transparent' : 'var(--border)'}`
              }}>
                <Icon size={18} />
              </div>

              {/* Title */}
              <div style={{
                fontSize: '12px',
                fontWeight: isSelected ? '800' : '600',
                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                lineHeight: '1.25',
                minHeight: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {stage.name.split('&')[0]}
              </div>

              {/* Subtitle role badge */}
              <div style={{
                fontSize: '10px',
                color: 'var(--text-tertiary)',
                marginTop: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                fontFamily: 'var(--font-mono)'
              }}>
                {stage.phaseRole}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail Card */}
      <div style={{
        background: 'var(--bg-overlay)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '20px 22px',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '20px',
        alignItems: 'start'
      }}>
        {/* Stage Icon Showcase */}
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '12px',
          background: `${activeStage.color}15`,
          border: `1px solid ${activeStage.color}40`,
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
                padding: '2.5px 8px', borderRadius: '4px', fontSize: '10.5px',
                fontWeight: '800', background: `${activeStage.color}20`, color: activeStage.color,
                fontFamily: 'var(--font-mono)', border: `1px solid ${activeStage.color}35`
              }}>
                {activeStage.badge}
              </span>
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                {activeStage.name}
              </h4>
              <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                {activeStage.phaseRole}
              </span>
              {activeStage.tacticMapped && (
                <span style={{
                  padding: '2.5px 8px', borderRadius: '4px', fontSize: '10.5px',
                  background: 'rgba(56,189,248,0.1)', color: 'var(--accent)',
                  border: '1px solid var(--border-accent)', marginLeft: 'auto',
                  fontFamily: 'var(--font-mono)', fontWeight: '700'
                }}>
                  {activeStage.tacticMapped}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'dual' ? '1fr 1fr' : '1fr', gap: '14px' }}>
            {/* Attack Activity & Objective */}
            {(viewMode === 'dual' || viewMode === 'simple') && (
              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '14px 16px'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '11.5px', fontWeight: '800', color: 'var(--accent)',
                  marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em'
                }}>
                  <Eye size={13} />
                  <span>Adversary Phase & Attack Objective</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  {activeStage.attackActivity}
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
                  fontSize: '11.5px', fontWeight: '800', color: 'var(--amber)',
                  marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em'
                }}>
                  <Zap size={13} />
                  <span>Forensic Telemetry & Extracted Evidence</span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, fontFamily: 'var(--font-mono)' }}>
                  {activeStage.analystForensics}
                </p>
              </div>
            )}
          </div>

          {/* Defense Mitigation Directive */}
          <div style={{
            background: 'rgba(56, 189, 248, 0.05)',
            border: '1px solid rgba(56, 189, 248, 0.22)',
            borderRadius: '8px',
            padding: '13px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <ShieldCheck size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recommended Defense & Containment Directives:
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
                {activeStage.defenseControl}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
