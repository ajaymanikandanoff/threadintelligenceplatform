import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Shield, Layers, Terminal, Server } from 'lucide-react';

export default function DefenseCenter({ defenseArtifacts, threatData }) {
  const [tab, setTab] = useState('firewall');
  const [firewallFormat, setFirewallFormat] = useState('powershell');
  const [copied, setCopied] = useState(false);
  const [copiedIps, setCopiedIps] = useState(false);

  const { sigma_rule = '', yara_rule = '', stix_bundle = {} } = defenseArtifacts || {};
  const stixStr = JSON.stringify(stix_bundle, null, 2);

  // Extract IPs and Domains
  const rawIps = (threatData?.iocs || []).filter(i => i.type === 'ipv4').map(i => i.value.replace(/\[\.\]/g, '.'));
  const rawDomains = (threatData?.iocs || []).filter(i => i.type === 'domain').map(i => i.value.replace(/\[\.\]/g, '.'));

  // Generate firewall scripts based on format
  const generateFirewallScript = () => {
    if (rawIps.length === 0 && rawDomains.length === 0) {
      return '# No malicious IP or Domain indicators extracted for this campaign.';
    }

    if (firewallFormat === 'powershell') {
      let script = '# Windows PowerShell Inbound & Outbound Block Rules\n# Run as Administrator:\n\n';
      rawIps.forEach(ip => {
        script += `New-NetFirewallRule -DisplayName "BLOCK-C2-${ip}" -Direction Inbound -Action Block -RemoteAddress "${ip}"\n`;
        script += `New-NetFirewallRule -DisplayName "BLOCK-C2-${ip}" -Direction Outbound -Action Block -RemoteAddress "${ip}"\n`;
      });
      return script;
    } else if (firewallFormat === 'iptables') {
      let script = '#!/bin/bash\n# Linux iptables Perimeter Drop Rules\n# Run with sudo:\n\n';
      rawIps.forEach(ip => {
        script += `iptables -A INPUT -s ${ip} -j DROP\n`;
        script += `iptables -A OUTPUT -d ${ip} -j DROP\n`;
      });
      return script;
    } else if (firewallFormat === 'cisco') {
      let script = '! Cisco ASA / Switch Access Control List (ACL)\n';
      rawIps.forEach(ip => {
        script += `access-list OUTSIDE_IN deny ip host ${ip} any\n`;
      });
      return script;
    } else if (firewallFormat === 'hosts') {
      let script = '# Local /etc/hosts or Windows hosts file DNS Sinkhole\n# 127.0.0.1 redirect to nullify connection:\n\n';
      rawDomains.forEach(dom => {
        script += `0.0.0.0 ${dom}\n`;
      });
      return script;
    }
    return rawIps.join('\n');
  };

  const firewallScriptContent = generateFirewallScript();

  let content = '';
  let filename = '';
  if (tab === 'firewall') {
    content = firewallScriptContent;
    filename = firewallFormat === 'powershell' ? 'block_firewall.ps1' : firewallFormat === 'iptables' ? 'block_iptables.sh' : 'firewall_acl.txt';
  } else if (tab === 'sigma') {
    content = sigma_rule;
    filename = 'sigma_detection.yml';
  } else if (tab === 'yara') {
    content = yara_rule;
    filename = 'malware_scan.yar';
  } else {
    content = stixStr;
    filename = 'stix_bundle.json';
  }

  const doCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const doDownload = () => {
    const b = new Blob([content], { type: 'text/plain' });
    const u = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = u;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(u);
  };

  const copyAllIps = () => {
    if (rawIps.length === 0) return;
    navigator.clipboard.writeText(rawIps.join('\n'));
    setCopiedIps(true);
    setTimeout(() => setCopiedIps(false), 1500);
  };

  const tabs = [
    {
      id: 'firewall',
      label: 'Firewall Block Scripts',
      whatIsIt: '1-click copy-paste terminal scripts for Windows PowerShell, Linux iptables & Cisco.',
      icon: Terminal,
      color: 'var(--red)'
    },
    {
      id: 'sigma',
      label: 'Sigma SIEM Rule',
      whatIsIt: 'Universal search query for Splunk, Elastic, Sentinel to detect attacker activity.',
      icon: FileCode,
      color: 'var(--cyan)'
    },
    {
      id: 'yara',
      label: 'YARA Antivirus Rule',
      whatIsIt: 'Malware scanner signature to find malicious webshells and files on servers.',
      icon: Shield,
      color: 'var(--purple)'
    },
    {
      id: 'stix',
      label: 'STIX 2.1 Bundle',
      whatIsIt: 'Standardized threat intelligence format to share with firewalls and threat sharing portals.',
      icon: Layers,
      color: 'var(--green)'
    }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* Header with Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-0)', margin: 0 }}>
            Automated Defense & Firewall Generator
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            Production-ready rules auto-generated from this threat report to protect your network immediately.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {rawIps.length > 0 && (
            <button
              onClick={copyAllIps}
              className="btn-ghost"
              style={{
                padding: '6px 12px', fontSize: '0.78rem',
                borderColor: 'rgba(252,129,129,0.35)', color: 'var(--red)'
              }}
              title="Copy all malicious IPs separated by newlines for firewall blocklist"
            >
              {copiedIps ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
              <span>{copiedIps ? 'All IPs Copied!' : 'Copy Raw IPs'}</span>
            </button>
          )}

          <button className="btn-ghost" onClick={doCopy} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
            {copied ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Script'}</span>
          </button>
          <button className="btn-primary" onClick={doDownload} style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
            <Download size={14} />
            <span>Download {filename}</span>
          </button>
        </div>
      </div>

      {/* Rule Type Selector Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="surface"
              style={{
                padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                borderColor: active ? t.color : 'var(--border)',
                background: active ? 'rgba(255,255,255,0.03)' : 'var(--bg-1)',
                borderWidth: active ? '2px' : '1px',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Icon size={16} color={active ? t.color : 'var(--text-3)'} />
                <span style={{ fontSize: '0.84rem', fontWeight: '700', color: active ? 'var(--text-0)' : 'var(--text-2)' }}>
                  {t.label}
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', margin: 0, lineHeight: '1.35' }}>
                {t.whatIsIt}
              </p>
            </button>
          );
        })}
      </div>

      {/* Sub-selector for Firewall format */}
      {tab === 'firewall' && (
        <div style={{
          display: 'flex', gap: '8px', alignItems: 'center',
          padding: '8px 14px', background: 'var(--bg-2)', borderRadius: '8px', border: '1px solid var(--border)'
        }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-3)', fontWeight: '600' }}>Select Firewall Format:</span>
          {[
            { id: 'powershell', label: 'Windows PowerShell' },
            { id: 'iptables',   label: 'Linux iptables' },
            { id: 'cisco',      label: 'Cisco ASA ACL' },
            { id: 'hosts',      label: 'Hosts File (Domains)' }
          ].map(fmt => (
            <button
              key={fmt.id}
              onClick={() => setFirewallFormat(fmt.id)}
              style={{
                padding: '4px 10px', borderRadius: '5px',
                background: firewallFormat === fmt.id ? 'rgba(252,129,129,0.15)' : 'transparent',
                border: `1px solid ${firewallFormat === fmt.id ? 'var(--red)' : 'var(--border)'}`,
                color: firewallFormat === fmt.id ? 'var(--red)' : 'var(--text-2)',
                fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'var(--font-mono)'
              }}
            >
              {fmt.label}
            </button>
          ))}
        </div>
      )}

      {/* Rule Content Viewer */}
      <div className="surface" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 16px', background: 'var(--bg-2)', borderBottom: '1px solid var(--border)'
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-2)' }}>
            {filename}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--cyan)' }}>
            {tab === 'firewall' ? `${rawIps.length} Malicious IPs ready to drop` : tab === 'sigma' ? 'YAML Format' : tab === 'yara' ? 'YARA Rule' : 'JSON Format'}
          </span>
        </div>
        <pre style={{
          margin: 0, padding: '16px 20px', overflowX: 'auto', maxHeight: '420px',
          fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: '1.55',
          color: 'var(--text-1)', background: 'transparent'
        }}>
          <code>{content || '# Generating detection script...'}</code>
        </pre>
      </div>

    </div>
  );
}
