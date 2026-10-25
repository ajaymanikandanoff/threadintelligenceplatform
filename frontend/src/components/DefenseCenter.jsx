import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Shield, Layers, HelpCircle, AlertCircle } from 'lucide-react';

export default function DefenseCenter({ defenseArtifacts, threatData }) {
  const [tab, setTab] = useState('sigma');
  const [copied, setCopied] = useState(false);
  const [copiedIps, setCopiedIps] = useState(false);

  const { sigma_rule = '', yara_rule = '', stix_bundle = {} } = defenseArtifacts || {};
  const stixStr = JSON.stringify(stix_bundle, null, 2);

  const content = tab === 'sigma' ? sigma_rule : tab === 'yara' ? yara_rule : stixStr;
  const filename = tab === 'sigma' ? 'sigma_detection.yml' : tab === 'yara' ? 'malware_scan.yar' : 'stix_bundle.json';

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

  // Quick extract of all IPs from threat data
  const ipList = (threatData?.iocs || []).filter(i => i.type === 'ipv4').map(i => i.value).join('\n');

  const copyAllIps = () => {
    if (!ipList) return;
    navigator.clipboard.writeText(ipList);
    setCopiedIps(true);
    setTimeout(() => setCopiedIps(false), 1500);
  };

  const tabs = [
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

  const currentTabInfo = tabs.find(t => t.id === tab);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* Header with Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-0)', margin: 0 }}>
            Automated Defense & Detection Rules
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            Production-ready rules auto-generated from this threat report to protect your servers and firewalls.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {ipList && (
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
              <span>{copiedIps ? 'IPs Copied!' : 'Copy All Malicious IPs'}</span>
            </button>
          )}

          <button className="btn-ghost" onClick={doCopy} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
            {copied ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Rule'}</span>
          </button>
          <button className="btn-primary" onClick={doDownload} style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
            <Download size={14} />
            <span>Download {filename}</span>
          </button>
        </div>
      </div>

      {/* Rule Type Selector Cards with Explanations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="surface"
              style={{
                padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                borderColor: active ? t.color : 'var(--border)',
                background: active ? 'rgba(255,255,255,0.03)' : 'var(--bg-1)',
                borderWidth: active ? '2px' : '1px',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Icon size={16} color={active ? t.color : 'var(--text-3)'} />
                <span style={{ fontSize: '0.86rem', fontWeight: '700', color: active ? 'var(--text-0)' : 'var(--text-2)' }}>
                  {t.label}
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-3)', margin: 0, lineHeight: '1.4' }}>
                {t.whatIsIt}
              </p>
            </button>
          );
        })}
      </div>

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
            {tab === 'sigma' ? 'YAML Format' : tab === 'yara' ? 'YARA Rule' : 'JSON Format'}
          </span>
        </div>
        <pre style={{
          margin: 0, padding: '16px 20px', overflowX: 'auto', maxHeight: '420px',
          fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: '1.55',
          color: 'var(--text-1)', background: 'transparent'
        }}>
          <code>{content || '# Generating detection rule...'}</code>
        </pre>
      </div>

    </div>
  );
}
