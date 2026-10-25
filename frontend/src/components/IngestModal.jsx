import React, { useState, useRef } from 'react';
import { X, FileUp, Shield, FileText, ArrowRight, Check } from 'lucide-react';

export default function IngestModal({ isOpen, onClose, sampleReports = [], onAnalyze, onUploadFile, isAnalyzing }) {
  const [mode, setMode] = useState('upload');
  const [selectedId, setSelectedId] = useState(sampleReports[0]?.id || '');
  const [customText, setCustomText] = useState('');
  const [file, setFile] = useState(null);
  const [isDrag, setIsDrag] = useState(false);
  const fileRef = useRef(null);

  if (!isOpen) return null;

  const handleStartAnalysis = () => {
    if (mode === 'upload' && file) {
      onUploadFile(file);
    } else if (mode === 'feeds') {
      const r = sampleReports.find(x => x.id === selectedId) || sampleReports[0];
      if (r) onAnalyze(r.content, r.title);
    } else if (mode === 'custom' && customText.trim()) {
      onAnalyze(customText.trim(), 'Custom Security Incident Report');
    }
  };

  const canAnalyze = mode === 'upload' ? !!file : mode === 'feeds' ? true : !!customText.trim();

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(6,9,15,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="surface"
        style={{
          maxWidth: '640px', width: '100%', padding: '28px',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          border: '1px solid var(--border)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-0)', margin: '0 0 4px 0' }}>
              Analyze a Cyber Threat Report
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: 0 }}>
              Provide any security advisory, incident log, or select an official cyber bulletin to extract threat intelligence.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { id: 'upload', label: '1. Upload PDF / Text', icon: FileUp },
            { id: 'custom', label: '2. Paste Incident Text', icon: FileText },
            { id: 'feeds',  label: '3. Official Cyber Advisories', icon: Shield }
          ].map(m => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: '7px', cursor: 'pointer',
                  background: active ? 'rgba(99,179,237,0.1)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(99,179,237,0.4)' : 'var(--border)'}`,
                  color: active ? 'var(--cyan)' : 'var(--text-3)',
                  fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '0.78rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mode 1: Upload */}
        {mode === 'upload' && (
          <div style={{ marginBottom: '20px' }}>
            <div
              onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
              onDragLeave={e => { e.preventDefault(); setIsDrag(false); }}
              onDrop={e => {
                e.preventDefault();
                setIsDrag(false);
                if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${isDrag ? 'var(--cyan)' : file ? 'var(--green)' : 'rgba(99,179,237,0.3)'}`,
                background: isDrag ? 'rgba(99,179,237,0.08)' : file ? 'rgba(104,211,145,0.06)' : 'var(--bg-2)',
                borderRadius: '10px', padding: '36px 20px', textAlign: 'center', cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,.json,.md"
                onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }}
                style={{ display: 'none' }}
              />
              <FileUp size={36} color={file ? 'var(--green)' : 'var(--cyan)'} strokeWidth={1.6} style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '0.96rem', fontWeight: '600', color: 'var(--text-0)', margin: '0 0 6px 0' }}>
                {file ? file.name : 'Choose a file or drag & drop here'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: 0 }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB — Ready to analyze` : 'Supports CISA advisories, incident PDF reports, or TXT logs (up to 20MB)'}
              </p>
            </div>
          </div>
        )}

        {/* Mode 2: Paste Incident Text */}
        {mode === 'custom' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-2)', marginBottom: '8px' }}>
              Paste Raw Security Incident or Advisory Text:
            </label>
            <textarea
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="Paste security bulletin, firewall logs, email notification, or threat writeup..."
              rows={8}
              style={{
                width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '12px 14px', color: 'var(--text-0)',
                fontSize: '0.82rem', fontFamily: 'var(--font-mono)', outline: 'none', resize: 'vertical'
              }}
            />
          </div>
        )}

        {/* Mode 3: Official Feeds */}
        {mode === 'feeds' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-3)', marginBottom: '4px' }}>
              Select an official government advisory to analyze:
            </div>
            {sampleReports.map(rep => {
              const isSelected = selectedId === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedId(rep.id)}
                  style={{
                    padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                    background: isSelected ? 'rgba(99,179,237,0.08)' : 'var(--bg-2)',
                    border: `1px solid ${isSelected ? 'var(--cyan)' : 'var(--border)'}`,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: '700', color: isSelected ? 'var(--cyan)' : 'var(--text-0)' }}>
                      {rep.title}
                    </span>
                    <span className="tag tag-red" style={{ fontSize: '0.65rem' }}>{rep.severity || 'CRITICAL'}</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-3)', lineHeight: '1.4' }}>
                    Source: {rep.source} ({rep.date})
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '8px 16px' }}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleStartAnalysis}
            disabled={!canAnalyze || isAnalyzing}
            style={{
              padding: '8px 20px',
              opacity: canAnalyze ? 1 : 0.5,
              cursor: canAnalyze ? 'pointer' : 'not-allowed'
            }}
          >
            {isAnalyzing ? (
              <span>Analyzing Threat...</span>
            ) : (
              <>
                <span>Extract Threat Intelligence</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
