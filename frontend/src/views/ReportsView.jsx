import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Download,
  Loader,
  RefreshCw
} from 'lucide-react';
import { downloadStixBundle } from '../utils/stixExport';

const INITIAL_REPORTS = [
  {
    id: 'rep-1',
    title: 'Phishing campaign summary',
    severity: 'Critical',
    indicatorsCount: 12,
    date: '1 Nov 2026',
    status: 'Ready',
    summary: 'Executive briefing on lookalike portal impersonation and credential capture infrastructure.'
  },
  {
    id: 'rep-2',
    title: 'C2 infrastructure review',
    severity: 'High',
    indicatorsCount: 7,
    date: '31 Oct 2026',
    status: 'Ready',
    summary: 'Command and control beacon analysis, proxy hops, and ingress tool transfer tracking.'
  },
  {
    id: 'rep-3',
    title: 'Weekly threat overview',
    severity: 'Mixed',
    indicatorsCount: 58,
    date: '30 Oct 2026',
    status: 'Generating',
    summary: 'Aggregated SOC telemetry, CVE correlations, and perimeter detection performance.'
  },
  {
    id: 'rep-4',
    title: 'Malware distribution domains',
    severity: 'High',
    indicatorsCount: 9,
    date: '29 Oct 2026',
    status: 'Ready',
    summary: 'Payload staging hosts, secondary payload redirectors, and passive DNS records.'
  },
  {
    id: 'rep-5',
    title: 'Brute-force source IPs',
    severity: 'Medium',
    indicatorsCount: 5,
    date: '28 Oct 2026',
    status: 'Failed',
    summary: 'Automated spray attempts against VPN endpoints and perimeter SSH services.'
  },
  {
    id: 'rep-6',
    title: 'Credential harvesting pages',
    severity: 'High',
    indicatorsCount: 6,
    date: '27 Oct 2026',
    status: 'Ready',
    summary: 'Reverse proxy setups capturing session tokens and multi-factor auth cookies.'
  }
];

export default function ReportsView({ threatData, onOpenExecutiveModal }) {
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);

  const filteredReports = reports.filter(r => {
    if (filter !== 'All' && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.severity.toLowerCase().includes(q);
    }
    return true;
  });

  const handleDownload = (rep) => {
    if (threatData) {
      downloadStixBundle(threatData);
    } else {
      const fallbackData = {
        type: 'bundle',
        id: `bundle--${rep.id}`,
        title: rep.title,
        severity: rep.severity,
        indicators_count: rep.indicatorsCount,
        created: rep.date
      };
      const blob = new Blob([JSON.stringify(fallbackData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rep.title.toLowerCase().replace(/\s+/g, '_')}_report.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleGenerateReport = () => {
    setIsGeneratingNew(true);
    setTimeout(() => {
      const newRep = {
        id: `rep-${Date.now()}`,
        title: threatData?.title || `Advisory Investigation Dossier (${new Date().toLocaleDateString()})`,
        severity: threatData?.threat_actor ? 'Critical' : 'High',
        indicatorsCount: threatData?.iocs?.length || 14,
        date: 'Today',
        status: 'Ready',
        summary: threatData?.threat_actor?.objective || 'Comprehensive automated threat intelligence report.'
      };
      setReports(prev => [newRep, ...prev]);
      setIsGeneratingNew(false);
    }, 900);
  };

  const handleRetry = (repId) => {
    setReports(prev => prev.map(r => r.id === repId ? { ...r, status: 'Generating' } : r));
    setTimeout(() => {
      setReports(prev => prev.map(r => r.id === repId ? { ...r, status: 'Ready' } : r));
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ─── Top Header ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Reports
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Generated investigation reports, ready to review and download.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isGeneratingNew}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: isGeneratingNew ? 'not-allowed' : 'pointer',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.35)',
            transition: 'all 0.15s ease'
          }}
        >
          {isGeneratingNew ? <Loader size={16} className="spin" /> : <Plus size={16} strokeWidth={2.6} />}
          <span>{isGeneratingNew ? 'Compiling report...' : 'Generate report'}</span>
        </button>
      </div>

      {/* ─── Search & Filter Bar ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '14px',
        background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '12px 18px'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-input)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '8px 14px', minWidth: '320px', flex: '1 1 300px'
        }}>
          <Search size={14} color="var(--text-tertiary)" />
          <input
            type="text"
            placeholder="Search reports"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '13px', width: '100%'
            }}
          />
        </div>

        <div style={{ display: 'flex', background: 'var(--bg-overlay)', borderRadius: '6px', padding: '3px', border: '1px solid var(--border)' }}>
          {['All', 'Ready', 'Generating', 'Failed'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              style={{
                padding: '5px 14px',
                borderRadius: '4px',
                fontSize: '11.5px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: filter === st ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                color: filter === st ? 'var(--accent)' : 'var(--text-tertiary)',
                outline: filter === st ? '1px solid rgba(56, 189, 248, 0.4)' : 'none',
                transition: 'all 0.12s ease'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 3x2 Grid of Report Cards ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '16px'
      }}>
        {filteredReports.map(rep => {
          const isReady = rep.status === 'Ready';
          const isGenerating = rep.status === 'Generating';
          const isFailed = rep.status === 'Failed';

          return (
            <div
              key={rep.id}
              style={{
                background: 'var(--bg-glass-card)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Top Row: Icon & Status Pill */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(129, 140, 248, 0.15)', border: '1px solid rgba(129, 140, 248, 0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FileText size={18} color="#818cf8" />
                </div>

                {/* Status Pill */}
                {isReady && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    fontSize: '11.5px', color: '#10b981', fontWeight: '600'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                    <span>Ready</span>
                  </div>
                )}
                {isGenerating && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    fontSize: '11.5px', color: '#38bdf8', fontWeight: '600'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
                    <span>Generating</span>
                  </div>
                )}
                {isFailed && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    fontSize: '11.5px', color: '#f43f5e', fontWeight: '600'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f43f5e' }} />
                    <span>Failed</span>
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, lineHeight: '1.3' }}>
                  {rep.title}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  {rep.severity} · {rep.indicatorsCount} indicators · {rep.date}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '4px' }}>
                <button
                  onClick={onOpenExecutiveModal}
                  style={{
                    flex: 1,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  View details
                </button>

                {isReady && (
                  <button
                    onClick={() => handleDownload(rep)}
                    style={{
                      flex: 1,
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      transition: 'all 0.12s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.25)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'; }}
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                )}

                {isGenerating && (
                  <button
                    disabled
                    style={{
                      flex: 1,
                      background: 'var(--bg-overlay)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      color: 'var(--text-tertiary)',
                      cursor: 'not-allowed',
                      textAlign: 'center'
                    }}
                  >
                    Please wait
                  </button>
                )}

                {isFailed && (
                  <button
                    onClick={() => handleRetry(rep.id)}
                    style={{
                      flex: 1,
                      background: 'rgba(244, 63, 94, 0.12)',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      color: '#f43f5e',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    <RefreshCw size={14} />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
