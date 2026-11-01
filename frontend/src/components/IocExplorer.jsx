import React, { useState, useMemo } from 'react';
import { Search, Copy, Check, Download, ExternalLink, Shield, Globe, Hash, Link2 } from 'lucide-react';
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Threat Indicators (IoCs) Telemetry
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Malicious network nodes, C2 command endpoints, and file artifacts extracted for immediate SIEM and boundary blocking.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost" onClick={exportCsv} style={{ fontSize: '12px', padding: '6px 12px' }}>
            <Download size={13} /> <span>Export CSV</span>
          </button>
          <button className="btn-ghost" onClick={exportStix} style={{ fontSize: '12px', padding: '6px 12px' }}>
            <Download size={13} /> <span>Export STIX 2.1</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Total Indicators', val: iocs.length, color: 'var(--accent)' },
          { label: 'Malicious IPs', val: ipCount, color: 'var(--red)' },
          { label: 'Malware Hashes', val: hashCount, color: 'var(--purple)' },
          { label: 'C2 Domains', val: domCount, color: 'var(--amber)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: s.color, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-mono)' }}>
              {s.val}
            </div>
          </div>
        ))}
      </div>

      {/* Filters, Type Switcher & Defang Toggle */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            className="input"
            style={{ paddingLeft: '34px', fontSize: '12.5px' }}
            placeholder="Search indicator value, context, or malware type…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-overlay)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          {types.slice(0, 5).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                fontFamily: 'var(--font-mono)', cursor: 'pointer',
                background: typeFilter === t ? 'var(--accent)' : 'transparent',
                color: typeFilter === t ? '#06090f' : 'var(--text-secondary)',
                border: 'none',
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
            padding: '7px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '700',
            cursor: 'pointer', fontFamily: 'var(--font-mono)',
            background: defangOn ? 'var(--green-dim)' : 'var(--bg-overlay)',
            color: defangOn ? 'var(--green)' : 'var(--text-secondary)',
            border: `1px solid ${defangOn ? 'rgba(16,185,129,0.35)' : 'var(--border)'}`,
            transition: 'all 0.12s ease',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
          title="Defanged values ([.]) prevent accidental clickable links in external reports"
        >
          <Shield size={12} />
          <span>SAFE DEFANG: {defangOn ? 'ACTIVE' : 'OFF'}</span>
        </button>
      </div>

      {/* Enterprise Telemetry Table */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>Type</th>
              <th>Indicator Value</th>
              <th style={{ width: '220px' }}>Campaign Context</th>
              <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '5px', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={12} color={meta.color} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: meta.color, fontFamily: 'var(--font-mono)' }}>
                        {ioc.type?.toUpperCase() || 'IOC'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <code style={{
                      fontSize: '12px', fontFamily: 'var(--font-mono)',
                      color: 'var(--text-primary)',
                      background: 'var(--bg-overlay)', padding: '3px 8px', borderRadius: '5px',
                      border: '1px solid var(--border-subtle)',
                      wordBreak: 'break-all'
                    }}>
                      {displayVal}
                    </code>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {ioc.context || 'Malicious campaign artifact'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => copy(ioc.value, i)}
                        style={{
                          padding: '5px 8px', borderRadius: '5px', border: '1px solid var(--border)',
                          background: 'var(--bg-overlay)', cursor: 'pointer',
                          color: copiedIdx === i ? 'var(--green)' : 'var(--text-tertiary)',
                          transition: 'all 0.12s', display: 'flex', alignItems: 'center', gap: '4px',
                          fontSize: '11px'
                        }}
                        title="Copy raw value to clipboard"
                      >
                        {copiedIdx === i ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                      <a
                        href={meta.osint(ioc.value)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '5px 8px', borderRadius: '5px', border: '1px solid var(--border)',
                          background: 'var(--bg-overlay)', cursor: 'pointer', color: 'var(--text-tertiary)',
                          display: 'flex', alignItems: 'center', transition: 'all 0.12s'
                        }}
                        title="Search reputation on VirusTotal / AbuseIPDB"
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                      >
                        <ExternalLink size={12} />
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
            No indicators match your filter query.
          </div>
        )}

        {filtered.length > 20 && !showAll && (
          <div style={{ textAlign: 'center', padding: '14px', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => setShowAll(true)}
              className="btn-ghost"
              style={{ fontSize: '12px' }}
            >
              Show all {filtered.length} extracted indicators
            </button>
          </div>
        )}
      </div>

      {/* OSINT Legend */}
      <div style={{ display: 'flex', gap: '20px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
        <span>🔗 External link shortcuts verify IOC reputation on VirusTotal and AbuseIPDB.</span>
        <span>🛡️ Defang Mode automatically sanitizes <code>.</code> to <code>[.]</code> for secure reporting.</span>
      </div>
    </div>
  );
}
