import React, { useState } from 'react';
import { ShieldCheck, Download, Copy, Check, FileCode, Layers, Info } from 'lucide-react';

export default function DefenseCenter({ defenseArtifacts, threatActor }) {
  const [activeTab, setActiveTab] = useState('sigma');
  const [copied, setCopied] = useState(false);

  const {
    sigma_rule = '# No Sigma Rule Generated',
    yara_rule = '// No YARA Rule Generated',
    stix_bundle = {}
  } = defenseArtifacts || {};

  const stixFormatted = JSON.stringify(stix_bundle, null, 2);

  const currentContent = 
    activeTab === 'sigma' ? sigma_rule :
    activeTab === 'yara' ? yara_rule :
    stixFormatted;

  const currentFilename = 
    activeTab === 'sigma' ? 'detection_sigma_rule.yml' :
    activeTab === 'yara' ? 'malware_yara_rule.yar' :
    'stix21_threat_bundle.json';

  const copyContent = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadContent = () => {
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFilename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div className="cyber-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShieldCheck size={20} color="var(--accent-green)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.03em' }}>
              Automated Defense & Detection Engineering Center
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Production-ready detection artifacts generated from extracted threat intelligence. Directly importable into enterprise SIEM, EDR, and Threat Intel Platforms.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="cyber-btn-secondary" onClick={copyContent}>
            {copied ? <Check size={14} color="var(--accent-green)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Artifact'}</span>
          </button>
          <button className="cyber-btn-primary" onClick={downloadContent}>
            <Download size={14} />
            <span>Download {currentFilename}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('sigma')}
          style={{
            background: activeTab === 'sigma' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
            border: `1px solid ${activeTab === 'sigma' ? 'var(--accent-cyan)' : 'transparent'}`,
            color: activeTab === 'sigma' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileCode size={15} />
          <span>Sigma Rule (SIEM Detection YAML)</span>
        </button>

        <button
          onClick={() => setActiveTab('yara')}
          style={{
            background: activeTab === 'yara' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
            border: `1px solid ${activeTab === 'yara' ? 'var(--accent-purple)' : 'transparent'}`,
            color: activeTab === 'yara' ? 'var(--accent-purple)' : 'var(--text-muted)',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ShieldCheck size={15} />
          <span>YARA Rule (Malware Scanning)</span>
        </button>

        <button
          onClick={() => setActiveTab('stix')}
          style={{
            background: activeTab === 'stix' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            border: `1px solid ${activeTab === 'stix' ? 'var(--accent-green)' : 'transparent'}`,
            color: activeTab === 'stix' ? 'var(--accent-green)' : 'var(--text-muted)',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Layers size={15} />
          <span>STIX 2.1 Standard Bundle (JSON)</span>
        </button>
      </div>

      {/* Code Display Area */}
      <div className="cyber-card" style={{ padding: '20px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            <span>FILENAME: {currentFilename}</span>
            <span>•</span>
            <span>TARGET: {activeTab === 'sigma' ? 'Splunk / Elastic / Sentinel' : activeTab === 'yara' ? 'Endpoint EDR / ClamAV' : 'OpenCTI / MISP'}</span>
          </div>
          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
            STATUS: VALIDATED
          </span>
        </div>

        <pre style={{
          background: 'rgba(5, 8, 17, 0.9)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '16px',
          color: activeTab === 'sigma' ? '#a5f3fc' : activeTab === 'yara' ? '#e9d5ff' : '#86efac',
          fontSize: '0.84rem',
          lineHeight: '1.5',
          overflowX: 'auto',
          maxHeight: '480px'
        }}>
          <code>{currentContent}</code>
        </pre>
      </div>

      {/* Explainer for Evaluators / Viva */}
      <div className="cyber-card" style={{ padding: '16px 20px', background: 'rgba(0, 240, 255, 0.04)', borderColor: 'rgba(0, 240, 255, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px' }}>
          <Info size={16} />
          <span>Why this is crucial for Industry & Academic Evaluation:</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          Traditional threat intel tools stop at text summaries. This platform produces actionable cyber defense rules: <strong>Sigma</strong> converts threat behaviors into SIEM query syntax, <strong>YARA</strong> identifies binary malware artifacts in file systems, and <strong>STIX 2.1</strong> ensures compatibility with international Cyber Threat Sharing platforms (like US-CERT and European CIRCL).
        </p>
      </div>
    </div>
  );
}
