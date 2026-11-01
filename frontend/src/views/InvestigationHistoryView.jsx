import React, { useState } from 'react';
import {
  Search,
  FileText,
  Upload,
  ArrowRight
} from 'lucide-react';

export default function InvestigationHistoryView({
  sampleReports = [],
  _activeReportId,
  onSelectReport,
  onOpenIngest,
  onOpenReport,
  _threatData
}) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const HISTORY_ITEMS = [
    {
      id: 'inv-101',
      title: 'CISA AA23-158A: CL0P Ransomware Gang MOVEit Transfer Campaign',
      threatActor: 'TA505 / FIN11 / Lace Tempest',
      date: '1 Nov 2026',
      status: 'Active Dossier',
      severity: 'Critical',
      indicatorsCount: 28,
      cves: ['CVE-2023-34362'],
      summary: 'SQL injection leading to remote code execution and large-scale automated data exfiltration.'
    },
    {
      id: 'inv-102',
      title: 'NSA/CISA Joint Alert: Volt Typhoon Living-off-the-Land Exploitation',
      threatActor: 'Volt Typhoon / Vanguard Panda',
      date: '31 Oct 2026',
      status: 'Archived',
      severity: 'Nation-State',
      indicatorsCount: 19,
      cves: ['CVE-2021-40539'],
      summary: 'Pre-positioning on US critical infrastructure using stealthy built-in network admin binaries.'
    },
    {
      id: 'inv-103',
      title: 'FBI Cyber Alert: ALPHV BlackCat Ransomware Healthcare Campaign',
      threatActor: 'ALPHV / BlackCat',
      date: '28 Oct 2026',
      status: 'Archived',
      severity: 'High',
      indicatorsCount: 34,
      cves: ['CVE-2023-46805'],
      summary: 'Rust-based double-extortion ransomware with privilege escalation and credential access.'
    },
    {
      id: 'inv-104',
      title: 'Perimeter Telemetry: Credential-Harvesting Lookalike Portal',
      threatActor: 'Unattributed Phishing Cluster',
      date: '26 Oct 2026',
      status: 'Mitigated',
      severity: 'Critical',
      indicatorsCount: 12,
      cves: [],
      summary: 'Phishing domain imitating corporate SSO gateway with token replay infrastructure.'
    }
  ];

  const filteredItems = HISTORY_ITEMS.filter(item => {
    if (filter !== 'All' && item.severity.toLowerCase() !== filter.toLowerCase() && item.status.toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.threatActor.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Investigation History
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Review past investigations, government threat feeds, and uploaded incident telemetry.
          </p>
        </div>

        <button
          onClick={onOpenIngest}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.3)'
          }}
        >
          <Upload size={15} />
          <span>Ingest New Advisory / PDF</span>
        </button>
      </div>

      {/* ─── Filter Bar ─── */}
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
            placeholder="Search campaign, actor, or CVE"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '13px', width: '100%'
            }}
          />
        </div>

        <div style={{ display: 'flex', background: 'var(--bg-overlay)', borderRadius: '6px', padding: '3px', border: '1px solid var(--border)' }}>
          {['All', 'Critical', 'Nation-State', 'High'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '5px 12px',
                borderRadius: '4px',
                fontSize: '11.5px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: filter === f ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                color: filter === f ? 'var(--accent)' : 'var(--text-tertiary)',
                outline: filter === f ? '1px solid rgba(56, 189, 248, 0.4)' : 'none'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Investigations List ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredItems.map(item => (
          <div
            key={item.id}
            style={{
              background: 'var(--bg-glass-card)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  padding: '3px 8px', borderRadius: '4px',
                  background: item.severity === 'Critical' ? 'rgba(244, 63, 94, 0.12)' : item.severity === 'Nation-State' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(245, 158, 11, 0.12)',
                  color: item.severity === 'Critical' ? '#f43f5e' : item.severity === 'Nation-State' ? 'var(--purple)' : '#f59e0b',
                  fontSize: '11px', fontWeight: '700', fontFamily: 'var(--font-mono)'
                }}>
                  {item.severity}
                </span>

                <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  {item.date}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11.5px', color: item.status === 'Active Dossier' ? '#10b981' : 'var(--text-tertiary)',
                  fontWeight: '600'
                }}>
                  ● {item.status}
                </span>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: '1.5' }}>
                {item.summary}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                <span>Actor: <strong style={{ color: 'var(--text-primary)' }}>{item.threatActor}</strong></span>
                <span>Indicators: <strong style={{ color: 'var(--text-primary)' }}>{item.indicatorsCount}</strong></span>
                {item.cves.length > 0 && (
                  <span>CVEs: <strong style={{ color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>{item.cves.join(', ')}</strong></span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {sampleReports.length > 0 && (
                  <button
                    onClick={() => {
                      const rep = sampleReports.find(r => r.title.includes('MOVEit') || r.id.includes('moveit')) || sampleReports[0];
                      if (onSelectReport) onSelectReport(rep.id);
                    }}
                    style={{
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      color: 'var(--accent)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <span>Load Campaign Telemetry</span>
                    <ArrowRight size={13} />
                  </button>
                )}

                <button
                  onClick={onOpenReport}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <FileText size={13} />
                  <span>Report</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
