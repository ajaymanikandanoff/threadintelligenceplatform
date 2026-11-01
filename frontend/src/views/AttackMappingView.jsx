import React, { useState, useMemo, useRef } from 'react';
import {
  Shield,
  Search,
  Filter,
  ExternalLink,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Crosshair,
  Terminal,
  ArrowRight,
  Lock,
  Server,
  Eye,
  Sparkles,
  Info
} from 'lucide-react';

const ATTACK_TACTICS = [
  {
    id: 'TA0001',
    name: 'Initial Access',
    phase: 'Perimeter Breach',
    techniques: [
      {
        id: 'T1566',
        name: 'Phishing',
        hits: 9,
        isMatch: true,
        severity: 'Critical',
        desc: 'Adversaries send messages with malicious links or attachments to trick users into giving access or credentials. Once opened, payloads exploit endpoint applications or direct victims to credential-harvesting portals.',
        url: 'https://attack.mitre.org/techniques/T1566/',
        threatActors: ['APT29 (Cozy Bear)', 'FIN7', 'Lazarus Group', 'Sandworm'],
        tools: ['Cobalt Strike', 'Emotet', 'PhishMe'],
        mitigations: [
          'M1049: Antivirus/Antimalware — inspect incoming attachments for macros and embedded binaries.',
          'M1021: Restrict Web-Based Content — block untrusted credential-harvesting landing pages.',
          'M1017: User Training — conduct recurring phishing simulations and report unfamiliar sender addresses.'
        ],
        related: ['hxxp://secure-login.example-verify.com', 'login-update.example.net']
      },
      {
        id: 'T1189',
        name: 'Drive-by Compromise',
        hits: 3,
        isMatch: true,
        severity: 'Medium',
        desc: 'Adversaries gain access to a system through a user visiting a website over the normal course of browsing. Exploitation occurs automatically via malicious JavaScript or browser zero-days without explicit user consent.',
        url: 'https://attack.mitre.org/techniques/T1189/',
        threatActors: ['Lazarus Group', 'TA505'],
        tools: ['SocGholish', 'Angler Exploit Kit'],
        mitigations: [
          'M1021: Restrict Web-Based Content — enforce browser isolation and disable legacy plugins.',
          'M1048: Application Isolation and Sandboxing — run web browsers inside isolated containers.'
        ],
        related: ['files-share.example.co']
      },
      {
        id: 'T1190',
        name: 'Exploit Public-Facing Application',
        hits: 6,
        isMatch: true,
        severity: 'Critical',
        desc: 'Adversaries take advantage of a weakness in an Internet-facing computer or program (e.g. unpatched VPN gateways, remote code execution vulnerabilities, or web servers) to gain initial unauthorized network access.',
        url: 'https://attack.mitre.org/techniques/T1190/',
        threatActors: ['Volt Typhoon', 'APT41', 'Sandworm'],
        tools: ['Metasploit', 'SQLMap', 'Nuclei'],
        mitigations: [
          'M1050: Exploit Protection — deploy Web Application Firewalls (WAF) and ingress rate limiting.',
          'M1051: Update Software — expedite patch management cycles for edge perimeter devices.'
        ],
        related: ['203.0.113.42', '198.51.100.24']
      }
    ]
  },
  {
    id: 'TA0002',
    name: 'Execution',
    phase: 'Payload Execution',
    techniques: [
      {
        id: 'T1059.001',
        name: 'Command & Scripting: PowerShell',
        hits: 7,
        isMatch: true,
        severity: 'High',
        desc: 'Adversaries abuse PowerShell command and script interpreters to execute arbitrary in-memory payloads, download second-stage malware, and interact with operating system internals while bypassing traditional file-based antivirus.',
        url: 'https://attack.mitre.org/techniques/T1059/001/',
        threatActors: ['APT28', 'Wizard Spider', 'Mustang Panda'],
        tools: ['PowerSploit', 'Empire', 'Covenant'],
        mitigations: [
          'M1038: Execution Prevention — enforce PowerShell Constrained Language Mode (CLM).',
          'M1047: Audit — enable PowerShell Script Block Logging (Event ID 4104) and transcription.'
        ],
        related: ['powershell.exe -enc JABzAD0ATg...']
      },
      {
        id: 'T1204.002',
        name: 'User Execution: Malicious File',
        hits: 5,
        isMatch: true,
        severity: 'High',
        desc: 'An adversary relies on specific user actions to execute malicious code, such as opening an email attachment (ISO, LNK, or weaponized macro spreadsheet) under the guise of an authentic business invoice or payroll update.',
        url: 'https://attack.mitre.org/techniques/T1204/002/',
        threatActors: ['Gamaredon', 'Kimsuky'],
        tools: ['LNK Payloads', 'Weaponized Office Docs'],
        mitigations: [
          'M1049: Antivirus/Antimalware — block inbound executable file extensions and container formats (.iso, .vhd).',
          'M1017: User Training — train employees to verify unexpected external attachments.'
        ],
        related: ['invoice-attachment.pdf.exe', 'urgent-report.docx.iso']
      }
    ]
  },
  {
    id: 'TA0003',
    name: 'Persistence',
    phase: 'Foothold Maintenance',
    techniques: [
      {
        id: 'T1053.005',
        name: 'Scheduled Task/Job',
        hits: 4,
        isMatch: true,
        severity: 'Medium',
        desc: 'Adversaries abuse task scheduling functionality (such as Windows Task Scheduler or Linux cron) to facilitate initial or recurring execution of malicious code across system reboots and user logoffs.',
        url: 'https://attack.mitre.org/techniques/T1053/005/',
        threatActors: ['MuddyWater', 'Turla', 'APT32'],
        tools: ['Schtasks.exe', 'Cron'],
        mitigations: [
          'M1028: Operating System Configuration — restrict non-admin task creation privileges.',
          'M1047: Audit — monitor Windows Event Logs (Event ID 4698: Scheduled Task Created).'
        ],
        related: ['SystemUpdateTask', 'Cron_Diagnostic']
      },
      {
        id: 'T1078',
        name: 'Valid Accounts',
        hits: 5,
        isMatch: true,
        severity: 'Critical',
        desc: 'Adversaries obtain and abuse credentials of existing user, domain, or service accounts as a means of gaining Initial Access, Persistence, or Privilege Escalation without triggering perimeter anomaly alarms.',
        url: 'https://attack.mitre.org/techniques/T1078/',
        threatActors: ['Lapsus$', 'Scattered Spider', 'APT29'],
        tools: ['Mimikatz', 'BloodHound', 'CrackMapExec'],
        mitigations: [
          'M1032: Multi-Factor Authentication — enforce phishing-resistant hardware MFA on all external services.',
          'M1027: Password Policies — enforce account lockout thresholds and monitor unusual login geolocations.'
        ],
        related: ['compromised-svc-account', 'vpn-admin-access']
      }
    ]
  },
  {
    id: 'TA0006',
    name: 'Credential Access',
    phase: 'Identity Compromise',
    techniques: [
      {
        id: 'T1110',
        name: 'Brute Force',
        hits: 6,
        isMatch: true,
        severity: 'High',
        desc: 'Adversaries use brute force techniques (such as password spraying or credential stuffing against public VPNs and SaaS portals) to attempt access to accounts when passwords are unknown.',
        url: 'https://attack.mitre.org/techniques/T1110/',
        threatActors: ['APT33', 'FIN8', 'Lazarus Group'],
        tools: ['Hydra', 'Crowbar', 'SprayingToolkit'],
        mitigations: [
          'M1036: Account Use Policies — enforce progressive delays and IP throttling on failed authentication.',
          'M1032: Multi-Factor Authentication — require MFA for all perimeter access portals.'
        ],
        related: ['192.0.2.88', '198.51.100.99']
      },
      {
        id: 'T1056.001',
        name: 'Input Capture: Keylogging',
        hits: 4,
        isMatch: true,
        severity: 'High',
        desc: 'Adversaries insert software or API hooks into the operating system to intercept and record user keystrokes, capturing passwords, chat messages, and sensitive business documents as they are typed.',
        url: 'https://attack.mitre.org/techniques/T1056/001/',
        threatActors: ['Agent Tesla', 'RedLine Stealer', 'Formbook'],
        tools: ['AgentTesla.bin', 'RedLine.exe'],
        mitigations: [
          'M1049: Antivirus/Antimalware — monitor for unauthorized API hooks and keystroke listeners.',
          'M1043: Credential Access Protection — deploy virtual keyboards and hardware tokens for credential entry.'
        ],
        related: ['keylogger-hook.dll']
      },
      {
        id: 'T1003.001',
        name: 'OS Credential Dumping: LSASS',
        hits: 2,
        isMatch: true,
        severity: 'Critical',
        desc: 'Adversaries attempt to dump credentials directly from Local Security Authority Subsystem Service (LSASS) process memory to harvest plaintext passwords, Kerberos tickets, and NTLM hashes.',
        url: 'https://attack.mitre.org/techniques/T1003/001/',
        threatActors: ['Volt Typhoon', 'FIN7', 'Sandworm'],
        tools: ['Mimikatz', 'ProcDump', 'Dumpert'],
        mitigations: [
          'M1025: Privileged Process Integrity — enable Windows Defender Credential Guard and LSA Protection.',
          'M1041: Credential Guard — configure Attack Surface Reduction (ASR) rule to block LSASS memory reads.'
        ],
        related: ['lsass.dmp']
      }
    ]
  },
  {
    id: 'TA0011',
    name: 'Command & Control',
    phase: 'Remote Channel',
    techniques: [
      {
        id: 'T1071.001',
        name: 'Application Protocol: Web',
        hits: 8,
        isMatch: true,
        severity: 'Critical',
        desc: 'Adversaries communicate with compromised systems using standard OSI application layer protocols (HTTP/HTTPS) to blend beaconing traffic with legitimate web traffic and evade firewall egress filters.',
        url: 'https://attack.mitre.org/techniques/T1071/001/',
        threatActors: ['APT29', 'Sandworm', 'Turla'],
        tools: ['Cobalt Strike Beacon', 'Sliver', 'Mythic'],
        mitigations: [
          'M1031: Network Intrusion Prevention — inspect outbound SSL/TLS headers for anomalous ja3 signatures.',
          'M1020: SSL/TLS Inspection — decrypt and inspect high-risk outbound sessions at the secure web gateway.'
        ],
        related: ['203.0.113.42', 'files-share.example.co', 'c2-gate.cloud-tunnel.net']
      },
      {
        id: 'T1105',
        name: 'Ingress Tool Transfer',
        hits: 3,
        isMatch: true,
        severity: 'Medium',
        desc: 'Adversaries transfer tools, scripts, or stage-two implants from an external adversary-controlled system into a compromised network using built-in utilities like curl, certutil, or bitsadmin.',
        url: 'https://attack.mitre.org/techniques/T1105/',
        threatActors: ['APT41', 'Lazarus Group'],
        tools: ['Certutil', 'Curl', 'BITSAdmin'],
        mitigations: [
          'M1031: Network Intrusion Prevention — block outbound downloads from unclassified IP addresses.',
          'M1047: Audit — log and alert when living-off-the-land binaries (LOLBins) initiate external web sessions.'
        ],
        related: ['drop-stage2.bin', 'loader.vbs']
      }
    ]
  },
  {
    id: 'TA0010',
    name: 'Exfiltration',
    phase: 'Data Theft',
    techniques: [
      {
        id: 'T1041',
        name: 'Exfiltration Over C2 Channel',
        hits: 4,
        isMatch: true,
        severity: 'High',
        desc: 'Adversaries steal sensitive customer and corporate data by transferring it directly over an existing established command and control channel to minimize additional outbound network connections.',
        url: 'https://attack.mitre.org/techniques/T1041/',
        threatActors: ['BlackCat (ALPHV)', 'LockBit 3.0', 'DarkSide'],
        tools: ['Megasync', 'Rclone', 'Chisel'],
        mitigations: [
          'M1057: Data Loss Prevention — monitor and alert on abnormal spikes in outbound C2 beacon payload sizes.',
          'M1031: Network Intrusion Prevention — enforce strict bandwidth egress limits on non-standard protocols.'
        ],
        related: ['c2-stream-archive.tar.gz']
      },
      {
        id: 'T1567.002',
        name: 'Exfiltration to Cloud Storage',
        hits: 1,
        isMatch: true,
        severity: 'Medium',
        desc: 'Adversaries exfiltrate stolen archives directly to legitimate commercial cloud storage providers (such as AWS S3, MEGA.nz, or Dropbox) to blend their data theft with normal business SaaS usage.',
        url: 'https://attack.mitre.org/techniques/T1567/002/',
        threatActors: ['FIN11', 'UNC2452'],
        tools: ['MEGA.nz API', 'Dropbox API', 'Rclone'],
        mitigations: [
          'M1021: Restrict Web-Based Content — block unauthorized personal cloud storage uploads from endpoints.',
          'M1057: Data Loss Prevention — inspect outbound SaaS file uploads for sensitive database dumps and source code.'
        ],
        related: ['mega-upload-target.io']
      }
    ]
  }
];

