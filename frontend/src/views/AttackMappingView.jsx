import React, { useState } from 'react';
import { Info, ExternalLink } from 'lucide-react';

const ATTACK_TACTICS = [
  {
    id: 'TA0001',
    name: 'Initial Access',
    techniques: [
      { id: 'T1566', name: 'Phishing', hits: 9, isMatch: true, desc: 'Adversaries send messages with malicious links or attachments to trick users into giving access or credentials.', related: ['hxxp://secure-login.example-verify.com', 'login-update.example.net'] },
      { id: 'T1189', name: 'Drive-by Compromise', hits: 3, isMatch: true, desc: 'Adversaries gain access to a system through a user visiting a website over the normal course of browsing.', related: ['files-share.example.co'] },
      { id: 'T1190', name: 'Exploit Public-Facing Application', hits: 1, isMatch: true, desc: 'Adversaries take advantage of a weakness in an Internet-facing computer or program.', related: ['203.0.113.42'] }
    ]
  },
  {
    id: 'TA0002',
    name: 'Execution',
    techniques: [
      { id: 'T1204', name: 'User Execution', hits: 5, isMatch: true, desc: 'An adversary relies on specific actions by a user in order to execute code, such as opening a malicious attachment.', related: ['invoice-attachment.pdf.exe'] },
      { id: 'T1059', name: 'Command and Scripting Interpreter', hits: 2, isMatch: true, desc: 'Adversaries abuse command and script interpreters (PowerShell, Bash, CMD) to execute commands.', related: ['powershell.exe -enc ...'] }
    ]
  },
  {
    id: 'TA0003',
    name: 'Persistence',
    techniques: [
      { id: 'T1053', name: 'Scheduled Task/Job', hits: 1, isMatch: true, desc: 'Adversaries abuse task scheduling functionality to facilitate initial or recurring execution of malicious code.', related: ['SystemUpdateTask'] },
      { id: 'T1078', name: 'Valid Accounts', hits: 2, isMatch: true, desc: 'Adversaries obtain and abuse credentials of existing accounts as a means of gaining Initial Access or Persistence.', related: ['compromised-svc-account'] }
    ]
  },
  {
    id: 'TA0006',
    name: 'Credential Access',
    techniques: [
      { id: 'T1110', name: 'Brute Force', hits: 6, isMatch: true, desc: 'Adversaries use brute force techniques to attempt access to accounts when passwords are unknown.', related: ['192.0.2.88'] },
      { id: 'T1056', name: 'Input Capture', hits: 4, isMatch: true, desc: 'Adversaries insert software or hooks into the system to capture user input such as keystrokes or credentials.', related: ['keylogger-hook.dll'] },
      { id: 'T1003', name: 'OS Credential Dumping', hits: 0, isMatch: false, desc: 'Adversaries attempt to dump credentials to obtain account login and credential material.', related: [] }
    ]
  },
  {
    id: 'TA0011',
    name: 'Command and Control',
    techniques: [
      { id: 'T1071', name: 'Application Layer Protocol', hits: 7, isMatch: true, desc: 'Adversaries communicate using OSI application layer protocols to avoid detection by blending with existing traffic.', related: ['203.0.113.42', 'files-share.example.co'] },
      { id: 'T1105', name: 'Ingress Tool Transfer', hits: 3, isMatch: true, desc: 'Adversaries transfer tools or other files from an external system into a compromised network.', related: ['drop-stage2.bin'] }
    ]
  },
  {
    id: 'TA0010',
    name: 'Exfiltration',
    techniques: [
      { id: 'T1041', name: 'Exfiltration Over C2 Channel', hits: 2, isMatch: true, desc: 'Adversaries steal data by transferring it over an existing command and control channel.', related: ['c2-stream-archive.tar.gz'] },
      { id: 'T1567', name: 'Exfiltration Over Web Service', hits: 0, isMatch: false, desc: 'Adversaries exfiltrate data to an external web service such as cloud storage.', related: [] }
    ]
  }
];

