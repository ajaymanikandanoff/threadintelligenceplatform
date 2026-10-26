import React, { useState, useMemo } from 'react';
import { Search, Copy, Check, Download, Filter, ExternalLink, Shield, Globe, Hash, Link2 } from 'lucide-react';
import { downloadStixBundle } from '../utils/stixExport';

const IOC_META = {
  'ip':     { label: 'IP Address', icon: Globe, color: 'var(--red)',    bg: 'var(--red-dim)', osint: (v) => `https://www.abuseipdb.com/check/${v}` },
  'domain': { label: 'Domain',    icon: Globe, color: 'var(--amber)',  bg: 'var(--amber-dim)', osint: (v) => `https://www.virustotal.com/gui/domain/${v}` },
  'hash':   { label: 'File Hash', icon: Hash,  color: 'var(--purple)', bg: 'var(--purple-dim)', osint: (v) => `https://www.virustotal.com/gui/file/${v}` },
  'url':    { label: 'URL',       icon: Link2, color: 'var(--accent)',  bg: 'var(--accent-dim)', osint: (v) => `https://www.virustotal.com/gui/url/${encodeURIComponent(v)}` },
};

const getTypeMeta = (type = '') => {
  const key = Object.keys(IOC_META).find(k => type.toLowerCase().includes(k));
  return IOC_META[key] || { label: type, icon: Shield, color: 'var(--text-secondary)', bg: 'var(--bg-overlay)', osint: () => '#' };
};

const defang = (val = '') =>
  val.replace(/\./g, '[.]').replace(/http:\/\//gi, 'hxxp://').replace(/https:\/\//gi, 'hxxps://');

export default function IocExplorer({ iocs = [], threatData }) {
  const [query, setQuery]           = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [copiedIdx, setCopiedIdx]   = useState(null);
  const [showAll, setShowAll]       = useState(false);
  const [defangOn, setDefangOn]     = useState(true);

  const types = useMemo(() => ['ALL', ...new Set(iocs.map(i => i.type?.toUpperCase()).filter(Boolean))], [iocs]);

  const filtered = useMemo(() => iocs.filter(i => {
    const matchType = typeFilter === 'ALL' || i.type?.toUpperCase() === typeFilter;
    const matchQ = !query || i.value?.toLowerCase().includes(query.toLowerCase()) || i.context?.toLowerCase().includes(query.toLowerCase());
    return matchType && matchQ;
  }), [iocs, query, typeFilter]);

  const displayed = showAll ? filtered : filtered.slice(0, 20);

  const copy = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const exportCsv = () => {
    const rows = [['Type', 'Value (Safe)', 'Context'], ...filtered.map(i => [i.type, i.value, i.context || ''])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'threat_iocs.csv' });
    a.click();
  };

  const exportStix = () => {
    if (threatData) downloadStixBundle(threatData);
  };

  const ipCount   = iocs.filter(i => i.type?.toLowerCase().includes('ip')).length;
  const hashCount = iocs.filter(i => i.type?.toLowerCase().includes('hash')).length;
  const domCount  = iocs.filter(i => i.type?.toLowerCase().includes('domain')).length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Threat Indicators
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Malicious IPs, domains, file hashes and URLs extracted by AI — ready to block.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost" onClick={exportCsv} style={{ fontSize: '12px' }}>
            <Download size={13} /> Export CSV
          </button>
          <button className="btn-ghost" onClick={exportStix} style={{ fontSize: '12px' }}>
            <Download size={13} /> Export STIX 2.1
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {[
          { label: 'Total Indicators', val: iocs.length, color: 'var(--accent)' },
          { label: 'Malicious IPs', val: ipCount, color: 'var(--red)' },
          { label: 'File Hashes', val: hashCount, color: 'var(--purple)' },
          { label: 'Domains', val: domCount, color: 'var(--amber)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: s.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={13} color="var(--text-tertiary)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            className="input"
            style={{ paddingLeft: '32px', fontSize: '13px' }}
            placeholder="Search indicators, context…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {types.slice(0, 5).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '6px 11px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                fontFamily: 'var(--font-mono)', cursor: 'pointer',
                background: typeFilter === t ? 'var(--accent)' : 'var(--bg-overlay)',
                color: typeFilter === t ? '#0a0f1a' : 'var(--text-secondary)',
                border: `1px solid ${typeFilter === t ? 'transparent' : 'var(--border)'}`,
                transition: 'all 0.12s ease'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={() => setDefangOn(p => !p)}
          style={{
            padding: '6px 11px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
            cursor: 'pointer', fontFamily: 'var(--font-mono)',
            background: defangOn ? 'var(--green-dim)' : 'var(--bg-overlay)',
            color: defangOn ? 'var(--green)' : 'var(--text-secondary)',
            border: `1px solid ${defangOn ? 'rgba(52,211,153,0.3)' : 'var(--border)'}`,
            transition: 'all 0.12s ease'
          }}
          title="Defanged values are safe to share in reports (e.g. [.] instead of .)"
        >
          🛡️ Defang {defangOn ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '110px' }}>Type</th>
              <th>Indicator Value</th>
              <th style={{ width: '180px' }}>Context / Description</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((ioc, i) => {
              const meta = getTypeMeta(ioc.type);
              const Icon = meta.icon;
              const displayVal = defangOn ? defang(ioc.value) : ioc.value;
              return (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '5px', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={11} color={meta.color} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: meta.color, fontFamily: 'var(--font-mono)' }}>
                        {ioc.type?.toUpperCase() || 'IOC'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <code style={{
                      fontSize: '12px', fontFamily: 'var(--font-mono)',
                      color: 'var(--text-primary)',
                      background: 'var(--bg-overlay)', padding: '2px 6px', borderRadius: '4px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {displayVal}
                    </code>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {ioc.context || '—'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => copy(ioc.value, i)}
                        style={{
                          padding: '5px 7px', borderRadius: '5px', border: '1px solid var(--border)',
                          background: 'transparent', cursor: 'pointer', color: copiedIdx === i ? 'var(--green)' : 'var(--text-tertiary)',
                          transition: 'all 0.12s', display: 'flex', alignItems: 'center', gap: '4px',
                          fontSize: '11px'
                        }}
                        title="Copy raw value"
                      >
                        {copiedIdx === i ? <Check size={11} /> : <Copy size={11} />}
                      </button>
                      <a
                        href={meta.osint(ioc.value)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '5px 7px', borderRadius: '5px', border: '1px solid var(--border)',
                          background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)',
                          display: 'flex', alignItems: 'center', transition: 'all 0.12s'
                        }}
                        title="OSINT Lookup"
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                      >
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
            <div style={{ marginBottom: '8px', fontSize: '24px' }}>🔍</div>
            No indicators match your search.
          </div>
        )}

        {filtered.length > 20 && !showAll && (
          <div style={{ textAlign: 'center', padding: '12px', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => setShowAll(true)}
              className="btn-ghost"
              style={{ fontSize: '12px' }}
            >
              Show all {filtered.length} indicators
            </button>
          </div>
        )}
      </div>

      {/* OSINT legend */}
      <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
        <span>🔗 Click <ExternalLink size={10} style={{ display: 'inline' }} /> to look up on VirusTotal or AbuseIPDB</span>
        <span>🛡️ Defang mode replaces <code>[.]</code> for safe sharing</span>
      </div>
    </div>
  );
}
