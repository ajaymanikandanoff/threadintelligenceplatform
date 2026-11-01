import React, { useState, useRef } from 'react';
import { X, FileUp, FileText, Shield, Loader, ChevronRight, ArrowRight, UploadCloud } from 'lucide-react';

export default function IngestModal({ isOpen, onClose, sampleReports = [], onAnalyze, onUploadFile, isAnalyzing }) {
  const [mode, setMode] = useState('feeds');
  const [selectedId, setSelectedId] = useState(sampleReports[0]?.id || '');
  const [customText, setCustomText] = useState('');
  const [file, setFile] = useState(null);
  const [isDrag, setIsDrag] = useState(false);
  const fileRef = useRef(null);

  if (!isOpen) return null;

  const handleGo = () => {
    if (mode === 'upload' && file) onUploadFile(file);
    else if (mode === 'feeds') {
      const r = sampleReports.find(x => x.id === selectedId) || sampleReports[0];
      if (r) onAnalyze(r.content, r.title);
    } else if (mode === 'custom' && customText.trim()) {
      onAnalyze(customText.trim(), 'Custom Security Incident');
    }
  };

  const canGo = mode === 'upload' ? !!file : mode === 'feeds' ? true : !!customText.trim();

  const MODES = [
    { id: 'feeds', label: 'Government Bulletins', icon: Shield, desc: 'CISA, FBI, NSA advisories' },
    { id: 'upload', label: 'Upload Incident PDF', icon: FileUp, desc: 'Parse document with OCR' },
    { id: 'custom', label: 'Raw Log Stream', icon: FileText, desc: 'Paste telemetry / writeups' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: '600px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ padding: '22px 26px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Ingest & Analyze Threat Advisory
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Select a verified source or upload telemetry to extract adversary TTPs with Gemini AI.
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', border: 'none', background: 'transparent' }}>
            <X size={18} />
          </button>
        </div>

        {/* Source Mode Tabs */}
        <div style={{ display: 'flex', gap: '8px', padding: '16px 26px 0' }}>
          {MODES.map(m => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  flex: 1, padding: '12px 10px', borderRadius: '10px', cursor: 'pointer',
                  background: active ? 'linear-gradient(180deg, rgba(56,189,248,0.12) 0%, rgba(56,189,248,0.02) 100%)' : 'var(--bg-overlay)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans)', fontWeight: active ? '700' : '500', fontSize: '12px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? 'var(--shadow-glow)' : 'none'
                }}
              >
                <Icon size={16} color={active ? 'var(--accent)' : 'var(--text-tertiary)'} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div style={{ padding: '20px 26px' }}>

          {/* Feeds Mode */}
          {mode === 'feeds' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="section-label" style={{ marginBottom: '4px' }}>
                Verified CISA & Federal Threat Feeds
              </div>
              {sampleReports.map(rep => {
                const selected = selectedId === rep.id;
                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedId(rep.id)}
                    style={{
                      padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                      background: selected ? 'rgba(56,189,248,0.08)' : 'var(--bg-overlay)',
                      border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                      transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: selected ? 'var(--accent)' : 'var(--text-primary)', marginBottom: '3px' }}>
                        {rep.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        {rep.source} · {rep.date}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
                      <span className="badge badge-red">{rep.severity || 'CRITICAL'}</span>
                      <ChevronRight size={14} color={selected ? 'var(--accent)' : 'var(--text-tertiary)'} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upload Mode */}
          {mode === 'upload' && (
            <div
              onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
              onDragLeave={() => setIsDrag(false)}
              onDrop={e => { e.preventDefault(); setIsDrag(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${isDrag ? 'var(--accent)' : file ? 'var(--green)' : 'var(--border-strong)'}`,
                background: isDrag ? 'rgba(56,189,248,0.06)' : file ? 'rgba(16,185,129,0.06)' : 'var(--bg-overlay)',
                borderRadius: '12px', padding: '44px 20px', textAlign: 'center', cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <input ref={fileRef} type="file" accept=".pdf,.txt,.json,.md" onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }} style={{ display: 'none' }} />
              <UploadCloud size={36} color={file ? 'var(--green)' : 'var(--accent)'} style={{ marginBottom: '12px', opacity: 0.9 }} />
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {file ? file.name : 'Drag and drop advisory PDF, or browse files'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB — Document ready for ingestion` : 'Supports official PDF, TXT, JSON, MD threat advisories up to 15MB'}
              </div>
            </div>
          )}

          {/* Custom Text Mode */}
          {mode === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                Paste raw incident narrative or SIEM log text:
              </label>
              <textarea
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="Paste raw firewall alerts, intrusion writeups, forensic notes, or email threat bulletins here..."
                rows={8}
                style={{
                  width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
                  borderRadius: '10px', padding: '12px 14px', color: 'var(--text-primary)',
                  fontSize: '12px', fontFamily: 'var(--font-mono)', outline: 'none', resize: 'vertical'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 26px', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'flex-end', gap: '10px', background: 'var(--bg-overlay)'
        }}>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: '12.5px' }}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleGo}
            disabled={!canGo || isAnalyzing}
            style={{ minWidth: '150px', justifyContent: 'center', fontSize: '12.5px' }}
          >
            {isAnalyzing ? (
              <><Loader size={13} className="spin" /><span>Extracting TTPs…</span></>
            ) : (
              <><span>Run Threat Analysis</span><ArrowRight size={13} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
