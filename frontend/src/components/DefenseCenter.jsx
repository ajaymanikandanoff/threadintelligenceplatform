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
    setTimeout(() => setCopied(false), 1600);
  };

  const doDownload = () => {
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([content], { type: 'text/plain' })),
      download: filename
    });
    a.click();
  };

  const lineCount = content ? content.split('\n').length : 0;

  return (
    <div className="code-block" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '420px' }}>
      <div className="code-block-header" style={{ padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent)', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>{filename}</span>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            ({lineCount} lines · UTF-8)
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={doCopy}
            className="btn-ghost"
            style={{
              padding: '4px 10px', fontSize: '11.5px',
              color: copied ? 'var(--green)' : 'var(--text-secondary)',
              borderColor: copied ? 'rgba(16,185,129,0.35)' : undefined
            }}
          >
            {copied ? <Check size={12} color="var(--green)" /> : <Copy size={12} />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy'}</span>
          </button>
          <button
            onClick={doDownload}
            className="btn-ghost"
            style={{ padding: '4px 10px', fontSize: '11.5px' }}
          >
            <Download size={12} />
            <span>Download</span>
          </button>
        </div>
      </div>
      <pre style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: '520px',
        padding: '18px 20px',
        fontSize: '12px',
        lineHeight: '1.75',
        color: '#e2e8f0',
        fontFamily: 'var(--font-mono)'
      }}>
        {content || `# No ${lang} rule content generated for this advisory.`}
      </pre>
    </div>
  );
}

export default function DefenseCenter({ defenseArtifacts, threatData }) {
  const [activeTab, setActiveTab]     = useState('firewall');
  const [fwFormat, setFwFormat]       = useState('powershell');

  const { sigma_rule = '', yara_rule = '', stix_bundle = {} } = defenseArtifacts || {};
  const stixStr = JSON.stringify(stix_bundle, null, 2);

  const IP_REGEX = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/[0-9]{1,2})?$/;
  const DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;

  const rawIps = (threatData?.iocs || [])
    .filter(i => i.type?.toLowerCase().includes('ip'))
    .map(i => i.value?.replace(/\[\.\]/g, '.').trim() || '')
    .filter(ip => IP_REGEX.test(ip));

  const rawDomains = (threatData?.iocs || [])
    .filter(i => i.type?.toLowerCase().includes('domain'))
    .map(i => i.value?.replace(/\[\.\]/g, '.').trim() || '')
    .filter(d => DOMAIN_REGEX.test(d));

  const buildFirewall = () => {
    if (!rawIps.length && !rawDomains.length) return '# No malicious IPs or domains extracted for this campaign.';
    if (fwFormat === 'powershell') {
      return `# ═══════════════════════════════════════════════
# CyberIntel.AI — Windows PowerShell Firewall Block
# Run as Administrator in elevated PowerShell terminal
# ═══════════════════════════════════════════════
\n` + rawIps.map(ip =>
        `New-NetFirewallRule -DisplayName "CYBERINTEL-BLOCK-${ip}" -Direction Inbound  -Action Block -RemoteAddress "${ip}"\n` +
        `New-NetFirewallRule -DisplayName "CYBERINTEL-BLOCK-${ip}" -Direction Outbound -Action Block -RemoteAddress "${ip}"`
      ).join('\n');
    }
    if (fwFormat === 'iptables') {
      return `#!/bin/bash
# ═══════════════════════════════════════════════
# CyberIntel.AI — Linux iptables Perimeter Drop Rules
# Run with: sudo bash block_iptables.sh
# ═══════════════════════════════════════════════
\n` + rawIps.map(ip =>
        `iptables -A INPUT  -s ${ip} -j DROP\n` +
        `iptables -A OUTPUT -d ${ip} -j DROP`
      ).join('\n');
    }
    if (fwFormat === 'cisco') {
      return `! ═══════════════════════════════════════════════
! CyberIntel.AI — Cisco ASA / IOS ACL Block Rules
! Paste into privileged configure terminal mode
! ═══════════════════════════════════════════════\n\n` +
      rawIps.map(ip => `access-list CYBERINTEL_BLOCK deny ip host ${ip} any log`).join('\n');
    }
    if (fwFormat === 'hosts') {
      return `# ═══════════════════════════════════════════════
# CyberIntel.AI — Operating System Hosts DNS Sinkhole
# Add entries to: /etc/hosts (Linux/macOS) or
#   C:\\Windows\\System32\\drivers\\etc\\hosts (Windows)
# ═══════════════════════════════════════════════
\n` + rawDomains.map(d => `0.0.0.0   ${d}`).join('\n');
    }
    return rawIps.join('\n');
  };

  const getFwFilename = () => ({
    powershell: 'block_c2_ips.ps1',
    iptables:   'block_iptables.sh',
    cisco:      'cisco_acl.txt',
    hosts:      'hosts_sinkhole.txt'
  }[fwFormat]);

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
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Automated Defense & Rule Generator
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Export ready-to-deploy boundary firewall block rules, SIEM Sigma detections, YARA binary scanners, and STIX 2.1 intelligence bundles.
        </p>
      </div>

      {/* Rule Selection Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {RULE_TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px',
                padding: '14px 16px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                background: active ? 'linear-gradient(180deg, rgba(56,189,248,0.12) 0%, rgba(56,189,248,0.02) 100%)' : 'var(--bg-elevated)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                boxShadow: active ? 'var(--shadow-glow)' : 'none',
                fontFamily: 'var(--font-sans)', transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={15} color={active ? 'var(--accent)' : 'var(--text-secondary)'} />
                <span style={{ fontSize: '13px', fontWeight: '800', color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
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

      {/* Firewall Platform Switcher & Telemetry Pill */}
      {activeTab === 'firewall' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {FIREWALL_FORMATS.map(f => {
              const Icon = f.icon;
              const active = fwFormat === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFwFormat(f.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                    background: active ? 'rgba(16,185,129,0.12)' : 'var(--bg-overlay)',
                    border: `1px solid ${active ? 'rgba(16,185,129,0.35)' : 'var(--border)'}`,
                    color: active ? 'var(--green)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: active ? '700' : '500',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <Icon size={13} />
                  <span>{f.label}</span>
                  <code style={{ fontSize: '10.5px', opacity: 0.8, fontFamily: 'var(--font-mono)' }}>{f.ext}</code>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--red-dim)', border: '1px solid rgba(244,63,94,0.25)', fontSize: '11.5px', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)' }}>
              <Shield size={13} /> <strong>{rawIps.length}</strong> Malicious IPs Sanitized
            </div>
            <div style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '11.5px', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)' }}>
              <FileCode size={13} /> <strong>{rawDomains.length}</strong> Domains Sinkholed
            </div>
          </div>
        </div>
      )}

      {/* Code Display */}
      <CodeDisplay
        content={getContent()}
        filename={getFilename()}
        lang={activeTab}
      />
    </div>
  );
}
