import React, { useState, useMemo } from 'react';
import { Search, Copy, Check, Download, Filter, ChevronDown, ChevronUp, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';
import { downloadStixBundle } from '../utils/stixExport';

export default function IocExplorer({ iocs = [], threatData }) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [defangEnabled, setDefangEnabled] = useState(true);

  // Defang helper: replaces dots with [.] and http with hxxp for safety
  const defang = (val, type) => {
    if (!val) return '';
    if (!defangEnabled) return val;
    let s = val.replace(/\./g, '[.]');
    s = s.replace(/http:\/\//gi, 'hxxp://').replace(/https:\/\//gi, 'hxxps://');
    return s;
  };

  const types = useMemo(() => ['ALL', ...new Set(iocs.map(i => i.type))], [iocs]);

  const filtered = useMemo(() => {
    return iocs.filter(i => {
      const matchType = typeFilter === 'ALL' || i.type === typeFilter;
      const matchQuery = !query || i.value.toLowerCase().includes(query.toLowerCase()) || i.context?.toLowerCase().includes(query.toLowerCase());
      return matchType && matchQuery;
    });
  }, [iocs, query, typeFilter]);

  const displayed = showAll ? filtered : filtered.slice(0, 15);

  const copy = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const exportCsv = () => {
    const rows = [['Type', 'Value', 'Context'], ...filtered.map(i => [i.type, i.value, i.context || ''])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'threat_iocs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'threat_iocs.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getOsintLink = (type, val) => {
    const clean = val.replace(/\[\.\]/g, '.').replace(/hxxp/gi, 'http');
    if (type === 'ipv4') return `https://www.virustotal.com/gui/ip-address/${clean}`;
    if (type === 'domain') return `https://www.virustotal.com/gui/domain/${clean}`;
    if (type === 'sha256' || type === 'md5') return `https://www.virustotal.com/gui/file/${clean}`;
    return null;
  };

  const getAbuseLink = (type, val) => {
    if (type === 'ipv4') {
      const clean = val.replace(/\[\.\]/g, '.');
      return `https://www.abuseipdb.com/check/${clean}`;
    }
    return null;
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Title + Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-0)', margin: 0 }}>
            IoC Indicator Explorer & OSINT Pivot
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            Filter, inspect, defang, and cross-reference indicators with VirusTotal & AbuseIPDB.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Defang Toggle */}
          <button
            onClick={() => setDefangEnabled(!defangEnabled)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '6px',
              border: `1px solid ${defangEnabled ? 'rgba(104, 211, 145, 0.4)' : 'var(--border)'}`,
              background: defangEnabled ? 'rgba(104, 211, 145, 0.1)' : 'var(--bg-2)',
              color: defangEnabled ? 'var(--green)' : 'var(--text-3)',
              fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer'
            }}
            title="Defanging avoids accidental clicks or email scanner triggers"
          >
            {defangEnabled ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            <span>Defang: {defangEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button className="btn-ghost" onClick={exportCsv} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
            <Download size={14} /><span>CSV</span>
          </button>
          <button className="btn-ghost" onClick={exportJson} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
            <Download size={14} /><span>JSON</span>
          </button>
          {threatData && (
            <button className="btn-primary" onClick={() => downloadStixBundle(threatData)} style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
              <Download size={14} /><span>STIX 2.1</span>
            </button>
          )}
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search indicators by IP, hash, domain, or observed context…"
            style={{
              width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '7px',
              padding: '10px 14px 10px 36px', color: 'var(--text-0)', fontSize: '0.84rem', fontFamily: 'var(--font-sans)', outline: 'none'
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(99,179,237,0.4)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={14} color="var(--text-3)" style={{ marginRight: '4px' }} />
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '6px 10px', borderRadius: '5px',
                border: `1px solid ${typeFilter === t ? 'rgba(99,179,237,0.35)' : 'var(--border)'}`,
                background: typeFilter === t ? 'rgba(99,179,237,0.1)' : 'transparent',
                color: typeFilter === t ? 'var(--cyan)' : 'var(--text-3)',
                fontSize: '0.72rem', fontFamily: 'var(--font-mono)', cursor: 'pointer', textTransform: 'uppercase',
                fontWeight: '600', transition: 'all 0.12s ease'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Results count banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-3)' }}>
        <span>Showing {displayed.length} of {filtered.length} indicators{query && ` matching "${query}"`}</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>{defangEnabled ? 'Safe Mode: [.] bracketed' : 'Raw Mode: Active'}</span>
      </div>

      {/* Table */}
      <div className="surface" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', fontWeight: '600' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', fontWeight: '600' }}>Indicator Value</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', fontWeight: '600' }}>Threat Context</th>
              <th style={{ textAlign: 'center', padding: '10px 16px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', fontWeight: '600' }}>OSINT Pivot</th>
              <th style={{ width: '50px', padding: '10px 16px' }}></th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)' }}>
                  No indicators match your filter.
                </td>
              </tr>
            ) : (
              displayed.map((ioc, i) => {
                const displayVal = defang(ioc.value, ioc.type);
                const vtUrl = getOsintLink(ioc.type, ioc.value);
                const abuseUrl = getAbuseLink(ioc.type, ioc.value);

                return (
                  <tr
                    key={i}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 16px' }}>
                      <span className={`tag ${ioc.type === 'ipv4' ? 'tag-cyan' : ioc.type === 'sha256' ? 'tag-purple' : ioc.type === 'md5' ? 'tag-amber' : 'tag-green'}`}>
                        {ioc.type}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-1)', fontSize: '0.78rem', wordBreak: 'break-all' }}>
                      {displayVal}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-3)', fontSize: '0.78rem' }}>
                      {ioc.context || '—'}
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {vtUrl && (
                          <a
                            href={vtUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '3px 7px', borderRadius: '4px', background: 'rgba(99,179,237,0.1)',
                              color: 'var(--cyan)', fontSize: '0.7rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px'
                            }}
                            title="Check on VirusTotal"
                          >
                            <span>VT</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                        {abuseUrl && (
                          <a
                            href={abuseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '3px 7px', borderRadius: '4px', background: 'rgba(245,101,101,0.1)',
                              color: 'var(--red)', fontSize: '0.7rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px'
                            }}
                            title="Check on AbuseIPDB"
                          >
                            <span>Abuse</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => copy(ioc.value, i)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: copiedIdx === i ? 'var(--green)' : 'var(--text-3)', padding: '4px'
                        }}
                        title="Copy raw indicator"
                      >
                        {copiedIdx === i ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 15 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="btn-ghost"
          style={{ alignSelf: 'center', fontSize: '0.78rem', marginTop: '4px' }}
        >
          {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{showAll ? 'Show Top 15' : `Show All ${filtered.length} Indicators`}</span>
        </button>
      )}
    </div>
  );
}
