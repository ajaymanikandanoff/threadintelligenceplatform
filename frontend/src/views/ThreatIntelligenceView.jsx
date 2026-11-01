import React, { useState } from 'react';
import {
  Link2,
  Terminal,
  Globe,
  Search,
  RefreshCw,
  FileText
} from 'lucide-react';

const DEFAULT_INDICATORS = [
  {
    id: 'ioc-1',
    indicator: 'hxxp://secure-login.example-verify.com',
    type: 'URL',
    category: 'Phishing',
    severity: 'critical',
    score: 94,
    firstSeen: '1 Nov 2026',
    detections: '3 of 4 checks',
    source: 'Platform analysis'
  },
  {
    id: 'ioc-2',
    indicator: '203.0.113.42',
    type: 'IP',
    category: 'Command and control',
    severity: 'critical',
    score: 88,
    firstSeen: '31 Oct 2026',
    detections: '4 of 4 checks',
    source: 'CISA Threat Feed'
  },
  {
    id: 'ioc-3',
    indicator: 'files-share.example.co',
    type: 'Domain',
    category: 'Malware distribution',
    severity: 'high',
    score: 81,
    firstSeen: '28 Oct 2026',
    detections: '2 of 4 checks',
    source: 'Passive DNS'
  },
  {
    id: 'ioc-4',
    indicator: '198.51.100.17',
    type: 'IP',
    category: 'Port scanning',
    severity: 'medium',
    score: 58,
    firstSeen: '25 Oct 2026',
    detections: '1 of 4 checks',
    source: 'Perimeter Telemetry'
  },
  {
    id: 'ioc-5',
    indicator: 'cdn.example.org',
    type: 'Domain',
    category: 'No threat found',
    severity: 'safe',
    score: 6,
    firstSeen: '12 Oct 2026',
    detections: '0 of 4 checks',
    source: 'Benign Whitelist'
  }
];

export default function ThreatIntelligenceView({
  threatData,
  onNavigateTab,
  onOpenReport
}) {
  // Merge any backend iocs into indicators list
  const allIndicators = React.useMemo(() => {
    let list = [...DEFAULT_INDICATORS];
    if (threatData?.iocs && Array.isArray(threatData.iocs)) {
      threatData.iocs.forEach((ioc, i) => {
        const typeStr = (ioc.type || 'Indicator').toUpperCase();
        const score = ioc.risk_score || (ioc.type === 'ip' ? 88 : ioc.type === 'domain' ? 82 : 75);
        let sev = 'medium';
        if (score >= 85) sev = 'critical';
        else if (score >= 70) sev = 'high';
        else if (score < 40) sev = 'safe';

        list.push({
          id: `backend-${i}`,
          indicator: ioc.value,
          type: typeStr.includes('IP') ? 'IP' : typeStr.includes('URL') ? 'URL' : 'Domain',
          category: ioc.description || 'Campaign Indicator',
          severity: sev,
          score: score,
          firstSeen: '1 Nov 2026',
          detections: '3 of 4 checks',
          source: threatData.threat_actor?.name || 'FastAPI Analysis'
        });
      });
    }
    return list;
  }, [threatData]);

  const [selectedId, setSelectedId] = useState(allIndicators[0]?.id || 'ioc-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All types');
  const [filterSeverity, setFilterSeverity] = useState('Any severity');

  const selectedItem = allIndicators.find(x => x.id === selectedId) || allIndicators[0];

  const filteredIndicators = allIndicators.filter(item => {
    // Type filter
    if (filterType !== 'All types') {
      if (item.type.toLowerCase() !== filterType.toLowerCase()) return false;
    }
    // Severity filter
    if (filterSeverity !== 'Any severity') {
      if (item.severity.toLowerCase() !== filterSeverity.toLowerCase()) return false;
    }
    // Search query
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
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ─── Page Title ─── */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          Threat Intelligence
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          Explore indicators, categories and detection details collected by your platform.
        </p>
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

      {/* ─── Two-Column Layout: Indicator List & Detail Panel ─── */}
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
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
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
                  width: `${selectedItem.score}%`,
                  height: '100%',
                  borderRadius: '3px',
                  background: getScoreColor(selectedItem.score)
                }} />
              </div>
            </div>

            {/* Metadata Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Category</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedItem.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>First seen</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedItem.firstSeen}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Detections</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedItem.detections}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Source</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedItem.source}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', paddingTop: '6px' }}>
              <button
                onClick={() => onNavigateTab('analyzer', { indicator: selectedItem.indicator, type: selectedItem.type })}
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
                onClick={onOpenReport}
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
                <FileText size={14} />
                <span>Open report</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