export default function AttackMappingView({ onNavigateTab }) {
  const [selectedTech, setSelectedTech] = useState(ATTACK_TACTICS[0].techniques[0]);
  const [selectedTactic, setSelectedTactic] = useState(ATTACK_TACTICS[0]);

  const handleSelectTechnique = (tactic, tech) => {
    setSelectedTactic(tactic);
    setSelectedTech(tech);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ─── Page Title ─── */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          Attack Mapping
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          See which attacker tactics and techniques your analyzed indicators relate to.
        </p>
      </div>

      {/* ─── Notice Banner ─── */}
      <div style={{
        background: 'rgba(56, 189, 248, 0.05)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <Info size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          Requires backend support. This page shows the planned layout. It will only show technique matches if your API returns ATT&CK tactic and technique data. Counts below are sample values.
        </span>
      </div>

      {/* ─── Tactic and Technique Matrix Card ─── */}
      <div style={{
        background: 'var(--bg-glass-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex', flexDirection: 'column', gap: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Tactic and technique matrix
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            <span>Matches</span>
            <div style={{ width: '60px', height: '6px', borderRadius: '3px', background: 'linear-gradient(90deg, #818cf8 0%, #f43f5e 100%)' }} />
            <span>More</span>
          </div>
        </div>

        {/* Horizontally Scrollable Matrix Grid */}
        <div style={{
          overflowX: 'auto',
          paddingBottom: '8px',
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: 'minmax(210px, 1fr)',
          gap: '12px'
        }}>
          {ATTACK_TACTICS.map(tactic => (
            <div key={tactic.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Tactic Header */}
              <div style={{
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex', flexDirection: 'column', gap: '2px'
              }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: '700' }}>
                  {tactic.id}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tactic.name}
                </span>
              </div>

              {/* Techniques in this Tactic */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tactic.techniques.map(tech => {
                  const isSelected = selectedTech?.id === tech.id;
                  const hasHits = tech.hits > 0;

                  // High hit highlight background
                  const bg = isSelected
                    ? 'rgba(129, 140, 248, 0.25)'
                    : tech.hits >= 7
                    ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(129, 140, 248, 0.15) 100%)'
                    : hasHits
                    ? 'var(--bg-elevated)'
                    : 'var(--bg-base)';

                  const borderColor = isSelected
                    ? 'rgba(56, 189, 248, 0.6)'
                    : tech.hits >= 7
                    ? 'rgba(244, 63, 94, 0.35)'
                    : 'var(--border)';

                  return (
                    <div
                      key={tech.id}
                      onClick={() => handleSelectTechnique(tactic, tech)}
                      style={{
                        background: bg,
                        border: `1px solid ${borderColor}`,
                        borderRadius: '8px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        transition: 'all 0.12s ease',
                        boxShadow: isSelected ? '0 0 14px rgba(56, 189, 248, 0.2)' : 'none'
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = borderColor;
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                          {tech.id}
                        </span>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: '700',
                          fontFamily: 'var(--font-mono)',
                          color: tech.hits >= 7 ? '#f43f5e' : hasHits ? 'var(--accent)' : 'var(--text-disabled)'
                        }}>
                          {hasHits ? `${tech.hits} hits` : 'none'}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: hasHits ? 'var(--text-primary)' : 'var(--text-tertiary)',
                        lineHeight: '1.3'
                      }}>
                        {tech.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Bottom Selected Technique Drawer ─── */}
      {selectedTech && (
        <div style={{
          background: 'var(--bg-glass-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1.2fr)',
          gap: '24px'
        }}>
          {/* Left: Technique Overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: 'rgba(129, 140, 248, 0.18)',
                color: 'var(--purple)',
                border: '1px solid rgba(129, 140, 248, 0.3)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '700',
                fontFamily: 'var(--font-mono)'
              }}>
                {selectedTech.id}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '600' }}>
                {selectedTactic?.name || 'Initial Access'}
              </span>
            </div>

            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {selectedTech.name}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              {selectedTech.desc}
            </p>
          </div>

          {/* Right: Related Indicators */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Related indicators
            </div>

            {selectedTech.related && selectedTech.related.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedTech.related.map((ind, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--bg-overlay)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {ind}
                    </span>

                    <button
                      onClick={() => onNavigateTab('analyzer', { indicator: ind })}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent)',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 6px',
                        borderRadius: '4px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                      <span>Open</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                No active indicators mapped to this technique yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

