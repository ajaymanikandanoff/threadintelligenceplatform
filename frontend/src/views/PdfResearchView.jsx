import React, { useState } from 'react';
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
  FileCode
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function PdfResearchView({ onSelectIndicator }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [researchResult, setResearchResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeIocTab, setActiveIocTab] = useState('ipv4');
  const [hasCopied, setHasCopied] = useState(false);

  const sampleReports = [
    { name: 'Volt_Typhoon_Advisory_Critical_Infra.pdf', path: 'Volt Typhoon Cyber Espionage (CISA Advisory)' },
    { name: 'CISA_AA23-158A_CL0P_MOVEit.pdf', path: 'CL0P Ransomware MOVEit Exploit (CISA AA23-158A)' }
  ];

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

  const exportStixBundle = () => {
    if (!researchResult) return;
    const stixBundle = {
      type: "bundle",
      id: `bundle--${Math.random().toString(36).substring(2)}`,
      spec_version: "2.1",
      objects: [
        {
          type: "report",
          id: `report--${Math.random().toString(36).substring(2)}`,
          name: researchResult.filename,
          description: researchResult.executive_summary,
          published: new Date().toISOString(),
          object_refs: []
        }
      ]
    };
    const blob = new Blob([JSON.stringify(stixBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${researchResult.filename.replace('.pdf', '')}_STIX21.json`;
    a.click();
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

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={exportStixBundle}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, var(--accent) 100%)',
                color: '#06090f', border: 'none',
                borderRadius: '8px', padding: '9px 18px', fontSize: '12.5px', fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Download size={15} />
              <span>Export STIX 2.1 Bundle</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
