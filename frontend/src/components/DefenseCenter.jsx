import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Shield, Layers } from 'lucide-react';

export default function DefenseCenter({ defenseArtifacts }) {
  const [tab, setTab] = useState('sigma');
  const [copied, setCopied] = useState(false);

  const { sigma_rule = '', yara_rule = '', stix_bundle = {} } = defenseArtifacts || {};
  const stixStr = JSON.stringify(stix_bundle, null, 2);

  const content = tab === 'sigma' ? sigma_rule : tab === 'yara' ? yara_rule : stixStr;
  const filename = tab === 'sigma' ? 'sigma_detection.yml' : tab === 'yara' ? 'malware_scan.yar' : 'stix_bundle.json';

  const doCopy = () => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const doDownload = () => { const b = new Blob([content], { type: 'text/plain' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = filename; a.click(); URL.revokeObjectURL(u); };

  const tabs = [
    { id: 'sigma', label: 'Sigma Rule', sub: 'SIEM Detection · YAML', icon: FileCode, color: 'var(--cyan)' },
    { id: 'yara',  label: 'YARA Rule',  sub: 'Malware Scan', icon: Shield, color: 'var(--purple)' },
    { id: 'stix',  label: 'STIX 2.1',   sub: 'Threat Intel Standard · JSON', icon: Layers, color: 'var(--green)' }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-0)' }}>Defense Artifacts</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost" onClick={doCopy} style={{ padding: '6px 12px' }}>
            {copied ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button className="btn-primary" onClick={doDownload} style={{ padding: '6px 14px' }}>
            <Download size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className="surface"
              style={{
                flex: 1, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                borderColor: active ? t.color : undefined,
                background: active ? 'rgba(255,255,255,0.03)' : undefined
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Icon size={15} color={active ? t.color : 'var(--text-3)'} />
                <span style={{ fontSize: '0.86rem', fontWeight: '600', color: active ? 'var(--text-0)' : 'var(--text-2)' }}>{t.label}</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{t.sub}</span>
            </button>
          );
        })}
      </div>

      {/* Code block */}
      <div className="surface" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>{filename}</span>
          <span className="tag tag-green">VALIDATED</span>
        </div>
        <pre style={{
          background: 'var(--bg-0)', border: '1px solid var(--border)', borderRadius: '6px',
          padding: '16px', fontSize: '0.82rem', lineHeight: '1.55', overflowX: 'auto', maxHeight: '450px',
          color: tab === 'sigma' ? 'var(--cyan-bright)' : tab === 'yara' ? '#d6bcfa' : 'var(--green)'
        }}>
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}
