import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Download,
  Terminal,
  Crosshair,
  Bug,
  Radio,
  FileCode,
  Printer,
  FileDown,
  RotateCcw,
  FolderOpen,
  Trash2,
  Clock
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function PdfResearchView({ onSelectIndicator }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [researchResult, setResearchResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeIocTab, setActiveIocTab] = useState('ipv4');
  const [hasCopied, setHasCopied] = useState(false);
  const [savedPdfReports, setSavedPdfReports] = useState([]);
  const fileInputRef = useRef(null);

  const sampleReports = [
    { name: 'Volt_Typhoon_Advisory_Critical_Infra.pdf', path: 'Volt Typhoon Cyber Espionage (CISA Advisory)' },
    { name: 'CISA_AA23-158A_CL0P_MOVEit.pdf', path: 'CL0P Ransomware MOVEit Exploit (CISA AA23-158A)' }
  ];

  // Load saved PDF reports from localStorage and backend on mount
  useEffect(() => {
    loadSavedReports();
  }, []);

  const loadSavedReports = async () => {
    // 1. Read from localStorage
    let localList = [];
    try {
      localList = JSON.parse(localStorage.getItem('THREATLENS_SAVED_PDF_REPORTS') || '[]');
    } catch {}

    // 2. Fetch from backend investigations
    try {
      const resp = await fetch(`${API_BASE}/api/investigations?type=PDF&limit=20`);
      if (resp.ok) {
        const data = await resp.json();
        const serverPdfs = (data.investigations || []).map(inv => ({
          id: inv.id,
          filename: inv.details?.filename || inv.indicator || 'Threat_Report.pdf',
          risk_score: inv.risk_score,
          severity: inv.severity,
          executive_summary: inv.details?.executive_summary || inv.classification,
          total_pages: inv.details?.total_pages || 1,
          ioc_count: Object.values(inv.details?.ioc_summary_count || {}).reduce((a, b) => a + b, 0),
          mitre_count: (inv.details?.mitre_mappings || []).length,
          savedAt: inv.created_at,
          fullResult: inv.details || inv
        }));

        // Merge and deduplicate by filename
        const mergedMap = new Map();
        localList.forEach(item => mergedMap.set(item.filename, item));
        serverPdfs.forEach(item => mergedMap.set(item.filename, item));
        const merged = Array.from(mergedMap.values());
        setSavedPdfReports(merged);
        localStorage.setItem('THREATLENS_SAVED_PDF_REPORTS', JSON.stringify(merged));
        return;
      }
    } catch (err) {
      console.warn('Backend PDF fetch fallback:', err);
    }
    setSavedPdfReports(localList);
  };

  const saveReportToHistory = (result) => {
    try {
      const existing = JSON.parse(localStorage.getItem('THREATLENS_SAVED_PDF_REPORTS') || '[]');
      const newEntry = {
        id: result.investigation_id || `pdf-${Date.now()}`,
        filename: result.filename,
        risk_score: result.risk_score,
        severity: result.severity,
        executive_summary: result.executive_summary,
        total_pages: result.total_pages,
        total_characters: result.total_characters,
        ioc_count: Object.values(result.ioc_summary_count || {}).reduce((a, b) => a + b, 0),
        mitre_count: (result.mitre_mappings || []).length,
        savedAt: new Date().toISOString(),
        fullResult: result
      };
      const filtered = existing.filter(item => item.filename !== result.filename);
      const updated = [newEntry, ...filtered].slice(0, 20);
      localStorage.setItem('THREATLENS_SAVED_PDF_REPORTS', JSON.stringify(updated));
      setSavedPdfReports(updated);
    } catch (err) {
      console.warn('Could not save PDF report to localStorage:', err);
    }
  };

  const handleDeleteSavedPdf = async (e, reportId, filename) => {
    e.stopPropagation();
    if (!window.confirm(`Permanently remove "${filename}" from saved reports history?`)) return;

    // 1. Remove from localStorage
    const existing = JSON.parse(localStorage.getItem('THREATLENS_SAVED_PDF_REPORTS') || '[]');
    const updated = existing.filter(r => r.id !== reportId && r.filename !== filename);
    localStorage.setItem('THREATLENS_SAVED_PDF_REPORTS', JSON.stringify(updated));
    setSavedPdfReports(updated);

    // 2. Remove from backend database
    if (reportId && !reportId.startsWith('pdf-')) {
      try {
        await fetch(`${API_BASE}/api/investigations/${reportId}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Backend delete error:', err);
      }
    }

    // 3. Clear current view if it was showing this file
    if (researchResult && researchResult.filename === filename) {
      setResearchResult(null);
      setSelectedFile(null);
    }
  };

  const handleLoadSavedPdf = (report) => {
    if (report.fullResult) {
      setResearchResult(report.fullResult);
      setSelectedFile({ name: report.filename });
      setErrorMsg(null);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsLoading(true);
    setErrorMsg(null);
    setResearchResult(null);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('user_email', 'analyst@threatlens.io');

    try {
      const resp = await fetch(`${API_BASE}/api/research/pdf`, {
        method: 'POST',
        body: fd
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.detail || 'PDF processing failed');
      }
      setResearchResult(data);
      saveReportToHistory(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = async (sampleName) => {
    setIsLoading(true);
    setErrorMsg(null);
    setResearchResult(null);

    try {
      // In sample data endpoint, sample report content is available
      const resp = await fetch(`${API_BASE}/api/sample-reports`);
      const data = await resp.json();
      const match = data.reports?.find(r => r.title.toLowerCase().includes(sampleName.toLowerCase().split('_')[0])) || data.reports?.[0];
      
      // Convert to dummy blob if needed, or directly analyze
      if (match) {
        const textBlob = new Blob([match.content], { type: 'application/pdf' });
        const dummyFile = new File([textBlob], sampleName, { type: 'application/pdf' });
        await handleFileUpload(dummyFile);
      }
    } catch (err) {
      setErrorMsg(`Failed to load sample: ${err.message}`);
      setIsLoading(false);
    }
  };

  // 1. Download Real PDF Binary generated by ReportLab
  const downloadRealPdfReport = async () => {
    if (!researchResult) return;
    setIsPdfDownloading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/research/download-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(researchResult)
      });
      if (!resp.ok) throw new Error('PDF generation failed on server');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cleanName = (researchResult.filename || 'Threat_Report').replace('.pdf', '').replace(/\s+/g, '_');
      a.href = url;
      a.download = `${cleanName}_CTI_Dossier.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Could not download PDF report: ${err.message}`);
    } finally {
      setIsPdfDownloading(false);
    }
  };

  // 2. Download Executive Briefing in Markdown (.md)
  const downloadMarkdownReport = () => {
    if (!researchResult) return;
    const nowStr = new Date().toUTCString();
    let md = `# CYBER THREAT INTELLIGENCE ADVISORY DOSSIER\n`;
    md += `**Target:** ${researchResult.filename}\n`;
    md += `**Date:** ${nowStr} | **TLP:** AMBER | **Risk Score:** ${researchResult.risk_score}/100 (${researchResult.severity})\n\n`;
    md += `## 1. Executive Intelligence Summary\n${researchResult.executive_summary}\n\n`;

    if (researchResult.threat_actors?.length > 0) {
      md += `## 2. Threat Actor Attribution\n`;
      researchResult.threat_actors.forEach(a => {
        md += `- **${a.name}** (${a.origin || 'Undetermined'} - ${a.confidence}% confidence)\n  *Evidence:* "${a.evidence}"\n`;
      });
      md += `\n`;
    }

    if (researchResult.malware_families?.length > 0) {
      md += `## 3. Malware Tooling & Payloads\n`;
      researchResult.malware_families.forEach(m => {
        md += `- **${m.name}** [${m.category}]: ${m.description}\n  *Evidence:* "${m.evidence}"\n`;
      });
      md += `\n`;
    }

    if (researchResult.mitre_mappings?.length > 0) {
      md += `## 4. MITRE ATT&CK Behavioral Technique Mapping\n`;
      researchResult.mitre_mappings.forEach(t => {
        md += `- **[${t.id}] ${t.name}** (${t.tactic}) - ${t.type} (${t.confidence}%)\n  ${t.description}\n  *Evidence:* "${t.evidence}"\n`;
      });
      md += `\n`;
    }

    md += `## 5. Extracted Indicators of Compromise (IoCs)\n`;
    const iocs = researchResult.iocs || {};
    (iocs.ipv4 || []).forEach(i => md += `- IPv4: \`${i.value}\` (Page ${i.page || 1})\n`);
    (iocs.domains || []).forEach(d => md += `- Domain: \`${d.value}\` (Page ${d.page || 1})\n`);
    (iocs.urls || []).forEach(u => md += `- URL: \`${u.value}\` (Page ${u.page || 1})\n`);
    const shaList = iocs.hashes?.sha256 || [];
    shaList.forEach(h => md += `- SHA-256: \`${h.value}\` (Page ${h.page || 1})\n`);
    (iocs.cves || []).forEach(c => md += `- CVE: \`${c.value}\` (Page ${c.page || 1})\n`);

    md += `\n## 6. Strategic Containment & Defensive Actions\n`;
    (researchResult.recommended_actions || []).forEach((act, idx) => {
      md += `${idx + 1}. ${act}\n`;
    });
    md += `\n---\n*Produced by AI ThreatLens Cyber Threat Intelligence & TTPMapper Engine*\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(researchResult.filename || 'threat_report').replace('.pdf', '')}_Briefing.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 3. Download Full Technical JSON Forensics
  const downloadJsonReport = () => {
    if (!researchResult) return;
    const blob = new Blob([JSON.stringify(researchResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(researchResult.filename || 'threat_report').replace('.pdf', '')}_Forensics.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 4. Export OASIS STIX 2.1 Bundle
  const exportStixBundle = () => {
    if (!researchResult) return;
    const now = new Date().toISOString();
    const bundleObjects = [];

    // Report SDO
    bundleObjects.push({
      type: "report",
      spec_version: "2.1",
      id: `report--${Math.random().toString(36).substring(2)}`,
      name: researchResult.filename,
      description: researchResult.executive_summary,
      published: now,
      object_refs: []
    });

    // Threat Actors
    (researchResult.threat_actors || []).forEach(a => {
      bundleObjects.push({
        type: "threat-actor",
        spec_version: "2.1",
        id: `threat-actor--${Math.random().toString(36).substring(2)}`,
        name: a.name,
        aliases: a.aliases || [],
        goals: a.target_sectors || [],
        description: a.evidence || ""
      });
    });

    // MITRE Attack Patterns
    (researchResult.mitre_mappings || []).forEach(t => {
      bundleObjects.push({
        type: "attack-pattern",
        spec_version: "2.1",
        id: `attack-pattern--${Math.random().toString(36).substring(2)}`,
        name: t.name,
        description: t.description || "",
        external_references: [{
          source_name: "mitre-attack",
          external_id: t.id,
          url: `https://attack.mitre.org/techniques/${t.id.replace('.', '/')}`
        }]
      });
    });

    // IOC Indicators
    const iocs = researchResult.iocs || {};
    (iocs.ipv4 || []).forEach(ip => {
      bundleObjects.push({
        type: "indicator",
        spec_version: "2.1",
        id: `indicator--${Math.random().toString(36).substring(2)}`,
        name: `IP Address: ${ip.value}`,
        pattern: `[ipv4-addr:value = '${ip.value}']`,
        pattern_type: "stix"
      });
    });

    const stixBundle = {
      type: "bundle",
      id: `bundle--${Math.random().toString(36).substring(2)}`,
      spec_version: "2.1",
      objects: bundleObjects
    };

    const blob = new Blob([JSON.stringify(stixBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(researchResult.filename || 'threat_report').replace('.pdf', '')}_STIX21.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 5. Browser Print / Print to PDF
  const handlePrint = () => {
    window.print();
  };

  // 6. Deselect / Clear loaded report
  const handleDeselectReport = () => {
    setResearchResult(null);
    setSelectedFile(null);
    setErrorMsg(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileText size={18} color="var(--accent)" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            PDF Threat Intelligence Research & MITRE Mapper
          </h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Adapted from TTPMapper: Multi-page IOC extraction, Attacker Behavior extraction, and MITRE ATT&CK technique mapping.
        </p>
      </div>

      {/* Upload Drop Zone Card */}
      <div style={{
        background: 'var(--bg-glass-card)',
        border: '2px dashed var(--border)',
        borderRadius: '16px',
        padding: '36px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        transition: 'border-color 0.15s ease'
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {isLoading ? <Radio size={28} className="animate-spin" color="var(--accent)" /> : <Upload size={28} color="var(--accent)" />}
        </div>

        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>
            {isLoading ? 'Extracting & Mapping Threat Report...' : 'Upload PDF Threat Report'}
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, maxWidth: '520px' }}>
            Drag and drop an advisory or technical threat PDF here. Extract IOCs, correlate threat actors, and map attacker behaviors to MITRE ATT&CK.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          id="pdf-upload-input"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setSelectedFile(e.target.files[0]);
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: '6px' }}>
          <label
            htmlFor="pdf-upload-input"
            style={{
              padding: '9px 20px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, var(--accent) 100%)',
              color: '#06090f', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer'
            }}
          >
            Select PDF File
          </label>

          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>or try sample:</span>

          {sampleReports.map(s => (
            <button
              key={s.name}
              type="button"
              onClick={() => handleSelectSample(s.name)}
              style={{
                background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                borderRadius: '6px', padding: '5px 12px', color: 'var(--text-secondary)',
                fontSize: '11.5px', cursor: 'pointer'
              }}
            >
              {s.name.split('_')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Saved PDF Threat Reports History (Database & Local Storage) */}
      {!researchResult && savedPdfReports.length > 0 && (
        <div style={{
          background: 'var(--bg-glass-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '22px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Clock size={16} color="var(--accent)" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Saved PDF Reports History
                </h3>
                <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                  Stored in database and local storage. Click any report to reload, or delete to purge.
                </span>
              </div>
            </div>

            <span style={{
              fontSize: '11px', fontWeight: '700', color: 'var(--accent)',
              background: 'var(--accent-dim)', padding: '3px 9px', borderRadius: '4px'
            }}>
              {savedPdfReports.length} Reports Archived
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '12px'
          }}>
            {savedPdfReports.map((report) => (
              <div
                key={report.filename}
                onClick={() => handleLoadSavedPdf(report)}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <FileText size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
                    <span style={{
                      fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {report.filename}
                    </span>
                  </div>

                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800',
                    background: report.risk_score >= 80 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: report.risk_score >= 80 ? '#f43f5e' : '#f59e0b',
                    flexShrink: 0
                  }}>
                    {report.risk_score}/100
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  <span>{report.mitre_count || 0} MITRE • {report.ioc_count || 0} IoCs</span>
                  <span>{report.savedAt ? report.savedAt.split('T')[0] : 'Saved'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '600' }}>
                    Click to Open Dossier →
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteSavedPdf(e, report.id, report.filename)}
                    style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      color: '#f43f5e',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Delete this PDF report from history"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '12px',
          padding: '14px 18px',
          color: '#f43f5e',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <AlertTriangle size={20} />
          <span style={{ fontSize: '13px', fontWeight: '600' }}>{errorMsg}</span>
        </div>
      )}

      {/* Results Workspace */}
      {researchResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Top Download & Export Dossier Action Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'var(--bg-glass-card)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: '14px',
            padding: '14px 20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(0, 229, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FileDown size={18} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Threat Intelligence Export Center
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  Download publication-grade PDF dossiers, STIX 2.1 bundles, or executive briefings.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={downloadRealPdfReport}
                disabled={isPdfDownloading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #00e5ff 100%)',
                  color: '#06090f', border: 'none',
                  borderRadius: '8px', padding: '9px 18px', fontSize: '12.5px', fontWeight: '800',
                  cursor: isPdfDownloading ? 'not-allowed' : 'pointer',
                  opacity: isPdfDownloading ? 0.75 : 1,
                  boxShadow: '0 0 20px rgba(0, 229, 255, 0.35)',
                  transition: 'all 0.15s ease'
                }}
                title="Download real formatted PDF threat briefing document"
              >
                <FileDown size={16} />
                <span>{isPdfDownloading ? 'Generating PDF Dossier...' : 'Download Real PDF Report'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', borderRadius: '8px', padding: '8px 14px',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                }}
                title="Print or Save via Browser PDF"
              >
                <Printer size={14} />
                <span>Print / Save PDF</span>
              </button>

              <button
                type="button"
                onClick={exportStixBundle}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', borderRadius: '8px', padding: '8px 14px',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                }}
                title="Export OASIS STIX 2.1 Standard JSON Bundle"
              >
                <Download size={14} />
                <span>STIX 2.1</span>
              </button>

              <button
                type="button"
                onClick={downloadMarkdownReport}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', borderRadius: '8px', padding: '8px 14px',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                }}
                title="Download Executive Markdown Briefing"
              >
                <FileText size={14} />
                <span>Markdown (.md)</span>
              </button>

              <button
                type="button"
                onClick={downloadJsonReport}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', borderRadius: '8px', padding: '8px 14px',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                }}
                title="Download Technical Forensics JSON"
              >
                <FileCode size={14} />
                <span>Technical JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: 'var(--accent)', borderRadius: '8px', padding: '8px 14px',
                  fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                }}
                title="Select and analyze another PDF report from your computer"
              >
                <FolderOpen size={14} />
                <span>Change / Select PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDeselectReport}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#f43f5e', borderRadius: '8px', padding: '8px 14px',
                  fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                }}
                title="Deselect current report and return to upload view"
              >
                <RotateCcw size={14} />
                <span>Deselect Report</span>
              </button>
            </div>
          </div>

          {/* Executive Summary Card */}
          <div style={{
            background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Investigation Dossier Summary
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0 0' }}>
                  {researchResult.filename}
                </h2>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{
                  padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800',
                  background: researchResult.risk_score >= 80 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: researchResult.risk_score >= 80 ? '#f43f5e' : '#f59e0b',
                  border: `1px solid ${researchResult.risk_score >= 80 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                }}>
                  Score: {researchResult.risk_score}/100 ({researchResult.severity})
                </span>
              </div>
            </div>

            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              {researchResult.executive_summary}
            </p>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Total Pages: <strong>{researchResult.total_pages}</strong>
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Total Characters: <strong>{researchResult.total_characters?.toLocaleString()}</strong>
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                OCR Engine Status: <strong>{researchResult.ocr_status}</strong>
              </span>
            </div>
          </div>

          {/* Attributed Threat Actors & Malware Families */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
            {/* Threat Actors */}
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crosshair size={18} color="#f43f5e" />
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Attributed Threat Actors ({researchResult.threat_actors?.length || 0})
                </h3>
              </div>
              {researchResult.threat_actors?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {researchResult.threat_actors.map((actor, i) => (
                    <div key={i} style={{ background: 'var(--bg-overlay)', padding: '12px 14px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>{actor.name}</span>
                        <span style={{ fontSize: '11px', color: '#f43f5e', fontWeight: '700' }}>Confidence: {actor.confidence}%</span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        Origin: {actor.origin} | Sectors: {actor.target_sectors?.join(', ')}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '6px' }}>
                        "{actor.evidence}"
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-tertiary)', fontSize: '12.5px', padding: '14px', textAlign: 'center' }}>
                  No named threat actors explicitly matched in catalog.
                </div>
              )}
            </div>

            {/* Malware Families */}
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bug size={18} color="#818cf8" />
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Malware Tooling & Payloads ({researchResult.malware_families?.length || 0})
                </h3>
              </div>
              {researchResult.malware_families?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {researchResult.malware_families.map((mal, i) => (
                    <div key={i} style={{ background: 'var(--bg-overlay)', padding: '12px 14px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>{mal.name}</span>
                        <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: '700' }}>{mal.category}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {mal.description}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '6px' }}>
                        "{mal.evidence}"
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-tertiary)', fontSize: '12.5px', padding: '14px', textAlign: 'center' }}>
                  No catalogued malware tools recognized in report text.
                </div>
              )}
            </div>
          </div>

          {/* MITRE ATT&CK Mapping Table (Facts vs Inferences) */}
          <div style={{
            background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  MITRE ATT&CK Enterprise Technique Mapping
                </h3>
                <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                  Explicit Report Facts vs AI Behavioral Inferences with page-numbered procedure snippets.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {researchResult.mitre_mappings?.length > 0 ? (
                researchResult.mitre_mappings.map((tech, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', gap: '6px',
                    padding: '12px 16px', background: 'var(--bg-overlay)', borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent)', fontFamily: 'monospace' }}>
                          {tech.id}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {tech.name}
                        </span>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700',
                          background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8'
                        }}>
                          {tech.tactic}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                          background: tech.type === 'Explicit Report Fact' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: tech.type === 'Explicit Report Fact' ? '#10b981' : '#f59e0b',
                          border: `1px solid ${tech.type === 'Explicit Report Fact' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                        }}>
                          {tech.type}
                        </span>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                          {tech.confidence}% Confidence
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {tech.description}
                    </div>

                    <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', fontStyle: 'italic', background: 'var(--bg-base)', padding: '6px 10px', borderRadius: '4px' }}>
                      Evidence: "{tech.evidence}"
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-tertiary)', fontSize: '12.5px', padding: '16px', textAlign: 'center' }}>
                  No MITRE ATT&CK techniques matched in this document.
                </div>
              )}
            </div>
          </div>

          {/* Categorized IOC Table */}
          <div style={{
            background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Extracted Indicators of Compromise (IOCs)
              </h3>
              {/* Category selector */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { key: 'ipv4', label: 'IPv4', count: researchResult.ioc_summary_count?.ipv4 },
                  { key: 'domains', label: 'Domains', count: researchResult.ioc_summary_count?.domains },
                  { key: 'urls', label: 'URLs', count: researchResult.ioc_summary_count?.urls },
                  { key: 'sha256', label: 'SHA-256', count: researchResult.ioc_summary_count?.sha256 },
                  { key: 'cves', label: 'CVEs', count: researchResult.ioc_summary_count?.cves }
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveIocTab(tab.key)}
                    style={{
                      padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600',
                      border: activeIocTab === tab.key ? '1px solid var(--border-accent)' : '1px solid var(--border)',
                      background: activeIocTab === tab.key ? 'var(--accent-dim)' : 'var(--bg-overlay)',
                      color: activeIocTab === tab.key ? 'var(--accent)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {tab.label} ({tab.count || 0})
                  </button>
                ))}
              </div>
            </div>

            {/* IOC List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(() => {
                const list = activeIocTab === 'sha256'
                  ? researchResult.iocs?.hashes?.sha256 || []
                  : researchResult.iocs?.[activeIocTab] || [];

                if (list.length === 0) {
                  return (
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '12.5px', padding: '16px', textAlign: 'center' }}>
                      No {activeIocTab.toUpperCase()} indicators extracted from report.
                    </div>
                  );
                }

                return list.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 14px', background: 'var(--bg-overlay)', borderRadius: '6px',
                    fontFamily: 'monospace', fontSize: '12.5px'
                  }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{item.value}</span>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {item.page && <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>Page {item.page}</span>}
                      <span style={{ fontSize: '10.5px', color: 'var(--accent)', fontWeight: '700' }}>{item.confidence}%</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Action Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border)'
          }}>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              Analysis generated by AI ThreatLens Intelligence Engine & MITRE ATT&CK CTI Pipeline
            </span>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={downloadRealPdfReport}
                disabled={isPdfDownloading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #00e5ff 100%)',
                  color: '#06090f', border: 'none',
                  borderRadius: '8px', padding: '9px 18px', fontSize: '12.5px', fontWeight: '800',
                  cursor: isPdfDownloading ? 'not-allowed' : 'pointer',
                  opacity: isPdfDownloading ? 0.75 : 1,
                  boxShadow: '0 0 20px rgba(0, 229, 255, 0.35)'
                }}
              >
                <FileDown size={15} />
                <span>{isPdfDownloading ? 'Downloading...' : 'Download Real PDF Report'}</span>
              </button>

              <button
                type="button"
                onClick={exportStixBundle}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', borderRadius: '8px', padding: '8px 14px',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                }}
              >
                <Download size={14} />
                <span>STIX 2.1</span>
              </button>

              <button
                type="button"
                onClick={downloadMarkdownReport}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', borderRadius: '8px', padding: '8px 14px',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                }}
              >
                <FileText size={14} />
                <span>Markdown (.md)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

