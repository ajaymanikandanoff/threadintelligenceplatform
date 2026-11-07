import React, { useState, useEffect } from 'react';
import {
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Filter,
  Layers,
  Info,
  ExternalLink,
  Shield,
  Activity,
  CheckCircle2,
  Radio
} from 'lucide-react';
import KnowledgeGraph from '../components/KnowledgeGraph';

const API_BASE = 'http://localhost:8000';

export default function ThreatGraphView({ onAskCopilot }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [], summary: {} });
  const [pdfMeta, setPdfMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchPdfGraph = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const resp = await fetch(`${API_BASE}/api/graph/pdf`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail || 'Failed to fetch PDF threat graph');
      setGraphData(data);
      if (data.pdf_metadata) {
        setPdfMeta(data.pdf_metadata);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfGraph();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Share2 size={18} color="var(--accent)" />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              PDF Research Threat Graph
            </h1>
            {pdfMeta && (
              <span style={{
                background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)',
                color: 'var(--accent)', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px'
              }}>
                Active Dossier
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            {pdfMeta?.indicator ? (
              <span>Correlated threat campaign graph for <strong>{pdfMeta.indicator}</strong></span>
            ) : (
              'Dedicated relational knowledge graph extracted from active PDF cybersecurity threat dossiers.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPdfGraph}
          disabled={isLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '8px 14px', color: 'var(--text-primary)',
            fontSize: '12.5px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          <RotateCcw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh PDF Graph</span>
        </button>
      </div>

      {/* Graph Metrics & Legend Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '12px 18px', flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            Active Entities: <strong style={{ color: 'var(--text-primary)' }}>{graphData.nodes?.length || 0}</strong>
          </span>
          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            Relationships: <strong style={{ color: 'var(--text-primary)' }}>{graphData.edges?.length || 0}</strong>
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {[
            { label: 'Attacker', color: '#f43f5e' },
            { label: 'Malware', color: '#818cf8' },
            { label: 'Domain/URL', color: '#38bdf8' },
            { label: 'IP Infrastructure', color: '#10b981' },
            { label: 'CVE / Vulnerability', color: '#f59e0b' }
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }} />
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Canvas Card */}
      <div style={{
        background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
        borderRadius: '16px', overflow: 'hidden', minHeight: '620px', display: 'flex', flexDirection: 'column'
      }}>
        {isLoading ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '60px' }}>
            <Radio size={32} className="animate-spin" color="var(--accent)" />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Synthesizing Unified Threat Knowledge Graph...</span>
          </div>
        ) : errorMsg ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', color: '#f43f5e' }}>
            {errorMsg}
          </div>
        ) : (
          <KnowledgeGraph graphData={graphData} onAskCopilot={onAskCopilot} />
        )}
      </div>
    </div>
  );
}

