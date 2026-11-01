import React, { useState } from 'react';
import {
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

const HISTORY_RECORDS = [
  {
    id: 'h-1',
    indicator: 'hxxp://secure-login.example-verify.com',
    type: 'URL',
    score: 94,
    severity: 'critical',
    analyzed: 'Today, 10:02',
    classification: 'Phishing',
    timeline: [
      { color: '#00e5ff', title: 'Analysis requested', time: 'Today, 10:02' },
      { color: '#818cf8', title: 'Risk score calculated', time: 'Classified as Phishing' },
      { color: '#f43f5e', title: 'Result stored', time: 'Available to reopen' }
    ]
  },
  {
    id: 'h-2',
    indicator: '203.0.113.42',
    type: 'IP',
    score: 88,
    severity: 'critical',
    analyzed: 'Today, 09:48',
    classification: 'Command and control',
    timeline: [
      { color: '#00e5ff', title: 'Analysis requested', time: 'Today, 09:48' },
      { color: '#818cf8', title: 'Risk score calculated', time: 'Classified as C2 Server' },
      { color: '#f43f5e', title: 'Result stored', time: 'Available to reopen' }
    ]
  },
  {
    id: 'h-3',
    indicator: 'files-share.example.co',
    type: 'Domain',
    score: 81,
    severity: 'high',
    analyzed: 'Today, 09:21',
    classification: 'Malware distribution',
    timeline: [
      { color: '#00e5ff', title: 'Analysis requested', time: 'Today, 09:21' },
      { color: '#818cf8', title: 'Risk score calculated', time: 'Classified as Payload Dropper' },
      { color: '#f43f5e', title: 'Result stored', time: 'Available to reopen' }
    ]
  },
  {
    id: 'h-4',
    indicator: 'login-update.example.net',
    type: 'Domain',
    score: 76,
    severity: 'high',
    analyzed: 'Today, 08:55',
    classification: 'Credential harvesting',
    timeline: [
      { color: '#00e5ff', title: 'Analysis requested', time: 'Today, 08:55' },
      { color: '#818cf8', title: 'Risk score calculated', time: 'Classified as Login Phishing' },
      { color: '#f43f5e', title: 'Result stored', time: 'Available to reopen' }
    ]
  },
  {
    id: 'h-5',
    indicator: '198.51.100.17',
    type: 'IP',
    score: 58,
    severity: 'medium',
    analyzed: 'Yesterday, 17:30',
    classification: 'Port scanning',
    timeline: [
      { color: '#00e5ff', title: 'Analysis requested', time: 'Yesterday, 17:30' },
      { color: '#818cf8', title: 'Risk score calculated', time: 'Classified as Reconnaissance' },
      { color: '#f43f5e', title: 'Result stored', time: 'Available to reopen' }
    ]
  },
  {
    id: 'h-6',
    indicator: '192.0.2.88',
    type: 'IP',
    score: 52,
    severity: 'medium',
    analyzed: 'Yesterday, 14:12',
    classification: 'Brute force',
    timeline: [
      { color: '#00e5ff', title: 'Analysis requested', time: 'Yesterday, 14:12' },
      { color: '#818cf8', title: 'Risk score calculated', time: 'Classified as Password Spray' },
      { color: '#f43f5e', title: 'Result stored', time: 'Available to reopen' }
    ]
  },
  {
    id: 'h-7',
    indicator: 'cdn.example.org',
    type: 'Domain',
    score: 6,
    severity: 'safe',
    analyzed: 'Yesterday, 11:05',
    classification: 'No threat found',
    timeline: [
      { color: '#00e5ff', title: 'Analysis requested', time: 'Yesterday, 11:05' },
      { color: '#818cf8', title: 'Risk score calculated', time: 'Classified as Benign Domain' },
      { color: '#10b981', title: 'Result stored', time: 'Available to reopen' }
    ]
  }
];

export default function InvestigationHistoryView({ onNavigateTab }) {
  const [records] = useState(HISTORY_RECORDS);
  const [selectedId, setSelectedId] = useState(HISTORY_RECORDS[0].id);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [fromDate, setFromDate] = useState('10/25/2026');
  const [toDate, setToDate] = useState('11/01/2026');
  const [page, setPage] = useState(1);

  const selectedItem = records.find(r => r.id === selectedId) || records[0];

  const filteredRecords = records.filter(item => {
    if (filterSeverity !== 'All' && item.severity.toLowerCase() !== filterSeverity.toLowerCase()) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        item.indicator.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.classification.toLowerCase().includes(q)
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ─── Top Header ─── */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          Investigation History
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          Review past analyses and reopen any investigation.
        </p>
      </div>

      {/* ─── Search & Date Range Filters Bar ─── */}
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
          borderRadius: '8px', padding: '7px 12px', minWidth: '220px', flex: '1 1 200px'
        }}>
          <Search size={14} color="var(--text-tertiary)" />
          <input
            type="text"
            placeholder="Search indicator"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '12.5px', width: '100%'
            }}
          />
        </div>

        {/* Date Pickers & Severity Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* From Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>From</span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '5px 10px', fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-primary)'
            }}>
              <input
                type="text"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                style={{ width: '80px', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
              />
              <Calendar size={13} color="var(--text-tertiary)" />
            </div>
          </div>

          {/* To Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>To</span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '5px 10px', fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-primary)'
            }}>
              <input
                type="text"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                style={{ width: '80px', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
              />
              <Calendar size={13} color="var(--text-tertiary)" />
            </div>
          </div>

          {/* Severity Pills */}
          <div style={{ display: 'flex', background: 'var(--bg-overlay)', borderRadius: '6px', padding: '3px', border: '1px solid var(--border)' }}>
            {['All', 'Critical', 'High', 'Medium', 'Safe'].map(s => (
              <button
                key={s}
                onClick={() => setFilterSeverity(s)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
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

      {/* ─── Two-Column Layout: Table + Selected Investigation Drawer ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.75fr) minmax(0, 1.1fr)',
        gap: '20px'
      }}>
        {/* Left Column: Data Table Card */}
        <div style={{
          background: 'var(--bg-glass-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-tertiary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 14px' }}>Indicator</th>
                  <th style={{ padding: '12px 14px' }}>Type</th>
                  <th style={{ padding: '12px 14px' }}>Score</th>
                  <th style={{ padding: '12px 14px' }}>Severity</th>
                  <th style={{ padding: '12px 14px' }}>Analyzed</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(item => {
                  const isSelected = item.id === selectedId;
                  const sevStyle = getSeverityStyle(item.severity);
                  const scoreColor = getScoreColor(item.score);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        transition: 'background 0.12s ease'
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '13px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: '500' }}>
                        {item.indicator}
                      </td>
                      <td style={{ padding: '13px 14px', color: 'var(--text-secondary)' }}>
                        {item.type}
                      </td>
                      <td style={{ padding: '13px 14px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: scoreColor }}>
                        {item.score}
                      </td>
                      <td style={{ padding: '13px 14px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          background: sevStyle.bg, border: sevStyle.border, color: sevStyle.color,
                          padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600'
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sevStyle.dot }} />
                          {item.severity}
                        </span>
                      </td>
                      <td style={{ padding: '13px 14px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                        {item.analyzed}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            <span>Page {page} of 6</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: SELECTED INVESTIGATION Drawer */}
        {selectedItem && (
          <div style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px 26px',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
            height: 'fit-content',
            position: 'sticky',
            top: '80px'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
                SELECTED INVESTIGATION
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '14.5px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginTop: '6px',
                wordBreak: 'break-all'
              }}>
                {selectedItem.indicator}
              </div>
            </div>

            {/* Huge Score Banner */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '48px', fontWeight: '900', color: getScoreColor(selectedItem.score), lineHeight: 1 }}>
                {selectedItem.score}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {selectedItem.severity} · {selectedItem.type}
              </span>
            </div>

            {/* Timeline Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
              {selectedItem.timeline.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: step.color, boxShadow: `0 0 8px ${step.color}`,
                    marginTop: '5px', flexShrink: 0
                  }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {step.title}
                    </span>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                      {step.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Big Reopen Analysis Button */}
            <button
              onClick={() => onNavigateTab('analyzer', { indicator: selectedItem.indicator, type: selectedItem.type })}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.35)',
                transition: 'all 0.15s ease',
                marginTop: '6px'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span>Reopen analysis</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