export default function AttackMappingView({ threatData, onNavigateTab }) {
  const [selectedTech, setSelectedTech] = useState(ATTACK_TACTICS[0].techniques[0]);
  const [selectedTactic, setSelectedTactic] = useState(ATTACK_TACTICS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'matches' | 'high'
  const [selectedTacticFilter, setSelectedTacticFilter] = useState('ALL');

  const inspectorRef = useRef(null);

  // Compute summary stats
  const totalTactics = ATTACK_TACTICS.length;
  const allTechniques = useMemo(() => {
    return ATTACK_TACTICS.flatMap(tac => tac.techniques.map(t => ({ ...t, tacticName: tac.name, tacticId: tac.id })));
  }, []);

  const totalTechniques = allTechniques.length;
  const totalHits = useMemo(() => {
    return allTechniques.reduce((sum, t) => sum + (t.hits || 0), 0);
  }, [allTechniques]);

  const criticalCount = useMemo(() => {
    return allTechniques.filter(t => t.severity === 'Critical' || t.severity === 'High').length;
  }, [allTechniques]);

  // Filtered tactics & techniques
  const filteredTactics = useMemo(() => {
    return ATTACK_TACTICS.map(tactic => {
      // Check tactic filter
      if (selectedTacticFilter !== 'ALL' && tactic.id !== selectedTacticFilter) {
        return null;
      }

      const matchingTechniques = tactic.techniques.filter(tech => {
        // Query match
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery = !q ||
          tech.id.toLowerCase().includes(q) ||
          tech.name.toLowerCase().includes(q) ||
          tech.desc.toLowerCase().includes(q);

        if (!matchesQuery) return false;

        // Filter pills
        if (activeFilter === 'matches') {
          return tech.hits > 0;
        }
        if (activeFilter === 'high') {
          return tech.hits >= 5 || tech.severity === 'Critical';
        }
        return true;
      });

      return {
        ...tactic,
        techniques: matchingTechniques
      };
    }).filter(Boolean);
  }, [searchQuery, activeFilter, selectedTacticFilter]);

  const handleSelectTechnique = (tactic, tech) => {
    setSelectedTactic(tactic);
    setSelectedTech(tech);
    // Smooth scroll inspector into view if needed
    if (inspectorRef.current) {
      inspectorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return { bg: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: 'rgba(244, 63, 94, 0.35)' };
      case 'High':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.35)' };
      case 'Medium':
        return { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.35)' };
      default:
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: 'rgba(16, 185, 129, 0.35)' };
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '1440px',
      margin: '0 auto',
      width: '100%',
      paddingBottom: '80px' // Generous bottom padding to ensure zero clipping
    }}>
      {/* ─── Header & Telemetry Summary ─── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'var(--accent-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-accent)'
              }}>
                <Shield size={18} color="var(--accent)" />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                MITRE ATT&CK® Enterprise Mapping
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                fontFamily: 'var(--font-mono)',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.12)',
                color: 'var(--accent)',
                border: '1px solid var(--border-accent)'
              }}>
                v14.1 Enterprise
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, maxWidth: '640px' }}>
              Correlate observed security indicators against adversary tactics, behavioral techniques, and actionable defensive mitigations.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '600',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'var(--bg-glass-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)'
            }}>
              <Activity size={14} color="#10b981" />
              <span>Live Threat Correlation Active</span>
            </span>
          </div>
        </div>

        {/* ─── Telemetry Stat Metric Cards ─── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}>
          <div style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(129, 140, 248, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Layers size={20} color="#818cf8" />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Tactics Analyzed
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                {totalTactics} <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '500' }}>Phases</span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Crosshair size={20} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Enterprise TTPs
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                {totalTechniques} <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '500' }}>Catalogued</span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Activity size={20} color="#f43f5e" />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Observed Threat Hits
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#f43f5e', marginTop: '2px' }}>
                {totalHits} <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '500' }}>Detections</span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <AlertTriangle size={20} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                High-Risk Vectors
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#f59e0b', marginTop: '2px' }}>
                {criticalCount} <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '500' }}>Critical / High</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Search & Interactive Filter Controls ─── */}
      <div style={{
        background: 'var(--bg-glass-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '14px 18px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-base)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '8px 14px',
          flex: '1 1 280px',
          maxWidth: '400px'
        }}>
          <Search size={16} color="var(--text-tertiary)" />
          <input
            type="text"
            placeholder="Search technique ID (e.g. T1566) or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              width: '100%',
              fontFamily: 'inherit'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '0 4px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              border: activeFilter === 'all' ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: activeFilter === 'all' ? 'var(--accent-dim)' : 'transparent',
              color: activeFilter === 'all' ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            All Techniques
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('matches')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              border: activeFilter === 'matches' ? '1px solid #10b981' : '1px solid var(--border)',
              background: activeFilter === 'matches' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
              color: activeFilter === 'matches' ? '#10b981' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Active Matches Only</span>
            <span style={{
              background: 'rgba(16, 185, 129, 0.25)',
              borderRadius: '10px',
              padding: '1px 6px',
              fontSize: '10px'
            }}>
              {allTechniques.filter(t => t.hits > 0).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('high')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              border: activeFilter === 'high' ? '1px solid #f43f5e' : '1px solid var(--border)',
              background: activeFilter === 'high' ? 'rgba(244, 63, 94, 0.12)' : 'transparent',
              color: activeFilter === 'high' ? '#f43f5e' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>High Severity</span>
            <span style={{
              background: 'rgba(244, 63, 94, 0.25)',
              borderRadius: '10px',
              padding: '1px 6px',
              fontSize: '10px'
            }}>
              {criticalCount}
            </span>
          </button>
        </div>
      </div>

      {/* ─── Tactic & Technique Matrix Grid Card ─── */}
      <div style={{
        background: 'var(--bg-glass-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Matrix Card Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
              Enterprise Tactic Progression Matrix
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Select any technique card to inspect associated indicators, threat actors, and defensive playbooks.
            </div>
          </div>

          {/* Heatmap Legend */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '11.5px',
            color: 'var(--text-tertiary)',
            background: 'var(--bg-overlay)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <span style={{ fontWeight: '600' }}>Detection Density:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }} />
              <span>0 Hits</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
              <span>1-4 Hits</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
              <span>5-6 Hits</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} />
              <span>7+ Critical</span>
            </div>
          </div>
        </div>

        {/* ─── Horizontally Scrollable Matrix Grid ─── */}
        <div style={{
          overflowX: 'auto',
          paddingBottom: '12px',
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: 'minmax(230px, 1fr)',
          gap: '14px',
          alignItems: 'start'
        }}>
          {filteredTactics.map(tactic => (
            <div
              key={tactic.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: 'var(--bg-overlay)',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid var(--border)'
              }}
            >
              {/* Tactic Column Header */}
              <div style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '10.5px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent)',
                    fontWeight: '800'
                  }}>
                    {tactic.id}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: 'var(--text-tertiary)',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {tactic.phase}
                  </span>
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {tactic.name}
                </div>
              </div>

              {/* Techniques in this Tactic */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tactic.techniques.length === 0 ? (
                  <div style={{
                    fontSize: '11.5px',
                    color: 'var(--text-disabled)',
                    textAlign: 'center',
                    padding: '16px 8px',
                    fontStyle: 'italic'
                  }}>
                    No techniques match active filter
                  </div>
                ) : (
                  tactic.techniques.map(tech => {
                    const isSelected = selectedTech?.id === tech.id;
                    const hasHits = tech.hits > 0;
                    const isCritical = tech.hits >= 7;
                    const isHigh = tech.hits >= 5;

                    // Compute card styling
                    let bg = 'var(--bg-elevated)';
                    let borderColor = 'var(--border)';
                    let hitColor = 'var(--text-disabled)';

                    if (isSelected) {
                      bg = 'rgba(56, 189, 248, 0.16)';
                      borderColor = 'var(--accent)';
                    } else if (isCritical) {
                      bg = 'rgba(244, 63, 94, 0.12)';
                      borderColor = 'rgba(244, 63, 94, 0.4)';
                      hitColor = '#f43f5e';
                    } else if (isHigh) {
                      bg = 'rgba(245, 158, 11, 0.1)';
                      borderColor = 'rgba(245, 158, 11, 0.35)';
                      hitColor = '#f59e0b';
                    } else if (hasHits) {
                      bg = 'rgba(56, 189, 248, 0.08)';
                      borderColor = 'rgba(56, 189, 248, 0.25)';
                      hitColor = 'var(--accent)';
                    }

                    return (
                      <div
                        key={tech.id}
                        onClick={() => handleSelectTechnique(tactic, tech)}
                        style={{
                          background: bg,
                          border: `1px solid ${borderColor}`,
                          borderRadius: '8px',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected
                            ? '0 0 16px rgba(56, 189, 248, 0.25), inset 0 0 0 1px var(--accent)'
                            : 'none',
                          transform: isSelected ? 'scale(1.01)' : 'none',
                          position: 'relative'
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = borderColor;
                            e.currentTarget.style.transform = 'none';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            color: isSelected ? 'var(--accent)' : 'var(--text-tertiary)',
                            fontWeight: '700'
                          }}>
                            {tech.id}
                          </span>
                          <span style={{
                            fontSize: '10.5px',
                            fontWeight: '800',
                            fontFamily: 'var(--font-mono)',
                            color: hitColor,
                            padding: hasHits ? '1px 6px' : '0',
                            borderRadius: '4px',
                            background: hasHits ? 'rgba(0,0,0,0.2)' : 'transparent'
                          }}>
                            {hasHits ? `${tech.hits} hits` : '0'}
                          </span>
                        </div>

                        <div style={{
                          fontSize: '12.5px',
                          fontWeight: isSelected ? '700' : '600',
                          color: isSelected ? '#ffffff' : hasHits ? 'var(--text-primary)' : 'var(--text-secondary)',
                          lineHeight: '1.35'
                        }}>
                          {tech.name}
                        </div>

                        {/* Severity Indicator Bar */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '4px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            color: getSeverityBadge(tech.severity).color
                          }}>
                            {tech.severity}
                          </span>
                          {isSelected && (
                            <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: '700' }}>
                              SELECTED ●
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Deep-Dive Selected Technique Dossier (Inspector Panel) ─── */}
      {selectedTech && (
        <div
          ref={inspectorRef}
          style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border-accent)',
            borderRadius: '16px',
            padding: '26px 30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'visible'
          }}
        >
          {/* Top Banner with Technique Metadata & External MITRE Link */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            paddingBottom: '18px',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(56, 189, 248, 0.18)',
                  color: 'var(--accent)',
                  border: '1px solid var(--border-accent)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '800',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.02em'
                }}>
                  {selectedTech.id}
                </span>

                <span style={{
                  background: 'var(--bg-overlay)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: '700'
                }}>
                  {selectedTactic?.name || 'Initial Access'} ({selectedTactic?.id || 'TA0001'})
                </span>

                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  background: getSeverityBadge(selectedTech.severity).bg,
                  color: getSeverityBadge(selectedTech.severity).color,
                  border: `1px solid ${getSeverityBadge(selectedTech.severity).border}`
                }}>
                  {selectedTech.severity} Severity
                </span>

                <span style={{
                  background: 'rgba(244, 63, 94, 0.14)',
                  color: '#f43f5e',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: '800'
                }}>
                  {selectedTech.hits} Observed Detections
                </span>
              </div>

              <h2 style={{
                fontSize: '22px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                margin: '4px 0 0',
                letterSpacing: '-0.01em'
              }}>
                {selectedTech.name}
              </h2>
            </div>

            {/* External Reference Link */}
            <a
              href={selectedTech.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '9px 16px',
                color: 'var(--accent)',
                fontSize: '12.5px',
                fontWeight: '700',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.background = 'var(--accent-dim)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--bg-overlay)';
              }}
            >
              <span>View Official MITRE ATT&CK® Dossier</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Technique Description Callout */}
          <div style={{
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              fontSize: '11.5px',
              fontWeight: '800',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Terminal size={14} color="var(--accent)" />
              <span>Adversary Technique Description & Scope</span>
            </div>
            <p style={{
              fontSize: '13.5px',
              color: 'var(--text-primary)',
              lineHeight: '1.65',
              margin: 0
            }}>
              {selectedTech.desc}
            </p>
          </div>

          {/* ─── 3-Column Detailed Inspector Grid ─── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {/* Column 1: Active Correlated Indicators (IoCs) */}
            <div style={{
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Crosshair size={16} color="var(--accent)" />
                  <span>Mapped Threat Indicators ({selectedTech.related?.length || 0})</span>
                </div>
              </div>

              {selectedTech.related && selectedTech.related.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedTech.related.map((ind, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
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
                        type="button"
                        onClick={() => onNavigateTab && onNavigateTab('analyzer', { indicator: ind })}
                        style={{
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          color: 'var(--accent)',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          flexShrink: 0,
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'var(--accent)';
                          e.currentTarget.style.color = '#06090f';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
                          e.currentTarget.style.color = 'var(--accent)';
                        }}
                        title="Investigate this observable in Threat Analyzer"
                      >
                        <span>Analyze</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '12px 0' }}>
                  No active indicators mapped to this technique yet.
                </div>
              )}
            </div>

            {/* Column 2: Threat Actors & Tooling */}
            <div style={{
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Eye size={16} color="#818cf8" />
                <span>Known Threat Actors & Tooling</span>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Attributed APT Groups
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(selectedTech.threatActors || ['APT29', 'Sandworm']).map((actor, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'rgba(129, 140, 248, 0.12)',
                        border: '1px solid rgba(129, 140, 248, 0.3)',
                        color: '#818cf8',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: '700'
                      }}
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Associated Malware / Tools
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(selectedTech.tools || ['Cobalt Strike', 'Mimikatz']).map((tool, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'rgba(244, 63, 94, 0.12)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        color: '#f43f5e',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: '700'
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 3: SOC Defense & Mitigation Playbook */}
            <div style={{
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Lock size={16} color="#10b981" />
                <span>Defensive Mitigations & Hardening</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(selectedTech.mitigations || [
                  'Deploy endpoint behavioral heuristic detection to flag anomalous script executions.',
                  'Enforce least-privilege identity access management.'
                ]).map((mit, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}
                  >
                    <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {mit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
