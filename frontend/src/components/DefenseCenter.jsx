import React, { useState } from 'react';
import { Copy, Check, Download, Shield, Terminal, FileCode, Layers, Server, Zap, Lock } from 'lucide-react';

const FIREWALL_FORMATS = [
  { id: 'powershell', label: 'Windows PowerShell', icon: Terminal, ext: '.ps1', desc: 'Block via Windows Defender Firewall' },
  { id: 'iptables',   label: 'Linux iptables',     icon: Server,   ext: '.sh',  desc: 'Block via Linux kernel firewall' },
  { id: 'cisco',      label: 'Cisco ACL',          icon: Lock,     ext: '.txt', desc: 'Cisco ASA / IOS access-list' },
  { id: 'hosts',      label: 'Hosts Sinkhole',     icon: FileCode, ext: '.txt', desc: 'DNS sinkhole via hosts file' },
];

const RULE_TABS = [
  { id: 'firewall', label: 'Firewall Rules', icon: Shield,   desc: 'Block malicious IPs & domains' },
  { id: 'sigma',    label: 'Sigma Rule',     icon: Zap,      desc: 'SIEM detection rule (Elastic/Splunk)' },
  { id: 'yara',     label: 'YARA Rule',      icon: FileCode, desc: 'Malware file scanner rule' },
  { id: 'stix',     label: 'STIX 2.1',       icon: Layers,   desc: 'Machine-readable threat intel bundle' },
];

function CodeDisplay({ content, filename, lang }) {
  const [copied, setCopied] = useState(false);

  const doCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const doDownload = () => {
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([content], { type: 'text/plain' })),
      download: filename
    });
    a.click();
  };

  return (
    <div className="code-block" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="code-block-header">
        <span>{filename}</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={doCopy}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', background: 'transparent', border: '1px solid var(--border)', color: copied ? 'var(--green)' : 'var(--text-tertiary)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px', transition: 'all 0.12s' }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={doDownload}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-tertiary)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px', transition: 'all 0.12s' }}
          >
            <Download size={11} /> Download
          </button>
        </div>
      </div>
      <pre style={{ flex: 1, overflowY: 'auto', maxHeight: '480px' }}>
        {content || `# No ${lang} content generated for this report.`}
      </pre>
    </div>
  );
}

