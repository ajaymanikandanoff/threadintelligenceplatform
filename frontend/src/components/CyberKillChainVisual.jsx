import React, { useState } from 'react';
import { Target, Terminal, Bug, Radio, Database, AlertOctagon, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';

const DEFAULT_STAGES = [
  {
    id: 'recon',
    name: '1. Reconnaissance & Initial Access',
    subtitle: 'Entry Point',
    icon: Target,
    color: '#fc8181',
    description: 'Attackers scan public-facing assets and exploit software flaws or stolen credentials.',
    evidence: 'Exploitation of public edge gateway / web server vulnerability.'
  },
  {
    id: 'execution',
    name: '2. Execution & Defense Evasion',
    subtitle: 'Running Malicious Code',
    icon: Terminal,
    color: '#f6ad55',
    description: 'Attackers trigger scripts (PowerShell, bash) and disable logging or antivirus protection.',
    evidence: 'Living-off-the-land commands executed to evade host detection.'
  },
  {
    id: 'persistence',
    name: '3. Persistence & Malware Implant',
    subtitle: 'Backdoor Installation',
    icon: Bug,
    color: '#b794f4',
    description: 'A webshell or Trojan is planted in system directories to maintain permanent unauthorized access.',
    evidence: 'Custom webshell or backdoor script established on host drive.'
  },
  {
    id: 'c2',
    name: '4. Command & Control (C2)',
    subtitle: 'Attacker Communication',
    icon: Radio,
    color: '#63b3ed',
    description: 'The infected machine beacons out to remote hacker-controlled IP addresses and proxy nodes.',
    evidence: 'Outbound connections to known malicious C2 IP infrastructure.'
  },
  {
    id: 'impact',
    name: '5. Exfiltration & Ransom Extortion',
    subtitle: 'Objective / Damage',
    icon: AlertOctagon,
    color: '#f56565',
    description: 'Attackers exfiltrate sensitive corporate databases and threaten public release or encryption.',
    evidence: 'High-volume outbound data transfer and extortion note dropped.'
  }
];

export default function CyberKillChainVisual({ attackSteps = [], threatData }) {
  const [selectedStage, setSelectedStage] = useState(0);

  // Map real attack steps if available
  const stages = DEFAULT_STAGES.map((def, idx) => {
    if (attackSteps[idx]) {
      const real = attackSteps[idx];
      return {
        ...def,
        name: `${idx + 1}. ${real.title || real.tactic || def.name}`,
        description: real.description || def.description,
        evidence: real.technique || real.tactic ? `Mapped MITRE Tactic: ${real.tactic || 'Forensic telemetry verified'}` : def.evidence
      };
    }
    return def;
  });

  const active = stages[selectedStage] || stages[0];
  const ActiveIcon = active.icon;

  return (
    <div className="surface" style={{ padding: '22px 24px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block', boxShadow: '0 0 8px var(--red)' }}></span>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-0)', margin: 0 }}>
              Visual Cyber Kill Chain (தாக்குதல் வரைபடம்)
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: '3px 0 0 0' }}>
            Interactive end-to-end intrusion progression — click any stage to inspect attacker behavior & defense controls.
          </p>
        </div>
        <span className="tag tag-cyan" style={{ fontSize: '0.7rem' }}>
          MITRE ATT&CK MAPPED
        </span>
      </div>

      {/* Visual Pipeline Connector Track */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${stages.length}, 1fr)`,
        gap: '8px',
        position: 'relative',
        marginBottom: '20px'
      }}>
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isCurrent = selectedStage === idx;
          const isPast = selectedStage > idx;

          return (
            <div
              key={stage.id}
              onClick={() => setSelectedStage(idx)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                cursor: 'pointer', textAlign: 'center', padding: '12px 8px',
                borderRadius: '8px',
                background: isCurrent ? 'rgba(99,179,237,0.12)' : 'var(--bg-2)',
                border: `1.5px solid ${isCurrent ? stage.color : isPast ? 'rgba(104,211,145,0.4)' : 'var(--border)'}`,
                boxShadow: isCurrent ? `0 0 16px ${stage.color}25` : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: isCurrent ? stage.color : isPast ? 'rgba(104,211,145,0.2)' : 'var(--bg-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isCurrent ? '#000' : isPast ? 'var(--green)' : 'var(--text-2)',
                marginBottom: '8px', fontWeight: '800', fontSize: '0.85rem'
              }}>
                <Icon size={18} strokeWidth={isCurrent ? 2.4 : 1.8} />
              </div>
              <div style={{
                fontSize: '0.74rem', fontWeight: '700',
                color: isCurrent ? stage.color : 'var(--text-1)',
                lineHeight: '1.2', marginBottom: '2px'
              }}>
                {stage.subtitle}
              </div>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                Stage {idx + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Detail Inspector Card */}
      <div style={{
        padding: '16px 20px', borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.5) 100%)',
        border: `1px solid ${active.color}40`,
        display: 'flex', gap: '16px', alignItems: 'flex-start'
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: `${active.color}20`, border: `1px solid ${active.color}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: active.color, flexShrink: 0
        }}>
          <ActiveIcon size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: active.color, margin: 0 }}>
              {active.name}
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
              Step {selectedStage + 1} of {stages.length}
            </span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-1)', margin: '0 0 10px 0', lineHeight: '1.5' }}>
            {active.description}
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '0.76rem', color: 'var(--text-2)', background: 'rgba(0,0,0,0.3)',
            padding: '6px 12px', borderRadius: '6px'
          }}>
            <ShieldAlert size={14} color={active.color} />
            <span><strong>Technical Detection Signal:</strong> {active.evidence}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
