import React, { useState, useEffect } from 'react';
import {
  Link2,
  Terminal,
  Globe,
  Search,
  RefreshCw,
  FileText,
  FileSearch,
  ShieldCheck,
  Download,
  Activity,
  Share2
} from 'lucide-react';
import KnowledgeGraph from '../components/KnowledgeGraph';
import { getStoredInvestigations } from '../services/clientScannerService';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function ThreatIntelligenceView({
  onNavigateTab,
  onOpenReport
}) {
  const [investigations, setInvestigations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All types');
  const [filterSeverity, setFilterSeverity] = useState('Any severity');
  const [activeItemGraph, setActiveItemGraph] = useState(null);

  const fetchScannedIndicators = async () => {
    setIsLoading(true);
    let rawList = [];
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2800);
      const resp = await fetch(`${API_BASE}/api/investigations?limit=100`, { signal: controller.signal });
      clearTimeout(timeout);
      const data = await resp.json();
      if (resp.ok && Array.isArray(data.investigations) && data.investigations.length > 0) {
        rawList = data.investigations;
      }
    } catch {
      // Backend offline
    }

    if (rawList.length === 0) {
      rawList = getStoredInvestigations();
    }

    const mapped = rawList.map(item => {
      const typeStr = (item.type || 'Indicator').toUpperCase();
      const score = item.risk_score ?? 0;
      let sev = 'safe';
      if (score >= 85) sev = 'critical';
      else if (score >= 70) sev = 'high';
      else if (score >= 40) sev = 'medium';

      return {
        id: item.id,
        indicator: item.indicator,
        type: typeStr.includes('IP') ? 'IP' : typeStr.includes('URL') ? 'URL' : typeStr.includes('DOMAIN') ? 'Domain' : 'PDF',
        category: item.classification || item.details?.classification || 'Analyzed Target',
        severity: sev,
        score: score,
        firstSeen: item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent Scan',
        detections: item.details?.detections || (item.details?.risk_factors?.length ? `${item.details.risk_factors.length} flagged checks` : 'Telemetry Verified'),
        source: item.analyst || 'Analyst Scan',
        raw: item
      };
    });
    setInvestigations(mapped);
    if (mapped.length > 0 && !selectedId) {
      setSelectedId(mapped[0].id);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchScannedIndicators();
  }, []);

  const selectedItem = investigations.find(x => x.id === selectedId) || investigations[0] || null;

  useEffect(() => {
    if (!selectedItem) {
      setActiveItemGraph(null);
      return;
    }
    const directGraph = selectedItem.raw?.graph || selectedItem.graph;
    if (directGraph && directGraph.nodes && directGraph.nodes.length > 0) {
      setActiveItemGraph(directGraph);
    } else if (selectedItem.id) {
      fetch(`${API_BASE}/api/investigations/${selectedItem.id}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.graph) {
            setActiveItemGraph(data.graph);
          }
        })
        .catch(console.error);
    }
  }, [selectedItem?.id]);

  const filteredIndicators = investigations.filter(item => {
    if (filterType !== 'All types') {
      if (item.type.toLowerCase() !== filterType.toLowerCase()) return false;
    }
    if (filterSeverity !== 'Any severity') {
      if (item.severity.toLowerCase() !== filterSeverity.toLowerCase()) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.indicator.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'critical':
        return { bg: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.25)', dot: '#f43f5e' };
      case 'high':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)', dot: '#f59e0b' };
      case 'medium':
        return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.25)', dot: '#eab308' };
      case 'safe':
      default:
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)', dot: '#10b981' };
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return '#f43f5e';
    if (score >= 70) return '#f97316';
    if (score >= 50) return '#eab308';
    return '#10b981';
  };

  const renderTypeIcon = (type, sev) => {
    const isCrit = sev === 'critical';
    const isSafe = sev === 'safe';
    const color = isCrit ? '#f43f5e' : isSafe ? '#10b981' : '#f59e0b';
    const bg = isCrit ? 'rgba(244, 63, 94, 0.15)' : isSafe ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)';

    return (
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: bg, border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        {type === 'URL' && <Link2 size={16} color={color} />}
        {type === 'IP' && <Terminal size={16} color={color} />}
        {type === 'Domain' && <Globe size={16} color={color} />}
        {type === 'PDF' && <FileSearch size={16} color={color} />}
      </div>
    );
  };

  const handleReanalyze = (item) => {
    if (!item) return;
    if (item.type === 'IP') {
      onNavigateTab('ip-scanner', { ip: item.indicator });
    } else if (item.type === 'Domain') {
      onNavigateTab('domain-scanner', { domain: item.indicator });
    } else if (item.type === 'URL') {
      onNavigateTab('url-scanner', { url: item.indicator });
    } else if (item.type === 'PDF') {
      onNavigateTab('pdf-research');
    } else {
      onNavigateTab('analyzer', { indicator: item.indicator, type: item.type });
    }
  };

  const handleDownloadPdf = (invId) => {
    if (!invId) return;
    window.open(`${API_BASE}/api/investigations/${invId}/download-pdf`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ─── Page Title ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Threat Intelligence
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Explore verified indicators, categories and detection telemetry from your active investigations.
          </p>
        </div>

        <button
          onClick={fetchScannedIndicators}
          disabled={isLoading}
          style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            borderRadius: '10px',
            padding: '8px 16px',
            fontSize: '12.5px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-accent)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '14px',
        background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '12px 18px'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-input)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '8px 14px', minWidth: '320px', flex: '1 1 300px'
        }}>
          <Search size={14} color="var(--text-tertiary)" />
          <input
            type="text"
            placeholder="Search indicator, category or source"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '13px', width: '100%'
            }}
          />
        </div>

        {/* Type & Severity Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Type Pills */}
          <div style={{ display: 'flex', background: 'var(--bg-overlay)', borderRadius: '6px', padding: '3px', border: '1px solid var(--border)' }}>
            {['All types', 'URL', 'IP', 'Domain'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  background: filterType === t ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                  color: filterType === t ? 'var(--accent)' : 'var(--text-tertiary)',
                  outline: filterType === t ? '1px solid rgba(56, 189, 248, 0.4)' : 'none',
                  transition: 'all 0.12s ease'
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Severity Pills */}
          <div style={{ display: 'flex', background: 'var(--bg-overlay)', borderRadius: '6px', padding: '3px', border: '1px solid var(--border)' }}>
            {['Any severity', 'Critical', 'High', 'Safe'].map(s => (
              <button
                key={s}
                onClick={() => setFilterSeverity(s)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  background: filterSeverity === s ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                  color: filterSeverity === s ? 'var(--accent)' : 'var(--text-tertiary)',
                  outline: filterSeverity === s ? '1px solid rgba(56, 189, 248, 0.4)' : 'none',
                  transition: 'all 0.12s ease'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Content Area: If Empty State vs Two-Column Layout ─── */}
      {filteredIndicators.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '64px 24px', background: 'var(--bg-glass-card)', borderRadius: '16px',
          border: '1px dashed var(--border)', textAlign: 'center', gap: '14px'
        }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Globe size={26} color="var(--accent)" />
          </div>

          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              No Scanned Threat Indicators Found
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '6px auto 0' }}>
              Only indicators that you actively scan will appear here. Run an IP scan, domain lookup, or URL crawl from the sidebar to populate verified threat intelligence.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
            <button
              onClick={() => onNavigateTab('ip-scanner')}
              style={{
                padding: '9px 18px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700',
                background: 'var(--bg-overlay)', border: '1px solid var(--border)', color: 'var(--text-primary)',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Terminal size={14} color="var(--accent)" />
              <span>Scan an IP</span>
            </button>
            <button
              onClick={() => onNavigateTab('domain-scanner')}
              style={{
                padding: '9px 18px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700',
                background: 'var(--bg-overlay)', border: '1px solid var(--border)', color: 'var(--text-primary)',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Globe size={14} color="var(--accent)" />
              <span>Scan a Domain</span>
            </button>
            <button
              onClick={() => onNavigateTab('url-scanner')}
              style={{
                padding: '9px 18px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700',
                background: 'var(--bg-overlay)', border: '1px solid var(--border)', color: 'var(--text-primary)',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Link2 size={14} color="var(--accent)" />
              <span>Scan a URL</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)',
          gap: '20px'
        }}>
          {/* Left Column: Indicator Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredIndicators.map(item => {
              const isSelected = item.id === selectedId;
              const sevStyle = getSeverityStyle(item.severity);
              const scoreColor = getScoreColor(item.score);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  style={{
                    background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-glass-card)',
                    border: isSelected ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 20px rgba(56, 189, 248, 0.12)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
                      e.currentTarget.style.background = 'var(--bg-hover)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'var(--bg-glass-card)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                    {renderTypeIcon(item.type, item.severity)}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.indicator}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                        {item.type} · {item.category}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: sevStyle.bg, border: sevStyle.border, color: sevStyle.color,
                      padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: '700'
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sevStyle.dot }} />
                      {item.severity}
                    </span>

                    <span style={{
                      fontSize: '22px',
                      fontWeight: '800',
                      fontFamily: 'var(--font-mono)',
                      color: scoreColor,
                      minWidth: '32px',
                      textAlign: 'right'
                    }}>
                      {item.score}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Intelligence Drawer */}
          {selectedItem && (
            <div style={{
              background: 'var(--bg-glass-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px 26px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              height: 'fit-content',
              position: 'sticky',
              top: '80px'
            }}>
              {/* Subheading & Title */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
                  {selectedItem.type} INTELLIGENCE
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginTop: '6px',
                  wordBreak: 'break-all'
                }}>
                  {selectedItem.indicator}
                </div>
              </div>

              {/* Score & Risk Banner */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '42px', fontWeight: '900', color: getScoreColor(selectedItem.score), lineHeight: 1 }}>
                    {selectedItem.score}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    risk score · {selectedItem.severity}
                  </span>
                </div>

                {/* Score Progress Bar */}
                <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(0, selectedItem.score))}%`,
                    height: '100%',
                    borderRadius: '3px',
                    background: getScoreColor(selectedItem.score)
                  }} />
                </div>
              </div>

              {/* Individual Entity Threat Graph */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Share2 size={12} color="var(--accent)" />
                    <span>Entity Threat Graph</span>
                  </span>
                  {activeItemGraph?.nodes?.length > 0 && (
                    <span style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                      {activeItemGraph.nodes.length} nodes · {activeItemGraph.edges.length} edges
                    </span>
                  )}
                </div>

                <div style={{
                  height: '260px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-base)',
                  position: 'relative'
                }}>
                  {activeItemGraph && activeItemGraph.nodes?.length > 0 ? (
                    <KnowledgeGraph graphData={activeItemGraph} compact={true} height="260px" />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                      Synthesizing entity relationship graph...
                    </div>
                  )}
                </div>

                {selectedItem.type === 'PDF' && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('threat-graph')}
                    style={{
                      background: 'rgba(56, 189, 248, 0.12)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      color: 'var(--accent)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.22)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)'}
                  >
                    <Share2 size={13} />
                    <span>Open Full 22-Node Threat Graph Studio</span>
                  </button>
                )}
              </div>

              {/* Metadata Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Classification</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedItem.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Analyzed on</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedItem.firstSeen}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Checks / Status</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedItem.detections}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Investigated by</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedItem.source}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '6px' }}>
                <button
                  onClick={() => handleReanalyze(selectedItem)}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    boxShadow: '0 0 16px rgba(6, 182, 212, 0.3)',
                    flex: 1,
                    justifyContent: 'center'
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Re-analyze</span>
                </button>

                <button
                  onClick={() => handleDownloadPdf(selectedItem.id)}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    flex: 1,
                    justifyContent: 'center',
                    transition: 'all 0.12s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <Download size={14} />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