export default function DefenseCenter({ defenseArtifacts, threatData }) {
  const [activeTab, setActiveTab]     = useState('firewall');
  const [fwFormat, setFwFormat]       = useState('powershell');

  const { sigma_rule = '', yara_rule = '', stix_bundle = {} } = defenseArtifacts || {};
  const stixStr = JSON.stringify(stix_bundle, null, 2);

  const rawIps     = (threatData?.iocs || []).filter(i => i.type?.toLowerCase().includes('ip')).map(i => i.value?.replace(/\[\.\]/g, '.') || '');
  const rawDomains = (threatData?.iocs || []).filter(i => i.type?.toLowerCase().includes('domain')).map(i => i.value?.replace(/\[\.\]/g, '.') || '');

  const buildFirewall = () => {
    if (!rawIps.length && !rawDomains.length) return '# No malicious IPs or domains extracted for this campaign.';
    if (fwFormat === 'powershell') {
      return `# ═══════════════════════════════════════════════
# CyberIntel.AI — Windows PowerShell Firewall Block
# Run as Administrator in PowerShell
# ═══════════════════════════════════════════════
\n` + rawIps.map(ip =>
        `New-NetFirewallRule -DisplayName "CYBERINTEL-BLOCK-${ip}" -Direction Inbound  -Action Block -RemoteAddress "${ip}"\n` +
        `New-NetFirewallRule -DisplayName "CYBERINTEL-BLOCK-${ip}" -Direction Outbound -Action Block -RemoteAddress "${ip}"`
      ).join('\n');
    }
    if (fwFormat === 'iptables') {
      return `#!/bin/bash
# ═══════════════════════════════════════════════
# CyberIntel.AI — Linux iptables Block Rules
# Run with: sudo bash block_iptables.sh
# ═══════════════════════════════════════════════
\n` + rawIps.map(ip =>
        `iptables -A INPUT  -s ${ip} -j DROP\n` +
        `iptables -A OUTPUT -d ${ip} -j DROP`
      ).join('\n');
    }
    if (fwFormat === 'cisco') {
      return `! ═══════════════════════════════════════════════
! CyberIntel.AI — Cisco ASA/IOS ACL Block Rules
! Paste into privileged EXEC mode
! ═══════════════════════════════════════════════\n\n` +
      rawIps.map((ip, i) => `access-list CYBERINTEL_BLOCK deny ip host ${ip} any log`).join('\n');
    }
    if (fwFormat === 'hosts') {
      return `# ═══════════════════════════════════════════════
# CyberIntel.AI — Hosts File DNS Sinkhole
# Add to: /etc/hosts (Linux/Mac) or
#   C:\\Windows\\System32\\drivers\\etc\\hosts (Windows)
# ═══════════════════════════════════════════════
\n` + rawDomains.map(d => `0.0.0.0   ${d}`).join('\n');
    }
    return rawIps.join('\n');
  };

  const getFwFilename = () => ({ powershell: 'block_c2_ips.ps1', iptables: 'block_iptables.sh', cisco: 'cisco_acl.txt', hosts: 'hosts_sinkhole.txt' }[fwFormat]);

  const getContent = () => {
    if (activeTab === 'sigma') return sigma_rule;
    if (activeTab === 'yara')  return yara_rule;
    if (activeTab === 'stix')  return stixStr;
    return buildFirewall();
  };

  const getFilename = () => {
    if (activeTab === 'sigma') return 'sigma_detection.yml';
    if (activeTab === 'yara')  return 'malware_scan.yar';
    if (activeTab === 'stix')  return 'stix_bundle.json';
    return getFwFilename();
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 130px)' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Defense & Detection Center
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          AI-generated firewall rules, SIEM detections, and threat intelligence artifacts — ready to deploy.
        </p>
      </div>

      {/* Main Rule Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {RULE_TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px',
                padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                background: active ? 'var(--bg-active)' : 'var(--bg-elevated)',
                border: `1px solid ${active ? 'var(--border-accent)' : 'var(--border)'}`,
                fontFamily: 'var(--font-sans)', transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon size={13} color={active ? 'var(--accent)' : 'var(--text-secondary)'} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: active ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {t.label}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: '1.3' }}>
                {t.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Firewall Format Picker */}
      {activeTab === 'firewall' && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {FIREWALL_FORMATS.map(f => {
            const Icon = f.icon;
            const active = fwFormat === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFwFormat(f.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 12px', borderRadius: '7px', cursor: 'pointer',
                  background: active ? 'rgba(52,211,153,0.1)' : 'var(--bg-overlay)',
                  border: `1px solid ${active ? 'rgba(52,211,153,0.3)' : 'var(--border)'}`,
                  color: active ? 'var(--green)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: '600',
                  transition: 'all 0.12s ease'
                }}
              >
                <Icon size={12} />
                <span>{f.label}</span>
                <code style={{ fontSize: '10px', opacity: 0.7, fontFamily: 'var(--font-mono)' }}>{f.ext}</code>
              </button>
            );
          })}
        </div>
      )}

      {/* Context banner for firewall */}
      {activeTab === 'firewall' && (
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--red-dim)', border: '1px solid rgba(248,113,113,0.2)', fontSize: '12px', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={13} /> <strong>{rawIps.length}</strong>&nbsp;malicious IPs to block
          </div>
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--amber-dim)', border: '1px solid rgba(251,191,36,0.2)', fontSize: '12px', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileCode size={13} /> <strong>{rawDomains.length}</strong>&nbsp;malicious domains to sinkhole
          </div>
        </div>
      )}

      {/* Code Output */}
      <CodeDisplay
        content={getContent()}
        filename={getFilename()}
        lang={activeTab}
      />
    </div>
  );
}
