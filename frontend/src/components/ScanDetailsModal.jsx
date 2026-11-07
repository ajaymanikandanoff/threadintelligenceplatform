import React, { useState } from 'react';
import {
  X,
  Shield,
  Clock,
  MapPin,
  Server,
  Lock,
  Layers,
  Copy,
  Check,
  ExternalLink,
  Share2,
  FileDown
} from 'lucide-react';
import KnowledgeGraph from './KnowledgeGraph';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function ScanDetailsModal({ investigation, onClose }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'graph' | 'raw'
  const [hasCopied, setHasCopied] = useState(false);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [recordData, setRecordData] = useState(investigation);

  React.useEffect(() => {
    setRecordData(investigation);
    if (investigation && (!investigation.graph || !investigation.graph.nodes || investigation.graph.nodes.length === 0) && investigation.id) {
      fetch(`${API_BASE}/api/investigations/${investigation.id}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.graph) {
            setRecordData(data);
          }
        })
        .catch(console.error);
    }
  }, [investigation]);

  if (!investigation) return null;

  const current = recordData || investigation;
  const { indicator, type, risk_score, classification, severity, created_at, details } = current;

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(investigation, null, 2));
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const downloadPdf = async () => {
    setIsPdfDownloading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/investigations/${investigation.id}/download-pdf`);
      if (!resp.ok) throw new Error('Failed to generate PDF');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cleanInd = (indicator || investigation.id).replace(/[^a-zA-Z0-9_-]/g, '_');
      a.href = url;
      a.download = `Investigation_${cleanInd}_Dossier.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Could not download investigation PDF: ${err.message}`);
    } finally {
      setIsPdfDownloading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.82)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{
        background: 'var(--bg-glass-card)',
        border: '1px solid var(--border)',
        borderRadius: '18px',
        maxWidth: '960px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--bg-base)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Shield size={18} color="var(--accent)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {indicator}
                </span>
                <span style={{
                  padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800',
                  background: 'var(--accent-dim)', color: 'var(--accent)'
                }}>
                  {type}
                </span>
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                Investigation ID: {investigation.id} | Recorded: {created_at ? created_at.split('T')[0] : 'Today'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={downloadPdf}
              disabled={isPdfDownloading}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, var(--accent) 100%)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                color: '#06090f',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: isPdfDownloading ? 'not-allowed' : 'pointer',
                opacity: isPdfDownloading ? 0.75 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Download formal PDF investigation dossier"
            >
              <FileDown size={14} />
              <span>{isPdfDownloading ? 'Generating...' : 'PDF Dossier'}</span>
            </button>

            <button
              type="button"
              onClick={copyJson}
              style={{
                background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                borderRadius: '6px', padding: '6px 12px', color: 'var(--text-secondary)',
                fontSize: '11.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              {hasCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{hasCopied ? 'Copied' : 'JSON'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex', gap: '8px', padding: '12px 24px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-glass)'
        }}>
          {[
            { id: 'overview', label: 'Investigation Overview' },
            { id: 'graph', label: 'Knowledge Graph' },
            { id: 'raw', label: 'Technical Telemetry' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                border: activeTab === tab.id ? '1px solid var(--border-accent)' : '1px solid transparent',
                background: activeTab === tab.id ? 'var(--accent-dim)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {activeTab === 'overview' && (
            <>
              {/* Summary Banner */}
              <div style={{
                background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    Threat Assessment
                  </span>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {classification}
                  </div>
                </div>

                <div style={{
                  padding: '8px 16px', borderRadius: '8px', fontSize: '16px', fontWeight: '900',
                  background: risk_score >= 70 ? 'rgba(244, 63, 94, 0.15)' : risk_score >= 30 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: risk_score >= 70 ? '#f43f5e' : risk_score >= 30 ? '#f59e0b' : '#10b981',
                  border: `1px solid ${risk_score >= 70 ? 'rgba(244, 63, 94, 0.3)' : risk_score >= 30 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                }}>
                  {risk_score} / 100
                </div>
              </div>

              {/* Evidence */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 10px' }}>
                  Correlated Evidence
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(details?.evidence || [details?.summary || 'No detailed evidence recorded']).map((ev, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', marginTop: '6px', flexShrink: 0 }} />
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {details?.recommended_actions && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 10px' }}>
                    Recommended Containment Actions
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {details.recommended_actions.map((act, i) => (
                      <div key={i} style={{ background: 'var(--bg-overlay)', padding: '8px 12px', borderRadius: '6px', fontSize: '12.5px', color: 'var(--text-primary)' }}>
                        {i + 1}. {act}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'graph' && (
            <div style={{ height: '480px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              {current.graph && current.graph.nodes?.length > 0 ? (
                <KnowledgeGraph graphData={current.graph} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
                  No graph generated for this record.
                </div>
              )}
            </div>
          )}

          {activeTab === 'raw' && (
            <pre style={{
              background: '#040711', padding: '16px', borderRadius: '8px',
              color: '#38bdf8', fontSize: '11.5px', fontFamily: 'monospace',
              overflowX: 'auto', maxHeight: '440px', margin: 0
            }}>
              {JSON.stringify(details || investigation, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

