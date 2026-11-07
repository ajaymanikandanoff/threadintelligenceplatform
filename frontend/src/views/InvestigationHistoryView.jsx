import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  ExternalLink,
  Shield,
  Layers,
  Radio,
  Clock,
  Trash2
} from 'lucide-react';
import ScanDetailsModal from '../components/ScanDetailsModal';

const API_BASE = 'http://localhost:8000';

const FALLBACK_HISTORY = [
  {
    id: 'h-1',
    indicator: 'hxxp://secure-login.example-verify.com',
    type: 'URL',
    risk_score: 94,
    severity: 'critical',
    created_at: '2026-11-01T10:02:00Z',
    classification: 'Phishing',
    details: {
      summary: 'Automated phishing credential harvest page.',
      evidence: ['Lookalike domain mimicking security portal', 'Unencrypted POST credential form'],
      recommended_actions: ['Block URL on edge proxy', 'Purge emails with this link']
    }
  },
  {
    id: 'h-2',
    indicator: '203.0.113.42',
    type: 'IP',
    risk_score: 88,
    severity: 'critical',
    created_at: '2026-11-01T09:48:00Z',
    classification: 'Command and control',
    details: {
      summary: 'Active C2 listener receiving encrypted beacon traffic.',
      evidence: ['High-frequency heartbeats observed', 'Reverse DNS resolves to bulletproof network'],
      recommended_actions: ['Sever sockets to 203.0.113.42', 'Isolate affected host']
    }
  },
  {
    id: 'h-3',
    indicator: 'files-share.example.co',
    type: 'Domain',
    risk_score: 81,
    severity: 'high',
    created_at: '2026-11-01T09:21:00Z',
    classification: 'Malware distribution',
    details: {
      summary: 'Domain delivers multi-stage payload droppers.',
      evidence: ['Registered recently with privacy protection', 'Hosts disguised payload archive'],
      recommended_actions: ['Sinkhole DNS queries for domain', 'Detonate payload in sandbox']
    }
  }
];

export default function InvestigationHistoryView({ onOpenInvestigation }) {
  const [investigations, setInvestigations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchInvestigations = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/investigations?limit=100`);
      const data = await resp.json();
      if (resp.ok && data.investigations && data.investigations.length > 0) {
        setInvestigations(data.investigations);
      } else {
        setInvestigations(FALLBACK_HISTORY);
      }
    } catch {
      setInvestigations(FALLBACK_HISTORY);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  const handleDeleteSingle = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this investigation record permanently?')) {
      return;
    }
    try {
      const resp = await fetch(`${API_BASE}/api/investigations/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        setInvestigations(prev => prev.filter(item => item.id !== id));
      } else {
        alert('Could not delete record from server.');
      }
    } catch (err) {
      // In case of local fallback
      setInvestigations(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to permanently delete ALL past investigation history? This action cannot be undone.')) {
      return;
    }
    try {
      const resp = await fetch(`${API_BASE}/api/investigations`, { method: 'DELETE' });
      if (resp.ok) {
        setInvestigations([]);
      } else {
        alert('Could not purge all records from server.');
      }
    } catch (err) {
      setInvestigations([]);
    }
  };

  const filtered = investigations.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    const ind = (item.indicator || '').toLowerCase();
    const cls = (item.classification || '').toLowerCase();
    const matchQ = !q || ind.includes(q) || cls.includes(q);

    const matchType = typeFilter === 'all' || (item.type || '').toLowerCase() === typeFilter.toLowerCase();
    const matchSev = severityFilter === 'all' || (item.severity || '').toLowerCase().includes(severityFilter.toLowerCase());

    return matchQ && matchType && matchSev;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Investigation History & Evidence Store
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Unified archive of all IP scans, domain lookups, URL crawls, and PDF threat research dossiers.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchInvestigations}
            disabled={isLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '8px 14px', color: 'var(--text-primary)',
              fontSize: '12.5px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            <RotateCcw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            disabled={isLoading || investigations.length === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '8px', padding: '8px 14px', color: '#f43f5e',
              fontSize: '12.5px', fontWeight: '700',
              cursor: (isLoading || investigations.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || investigations.length === 0) ? 0.5 : 1
            }}
            title="Permanently clear all investigations"
          >
            <Trash2 size={14} />
            <span>Clear All History</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '16px 20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{
          flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', gap: '10px',
          background: 'var(--bg-base)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '9px 14px'
        }}>
          <Search size={16} color="var(--text-tertiary)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search indicator, hash, or classification..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '13px'
            }}
          />
        </div>

        {/* Type Filter */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'IP', 'Domain', 'URL', 'PDF'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                border: typeFilter === t ? '1px solid var(--border-accent)' : '1px solid var(--border)',
                background: typeFilter === t ? 'var(--accent-dim)' : 'var(--bg-overlay)',
                color: typeFilter === t ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>

        {/* Severity Filter */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'critical', 'high', 'safe'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverityFilter(s)}
              style={{
                padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                border: severityFilter === s ? '1px solid var(--border-accent)' : '1px solid var(--border)',
                background: severityFilter === s ? 'var(--accent-dim)' : 'var(--bg-overlay)',
                color: severityFilter === s ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* History Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length > 0 ? (
          filtered.map((item, idx) => {
            const badge = getScoreBadge(item.risk_score || item.score);
            return (
              <div
                key={item.id || idx}
                style={{
                  background: 'var(--bg-glass-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'border-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {/* Indicator & Classification */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px', background: 'var(--accent-dim)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Shield size={18} color="var(--accent)" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.indicator}
                      </span>
                      <span style={{
                        padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700',
                        background: 'var(--bg-overlay)', color: 'var(--text-tertiary)'
                      }}>
                        {item.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {item.classification}
                    </div>
                  </div>
                </div>

                {/* Investigation Timestamp & Log Metadata */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : (item.analyzed || 'Recorded')}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '3px' }}>
                      {item.analyst ? `Logged by: ${item.analyst}` : 'Archived Record'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(item)}
                      style={{
                        background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                        borderRadius: '8px', padding: '8px 14px', color: 'var(--text-primary)',
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <span>View Dossier</span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSingle(e, item.id)}
                      style={{
                        background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)',
                        borderRadius: '8px', padding: '8px 12px', color: '#f43f5e',
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                      title="Permanently delete this investigation record"
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)'}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)'
          }}>
            No investigations matching current filter.
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedRecord && (
        <ScanDetailsModal
          investigation={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}
