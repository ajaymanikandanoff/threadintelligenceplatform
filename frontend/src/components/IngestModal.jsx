import React, { useState, useRef } from 'react';
import { X, FileText, Upload, Sparkles, Check, AlertCircle, FileUp, Shield, FileCheck } from 'lucide-react';

export default function IngestModal({ 
  isOpen, 
  onClose, 
  sampleReports = [], 
  onAnalyze, 
  onUploadFile,
  isAnalyzing 
}) {
  const [activeMode, setActiveMode] = useState('upload'); // 'upload', 'samples', or 'custom'
  const [selectedSampleId, setSelectedSampleId] = useState(sampleReports[0]?.id || '');
  const [customText, setCustomText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartAnalysis = () => {
    if (activeMode === 'upload') {
      if (!selectedFile) return;
      onUploadFile(selectedFile);
    } else if (activeMode === 'samples') {
      const report = sampleReports.find(r => r.id === selectedSampleId) || sampleReports[0];
      if (report) {
        onAnalyze(report.content, report.title);
      }
    } else {
      if (!customText.trim()) return;
      onAnalyze(customText.trim(), "Custom Threat Advisory Ingestion");
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 8, 17, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }} onClick={onClose}>
      <div 
        className="cyber-card" 
        style={{ 
          maxWidth: '720px', 
          width: '100%', 
          padding: '28px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 70px rgba(0,0,0,0.9)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <FileUp size={22} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff' }}>
                Ingest Threat Intelligence Document
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Upload real security PDF advisories, select pre-loaded CISA reports, or paste raw intelligence feeds.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
          <button
            onClick={() => setActiveMode('upload')}
            className={activeMode === 'upload' ? 'cyber-btn-primary' : 'cyber-btn-secondary'}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <FileUp size={15} />
            <span>Upload PDF File</span>
          </button>
          <button
            onClick={() => setActiveMode('samples')}
            className={activeMode === 'samples' ? 'cyber-btn-primary' : 'cyber-btn-secondary'}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Sparkles size={15} />
            <span>Pre-Loaded CISA Intel</span>
          </button>
          <button
            onClick={() => setActiveMode('custom')}
            className={activeMode === 'custom' ? 'cyber-btn-primary' : 'cyber-btn-secondary'}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <FileText size={15} />
            <span>Paste Raw Text</span>
          </button>
        </div>

        {/* Mode 1: Drag & Drop Real PDF */}
        {activeMode === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? 'var(--accent-cyan)' : 'rgba(0, 240, 255, 0.3)'}`,
                background: isDragging ? 'rgba(0, 240, 255, 0.1)' : 'rgba(15, 23, 42, 0.5)',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.json,.md"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(0, 240, 255, 0.12)',
                border: '1px solid var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)'
              }}>
                <FileUp size={26} color="var(--accent-cyan)" />
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                  {selectedFile ? selectedFile.name : 'Drag & Drop your Threat PDF here'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedFile 
                    ? `Size: ${(selectedFile.size / 1024).toFixed(1)} KB — Ready to extract`
                    : 'Supports PDF advisories, CISA alerts, CVE documents, or TXT feeds'}
                </p>
              </div>

              <button
                type="button"
                className="cyber-btn-secondary"
                style={{ marginTop: '6px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse From Computer
              </button>
            </div>

            {/* Note about sample PDFs on disk */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>
                📁 <strong>Tip:</strong> We generated sample test PDFs in your project folder at <code>threat-intel-platform/sample_pdfs/</code>
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>READY</span>
            </div>
          </div>
        )}

        {/* Mode 2: Pre-loaded Samples */}
        {activeMode === 'samples' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {sampleReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedSampleId(report.id)}
                style={{
                  background: selectedSampleId === report.id ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${selectedSampleId === report.id ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-red">{report.severity}</span>
                    <span className="badge badge-purple">{report.source}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {report.date}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                  {report.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {report.summary}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Mode 3: Custom Text */}
        {activeMode === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Paste unformatted threat intelligence, incident notes, malware reports, or CVE details:
            </p>
            <textarea
              rows={9}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste raw threat advisory, CISA report, or hacker forum dump here..."
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#fff',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
                resize: 'vertical'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-cyan)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
            />
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <button className="cyber-btn-secondary" onClick={onClose} disabled={isAnalyzing}>
            Cancel
          </button>
          <button 
            className="cyber-btn-primary" 
            onClick={handleStartAnalysis} 
            disabled={
              isAnalyzing || 
              (activeMode === 'upload' && !selectedFile) ||
              (activeMode === 'custom' && !customText.trim())
            }
          >
            {isAnalyzing ? 'Extracting Intelligence...' : 'Run Autonomous Extraction'}
          </button>
        </div>
      </div>
    </div>
  );
}
