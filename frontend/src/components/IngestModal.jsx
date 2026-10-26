import React, { useState } from 'react';
import { X, FileUp, FileText, Shield, Loader, ChevronRight, ArrowRight } from 'lucide-react';

export default function IngestModal({ isOpen, onClose, sampleReports = [], onAnalyze, onUploadFile, isAnalyzing }) {
  const [mode, setMode] = useState('feeds');
  const [selectedId, setSelectedId] = useState(sampleReports[0]?.id || '');
  const [customText, setCustomText] = useState('');
  const [file, setFile] = useState(null);
  const [isDrag, setIsDrag] = useState(false);
  const fileRef = React.useRef(null);

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
    { id: 'feeds', label: 'Government Feeds', icon: Shield, desc: 'CISA, FBI, NSA bulletins' },
    { id: 'upload', label: 'Upload PDF', icon: FileUp, desc: 'Any security advisory' },
    { id: 'custom', label: 'Paste Text', icon: FileText, desc: 'Raw incident logs' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: '580px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              Analyze Threat Report
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Select a source to extract intelligence automatically with Gemini AI.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '2px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', gap: '6px', padding: '16px 24px 0' }}>
          {MODES.map(m => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: '8px', cursor: 'pointer',
                  background: active ? 'var(--bg-active)' : 'var(--bg-overlay)',
                  border: `1px solid ${active ? 'var(--border-accent)' : 'var(--border)'}`,
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '12px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div style={{ padding: '16px 24px' }}>

          {/* Feeds Mode */}
          {mode === 'feeds' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                Select an official government advisory to analyze:
              </p>
              {sampleReports.map(rep => {
                const selected = selectedId === rep.id;
                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedId(rep.id)}
                    style={{
                      padding: '12px 14px', borderRadius: '8px', cursor: 'pointer',
                      background: selected ? 'var(--bg-active)' : 'var(--bg-overlay)',
                      border: `1px solid ${selected ? 'var(--border-accent)' : 'var(--border)'}`,
                      transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: selected ? 'var(--accent)' : 'var(--text-primary)', marginBottom: '2px' }}>
                        {rep.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {rep.source} · {rep.date}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '12px' }}>
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
                background: isDrag ? 'var(--bg-active)' : file ? 'rgba(52,211,153,0.05)' : 'var(--bg-overlay)',
                borderRadius: '10px', padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <input ref={fileRef} type="file" accept=".pdf,.txt,.json,.md" onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }} style={{ display: 'none' }} />
              <FileUp size={32} color={file ? 'var(--green)' : 'var(--accent)'} style={{ marginBottom: '10px', opacity: 0.8 }} />
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {file ? file.name : 'Drop PDF or click to browse'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB — Ready` : 'PDF, TXT, JSON, MD up to 20MB'}
              </div>
            </div>
          )}

          {/* Custom Text Mode */}
          {mode === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Paste raw security alert or advisory text:
              </label>
              <textarea
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="Paste firewall logs, SIEM alerts, security bulletins, or incident reports here..."
                rows={7}
                style={{
                  width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)',
                  fontSize: '12px', fontFamily: 'var(--font-mono)', outline: 'none', resize: 'vertical'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'flex-end', gap: '8px'
        }}>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: '13px' }}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleGo}
            disabled={!canGo || isAnalyzing}
            style={{ minWidth: '140px', justifyContent: 'center', fontSize: '13px' }}
          >
            {isAnalyzing ? (
              <><Loader size={13} className="spin" /><span>Analyzing…</span></>
            ) : (
              <><span>Run AI Analysis</span><ArrowRight size={13} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
