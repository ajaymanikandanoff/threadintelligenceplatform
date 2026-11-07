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

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function ThreatGraphView({ onAskCopilot }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [], summary: {} });
  const [pdfMeta, setPdfMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchPdfGraph = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    let data = null;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2800);
      const resp = await fetch(`${API_BASE}/api/graph/pdf`, { signal: controller.signal });
      clearTimeout(timeout);
      if (resp.ok) {
        data = await resp.json();
      }
    } catch {
      // Backend offline
    }

    if (!data) {
      data = {
        nodes: [
          { id: 'node-apt28', label: 'APT28 (Fancy Bear)', type: 'actor', severity: 'critical', confidence: 95, details: 'State-sponsored cyber espionage adversary.' },
          { id: 'node-t1566', label: 'T1566.001 (Spearphishing)', type: 'technique', severity: 'high', confidence: 90, details: 'Initial access via weaponized PDF/DOC attachments.' },
          { id: 'node-t1059', label: 'T1059.001 (PowerShell)', type: 'technique', severity: 'high', confidence: 92, details: 'In-memory execution of second-stage payloads.' },
          { id: 'node-cve', label: 'CVE-2024-21413 (Moniker Link)', type: 'vulnerability', severity: 'critical', confidence: 98, details: 'Microsoft Outlook NTLM credential leak vulnerability.' },
          { id: 'node-c2', label: '185.220.101.5 (C2 Server)', type: 'ip', severity: 'critical', confidence: 94, details: 'Command and control listener host.' },
          { id: 'node-domain', label: 'outlook-security-update.net', type: 'domain', severity: 'critical', confidence: 90, details: 'Credential harvesting domain.' }
        ],
        edges: [
          { id: 'e1', source: 'node-apt28', target: 'node-t1566', relationship: 'uses_technique', label: 'Initial Access' },
          { id: 'e2', source: 'node-t1566', target: 'node-cve', relationship: 'exploits_cve', label: 'Exploits' },
          { id: 'e3', source: 'node-t1566', target: 'node-t1059', relationship: 'triggers_execution', label: 'Executes' },
          { id: 'e4', source: 'node-t1059', target: 'node-c2', relationship: 'connects_to_c2', label: 'C2 Beacon' },
          { id: 'e5', source: 'node-apt28', target: 'node-domain', relationship: 'operates_domain', label: 'Deploys' }
        ],
        summary: {
          total_nodes: 6,
          total_edges: 5,
          primary_entity: 'APT28 Threat Campaign'
        },
        pdf_metadata: {
          title: 'APT28 Lateral Espionage & Moniker Vulnerability Advisory.pdf',
          analyst: 'ThreatLens SOC Team',
          classification: 'High-Impact Threat Advisory'
        }
      };
    }

    setGraphData(data);
    if (data.pdf_metadata) {
      setPdfMeta(data.pdf_metadata);
    }
    setIsLoading(false);
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

