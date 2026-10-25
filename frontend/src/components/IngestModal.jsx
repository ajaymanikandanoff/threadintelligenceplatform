import React, { useState, useRef } from 'react';
import { X, FileUp, Sparkles, FileText } from 'lucide-react';

export default function IngestModal({ isOpen, onClose, sampleReports = [], onAnalyze, onUploadFile, isAnalyzing }) {
  const [mode, setMode] = useState('upload');
  const [selectedId, setSelectedId] = useState(sampleReports[0]?.id || '');
  const [customText, setCustomText] = useState('');
  const [file, setFile] = useState(null);
  const [isDrag, setIsDrag] = useState(false);
  const fileRef = useRef(null);

  if (!isOpen) return null;

  const go = () => {
    if (mode === 'upload' && file) onUploadFile(file);
    else if (mode === 'samples') { const r = sampleReports.find(x => x.id === selectedId) || sampleReports[0]; if (r) onAnalyze(r.content, r.title); }
    else if (mode === 'custom' && customText.trim()) onAnalyze(customText.trim(), 'Custom Threat Report');
  };

  const canGo = mode === 'upload' ? !!file : mode === 'samples' ? true : !!customText.trim();

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,9,15,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }} onClick={onClose}>
      <div className="surface" style={{ maxWidth: '620px', width: '100%', padding: '28px', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-0)', marginBottom: '4px' }}>Ingest Threat Intelligence</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Upload a PDF, select a sample advisory, or paste raw text.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { id: 'upload', label: 'Upload PDF', icon: FileUp },
            { id: 'samples', label: 'Sample Reports', icon: Sparkles },
            { id: 'custom', label: 'Paste Text', icon: FileText }
          ].map(m => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                flex: 1, padding: '10px', borderRadius: '7px', cursor: 'pointer', textAlign: 'center',
                background: active ? 'rgba(99,179,237,0.1)' : 'transparent',
                border: `1px solid ${active ? 'rgba(99,179,237,0.35)' : 'var(--border)'}`,
                color: active ? 'var(--cyan)' : 'var(--text-3)',
                fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '0.82rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'all 0.15s ease'
              }}>
                <Icon size={15} /><span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Upload mode */}
        {mode === 'upload' && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
            onDragLeave={e => { e.preventDefault(); setIsDrag(false); }}
            onDrop={e => { e.preventDefault(); setIsDrag(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${isDrag ? 'var(--cyan)' : 'rgba(99,179,237,0.25)'}`,
              background: isDrag ? 'rgba(99,179,237,0.06)' : 'var(--bg-2)',
              borderRadius: '10px', padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.2s ease', marginBottom: '20px'
            }}>
            <input ref={fileRef} type="file" accept=".pdf,.txt,.json,.md" onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }} style={{ display: 'none' }} />
            <FileUp size={32} color="var(--cyan)" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-0)', marginBottom: '4px' }}>
              {file ? file.name : 'Drag & drop your threat report'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB — Ready` : 'PDF, TXT, JSON supported'}
            </p>
          </div>
        )}

        {/* Samples mode */}
        {mode === 'samples' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {sampleReports.map(r => (
              <div key={r.id} onClick={() => setSelectedId(r.id)} style={{
                padding: '14px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s ease',
                background: selectedId === r.id ? 'rgba(99,179,237,0.06)' : 'var(--bg-2)',
                border: `1px solid ${selectedId === r.id ? 'rgba(99,179,237,0.3)' : 'var(--border)'}`
              }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                  <span className="tag tag-red">{r.severity}</span>
                  <span className="tag tag-purple">{r.source?.split('/')[0]?.trim()}</span>
                </div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-0)', marginBottom: '4px', lineHeight: '1.3' }}>{r.title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: '1.4' }}>{r.summary?.substring(0, 120)}…</p>
              </div>
            ))}
          </div>
        )}

        {/* Custom text mode */}
        {mode === 'custom' && (
          <textarea rows={8} value={customText} onChange={e => setCustomText(e.target.value)}
            placeholder="Paste unstructured threat intelligence, CISA advisory text, or CVE details…"
            style={{
              width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '7px',
              padding: '12px 14px', color: 'var(--text-0)', fontSize: '0.84rem', fontFamily: 'var(--font-mono)',
              outline: 'none', resize: 'vertical', marginBottom: '20px', lineHeight: '1.5'
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(99,179,237,0.4)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <button className="btn-ghost" onClick={onClose} disabled={isAnalyzing}>Cancel</button>
          <button className="btn-primary" onClick={go} disabled={isAnalyzing || !canGo}>
            {isAnalyzing ? 'Extracting…' : 'Analyze Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
