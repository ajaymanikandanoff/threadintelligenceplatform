import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Clock,
  ArrowRight,
  Search,
  Link2,
  Terminal,
  Globe,
  FileText,
  Plus,
  Radio
} from 'lucide-react';
import { getStoredInvestigations } from '../services/clientScannerService';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function DashboardView({
  onNavigateTab,
  onOpenNewAnalysis,
  onOpenReport,
  onSelectIndicator
}) {
  const [timeRange, setTimeRange] = useState('7D');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [_page, setPage] = useState(1);
  const [investigations, setInvestigations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      let rawItems = [];
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2800);
        const resp = await fetch(`${API_BASE}/api/investigations?limit=50`, { signal: controller.signal });
        clearTimeout(timeout);
        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data.investigations) && data.investigations.length > 0) {
            rawItems = data.investigations;
          }
        }
      } catch {
        // Backend offline or unreachable
      }

      if (rawItems.length === 0) {
        rawItems = getStoredInvestigations();
      }

      const mapped = rawItems.map(item => {
        const score = item.risk_score ?? 0;
        let sev = 'safe';
        if (score >= 85) sev = 'critical';
        else if (score >= 70) sev = 'high';
        else if (score >= 40) sev = 'medium';

        const createdDate = item.created_at ? new Date(item.created_at) : new Date();
        const now = new Date();
        const diffMin = Math.round((now - createdDate) / (1000 * 60));
        let detectedStr = 'Recent';
        if (diffMin < 2) detectedStr = 'Just now';
        else if (diffMin < 60) detectedStr = `${diffMin} min ago`;
        else if (diffMin < 1440) detectedStr = `${Math.round(diffMin / 60)} h ago`;
        else detectedStr = createdDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

        return {
          id: item.id,
          indicator: item.indicator,
          threatType: item.classification || (score >= 70 ? 'High-Risk Campaign' : 'Clean / Legitimate'),
          riskScore: score,
          severity: sev,
          detected: detectedStr,
          status: score >= 80 ? 'Blocked' : score >= 40 ? 'Investigating' : 'Verified Safe',
          type: (item.type || 'Indicator').toUpperCase().includes('IP') ? 'IP' : (item.type || '').toUpperCase().includes('URL') ? 'URL' : (item.type || '').toUpperCase().includes('DOMAIN') ? 'Domain' : 'PDF',
          raw: item
        };
      });
      setInvestigations(mapped);
      setIsLoading(false);
    };
    fetchRecent();
  }, []);

  // Filtered threats list from live investigations
  const filteredThreats = investigations.filter(t => {
    const matchSev = filterSeverity === 'All' || t.severity.toLowerCase() === filterSeverity.toLowerCase();
    const matchQ = !searchQuery ||
      t.indicator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.threatType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSev && matchQ;
  });

  const totalAnalyzedCount = investigations.length;
  const criticalThreatsCount = investigations.filter(x => x.riskScore >= 85).length;
  const highRiskCount = investigations.filter(x => x.riskScore >= 70 && x.riskScore < 85).length;
  const safeCount = investigations.filter(x => x.riskScore < 40).length;

  const categoryStats = useMemo(() => {
    if (!investigations || investigations.length === 0) {
      return [
        { label: 'Clean / Legitimate Target', count: 0, pct: 0, color: '#10b981' }
      ];
    }
    const counts = {};
    investigations.forEach(item => {
      let cat = item.threatType || (item.raw?.classification) || 'General Security Scan';
      if (cat.toLowerCase().includes('clean') || cat.toLowerCase().includes('legitimate')) cat = 'Clean / Legitimate Target';
      else if (cat.toLowerCase().includes('campaign') || cat.toLowerCase().includes('ransomware') || cat.toLowerCase().includes('dossier')) cat = 'High-Threat Campaign Dossier';
      else if (cat.toLowerCase().includes('c2') || cat.toLowerCase().includes('control')) cat = 'Command & Control';
      else if (cat.toLowerCase().includes('phish')) cat = 'Phishing Telemetry';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(counts), 1);
    const colors = ['#f43f5e', '#38bdf8', '#10b981', '#f97316', '#818cf8'];
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count], idx) => ({
        label,
        count,
        pct: Math.round((count / maxCount) * 100),
        color: colors[idx % colors.length]
      }));
  }, [investigations]);

  const severityStats = useMemo(() => {
    const total = investigations.length || 1;
    const crit = investigations.filter(x => x.riskScore >= 85).length;
    const high = investigations.filter(x => x.riskScore >= 70 && x.riskScore < 85).length;
    const med = investigations.filter(x => x.riskScore >= 40 && x.riskScore < 70).length;
    const safe = investigations.filter(x => x.riskScore < 40).length;

    const pCrit = Math.round((crit / total) * 100);
    const pHigh = Math.round((high / total) * 100);
    const pMed = Math.round((med / total) * 100);
    const pSafe = Math.round((safe / total) * 100);

    const circ = 389.5;
    const lenSafe = (safe / total) * circ;
    const lenMed = (med / total) * circ;
    const lenHigh = (high / total) * circ;
    const lenCrit = (crit / total) * circ;

    let off = 0;
    const offSafe = 0;
    off += lenSafe;
    const offMed = -off;
    off += lenMed;
    const offHigh = -off;
    off += lenHigh;
    const offCrit = -off;

    return {
      crit, high, med, safe,
      pCrit, pHigh, pMed, pSafe,
      lenSafe, lenMed, lenHigh, lenCrit,
      offSafe, offMed, offHigh, offCrit,
      circ,
      dominantPct: crit > 0 ? pCrit : pSafe,
      dominantLabel: crit > 0 ? 'CRITICAL' : 'SAFE'
    };
  }, [investigations]);

  const activityDays = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };
    const critCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    investigations.forEach(inv => {
      const d = inv.raw?.created_at ? new Date(inv.raw.created_at) : new Date();
      const name = dayNames[d.getDay()];
      if (counts[name] !== undefined) {
        counts[name] += 1;
        if (inv.riskScore >= 70) critCounts[name] += 1;
      } else {
        counts['Fri'] = (counts['Fri'] || 0) + 1;
        if (inv.riskScore >= 70) critCounts['Fri'] += 1;
      }
    });

    const maxVal = Math.max(...Object.values(counts), 4);
    return { days, counts, critCounts, maxVal };
  }, [investigations]);

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'critical':
        return {
          bg: 'rgba(244, 63, 94, 0.1)',
          color: '#f43f5e',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          dot: '#f43f5e'
        };
      case 'high':
        return {
          bg: 'rgba(245, 158, 11, 0.1)',
          color: '#f59e0b',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          dot: '#f59e0b'
        };
      case 'medium':
        return {
          bg: 'rgba(234, 179, 8, 0.1)',
          color: '#eab308',
          border: '1px solid rgba(234, 179, 8, 0.25)',
          dot: '#eab308'
        };
      case 'safe':
      default:
        return {
          bg: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          dot: '#10b981'
        };
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
      {/* ─── Top Header Row ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Threat Intelligence Overview
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Monitor global attack activity, analyze indicators, and investigate emerging cyber threats.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('threat-map')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--accent)',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.12s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          >
            <Radio size={14} strokeWidth={2.2} color="var(--accent)" />
            <span>Global Threat & Data Map</span>
          </button>

          <button
            onClick={onOpenNewAnalysis}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'opacity 0.12s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Plus size={15} strokeWidth={2.4} />
            <span>New analysis</span>
          </button>
        </div>
      </div>

      {/* ─── 5 KPI Metric Cards ─── */}
      <div className="dashboard-kpi-grid">
        {/* Total Analyzed */}
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: '8px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Total analyzed</span>
            <div style={{
              width: '28px', height: '28px', borderRadius: '5px',
              background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShieldAlert size={14} color="#38bdf8" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
              {totalAnalyzedCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Verified analyst targets</div>
          </div>
        </div>

        {/* Critical Threats */}
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: '8px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Critical threats</span>
            <div style={{
              width: '28px', height: '28px', borderRadius: '5px',
              background: 'rgba(248, 81, 73, 0.1)', border: '1px solid rgba(248, 81, 73, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <AlertTriangle size={14} color="#f85149" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
              {criticalThreatsCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Score 85 and above</div>
          </div>
        </div>

        {/* High Risk */}
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: '8px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>High-risk</span>
            <div style={{
              width: '28px', height: '28px', borderRadius: '5px',
              background: 'rgba(227, 179, 65, 0.1)', border: '1px solid rgba(227, 179, 65, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={14} color="#e3b341" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
              {highRiskCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Score 70 to 84</div>
          </div>
        </div>

        {/* Safe Results */}
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: '8px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Safe results</span>
            <div style={{
              width: '28px', height: '28px', borderRadius: '5px',
              background: 'rgba(63, 185, 80, 0.1)', border: '1px solid rgba(63, 185, 80, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShieldCheck size={14} color="#3fb950" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
              {safeCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Verified low/no threat</div>
          </div>
        </div>

        {/* Recent Investigations */}
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: '8px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Active investigations</span>
            <div style={{
              width: '28px', height: '28px', borderRadius: '5px',
              background: 'rgba(137, 87, 229, 0.1)', border: '1px solid rgba(137, 87, 229, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Clock size={14} color="#8957e5" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
              {investigations.length}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Logged in platform</div>
          </div>
        </div>
      </div>

      {/* ─── Middle Row: Threat Activity & Severity Distribution ─── */}
      <div className="dashboard-middle-grid">
        {/* Threat Activity Dual-Wave Chart */}
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Threat activity</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Analyses per day, last 7 days</div>
            </div>

            <div style={{ display: 'flex', background: 'var(--bg-overlay)', borderRadius: '6px', padding: '3px', border: '1px solid var(--border)' }}>
              {['7D', '30D', '90D'].map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    background: timeRange === r ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                    color: timeRange === r ? 'var(--accent)' : 'var(--text-tertiary)',
                    outline: timeRange === r ? '1px solid rgba(56, 189, 248, 0.4)' : 'none',
                    transition: 'all 0.12s ease'
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Wave Chart */}
          <div style={{ width: '100%', height: '190px', position: 'relative' }}>
            <svg viewBox="0 0 600 190" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="purpleWaveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="cyanWaveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Dynamic Grid lines */}
              {[40, 75, 110, 145].map((y, idx) => {
                const tickVal = Math.round(activityDays.maxVal * (1 - idx * 0.25));
                return (
                  <g key={idx}>
                    <line x1="40" y1={y} x2="590" y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
                    <text x="30" y={y + 3} fill="var(--text-tertiary)" fontSize="10" textAnchor="end" fontFamily="var(--font-mono)">
                      {tickVal}
                    </text>
                  </g>
                );
              })}

              {/* Dynamic Wave 1: Total Analyses */}
              <path
                d={`M 80 ${155 - (activityDays.counts['Mon'] / activityDays.maxVal) * 105}
                   C 140 ${155 - (activityDays.counts['Mon'] / activityDays.maxVal) * 105}, 140 ${155 - (activityDays.counts['Tue'] / activityDays.maxVal) * 105}, 200 ${155 - (activityDays.counts['Tue'] / activityDays.maxVal) * 105}
                   C 260 ${155 - (activityDays.counts['Tue'] / activityDays.maxVal) * 105}, 260 ${155 - (activityDays.counts['Wed'] / activityDays.maxVal) * 105}, 320 ${155 - (activityDays.counts['Wed'] / activityDays.maxVal) * 105}
                   C 380 ${155 - (activityDays.counts['Wed'] / activityDays.maxVal) * 105}, 380 ${155 - (activityDays.counts['Thu'] / activityDays.maxVal) * 105}, 440 ${155 - (activityDays.counts['Thu'] / activityDays.maxVal) * 105}
                   C 500 ${155 - (activityDays.counts['Thu'] / activityDays.maxVal) * 105}, 500 ${155 - (activityDays.counts['Fri'] / activityDays.maxVal) * 105}, 560 ${155 - (activityDays.counts['Fri'] / activityDays.maxVal) * 105}
                   L 560 160 L 80 160 Z`}
                fill="url(#purpleWaveGrad)"
              />
              <path
                d={`M 80 ${155 - (activityDays.counts['Mon'] / activityDays.maxVal) * 105}
                   C 140 ${155 - (activityDays.counts['Mon'] / activityDays.maxVal) * 105}, 140 ${155 - (activityDays.counts['Tue'] / activityDays.maxVal) * 105}, 200 ${155 - (activityDays.counts['Tue'] / activityDays.maxVal) * 105}
                   C 260 ${155 - (activityDays.counts['Tue'] / activityDays.maxVal) * 105}, 260 ${155 - (activityDays.counts['Wed'] / activityDays.maxVal) * 105}, 320 ${155 - (activityDays.counts['Wed'] / activityDays.maxVal) * 105}
                   C 380 ${155 - (activityDays.counts['Wed'] / activityDays.maxVal) * 105}, 380 ${155 - (activityDays.counts['Thu'] / activityDays.maxVal) * 105}, 440 ${155 - (activityDays.counts['Thu'] / activityDays.maxVal) * 105}
                   C 500 ${155 - (activityDays.counts['Thu'] / activityDays.maxVal) * 105}, 500 ${155 - (activityDays.counts['Fri'] / activityDays.maxVal) * 105}, 560 ${155 - (activityDays.counts['Fri'] / activityDays.maxVal) * 105}`}
                fill="none"
                stroke="#818cf8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Dynamic Wave 2: Flagged High or Critical */}
              <path
                d={`M 80 ${155 - (activityDays.critCounts['Mon'] / activityDays.maxVal) * 105}
                   C 140 ${155 - (activityDays.critCounts['Mon'] / activityDays.maxVal) * 105}, 140 ${155 - (activityDays.critCounts['Tue'] / activityDays.maxVal) * 105}, 200 ${155 - (activityDays.critCounts['Tue'] / activityDays.maxVal) * 105}
                   C 260 ${155 - (activityDays.critCounts['Tue'] / activityDays.maxVal) * 105}, 260 ${155 - (activityDays.critCounts['Wed'] / activityDays.maxVal) * 105}, 320 ${155 - (activityDays.critCounts['Wed'] / activityDays.maxVal) * 105}
                   C 380 ${155 - (activityDays.critCounts['Wed'] / activityDays.maxVal) * 105}, 380 ${155 - (activityDays.critCounts['Thu'] / activityDays.maxVal) * 105}, 440 ${155 - (activityDays.critCounts['Thu'] / activityDays.maxVal) * 105}
                   C 500 ${155 - (activityDays.critCounts['Thu'] / activityDays.maxVal) * 105}, 500 ${155 - (activityDays.critCounts['Fri'] / activityDays.maxVal) * 105}, 560 ${155 - (activityDays.critCounts['Fri'] / activityDays.maxVal) * 105}
                   L 560 160 L 80 160 Z`}
                fill="url(#cyanWaveGrad)"
              />
              <path
                d={`M 80 ${155 - (activityDays.critCounts['Mon'] / activityDays.maxVal) * 105}
                   C 140 ${155 - (activityDays.critCounts['Mon'] / activityDays.maxVal) * 105}, 140 ${155 - (activityDays.critCounts['Tue'] / activityDays.maxVal) * 105}, 200 ${155 - (activityDays.critCounts['Tue'] / activityDays.maxVal) * 105}
                   C 260 ${155 - (activityDays.critCounts['Tue'] / activityDays.maxVal) * 105}, 260 ${155 - (activityDays.critCounts['Wed'] / activityDays.maxVal) * 105}, 320 ${155 - (activityDays.critCounts['Wed'] / activityDays.maxVal) * 105}
                   C 380 ${155 - (activityDays.critCounts['Wed'] / activityDays.maxVal) * 105}, 380 ${155 - (activityDays.critCounts['Thu'] / activityDays.maxVal) * 105}, 440 ${155 - (activityDays.critCounts['Thu'] / activityDays.maxVal) * 105}
                   C 500 ${155 - (activityDays.critCounts['Thu'] / activityDays.maxVal) * 105}, 500 ${155 - (activityDays.critCounts['Fri'] / activityDays.maxVal) * 105}, 560 ${155 - (activityDays.critCounts['Fri'] / activityDays.maxVal) * 105}`}
                fill="none"
                stroke="#00e5ff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Peak Active Points */}
              <circle cx="560" cy={155 - (activityDays.counts['Fri'] / activityDays.maxVal) * 105} r="4.5" fill="#818cf8" stroke="#06090f" strokeWidth="2" />
              <circle cx="560" cy={155 - (activityDays.critCounts['Fri'] / activityDays.maxVal) * 105} r="4.5" fill="#00e5ff" stroke="#06090f" strokeWidth="2" />

              {/* X Axis Labels */}
              {activityDays.days.map((day, idx) => (
                <text
                  key={day}
                  x={80 + idx * 120}
                  y="180"
                  fill="var(--text-tertiary)"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                >
                  {day}
                </text>
              ))}
            </svg>
          </div>

          {/* Chart Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingTop: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#818cf8' }} />
              <span>Total analyses</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#00e5ff' }} />
              <span>Flagged high or critical</span>
            </div>
          </div>
        </div>

        {/* Severity Distribution Donut Chart */}
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: '14px'
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Severity distribution</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Share of all analyzed indicators</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '170px', position: 'relative' }}>
            <svg viewBox="0 0 160 160" width="160" height="160">
              <circle cx="80" cy="80" r="62" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="15" />
              {/* Safe */}
              {severityStats.lenSafe > 0 && (
                <circle
                  cx="80" cy="80" r="62" fill="none" stroke="#10b981" strokeWidth="15"
                  strokeDasharray={`${severityStats.lenSafe} ${severityStats.circ}`}
                  strokeDashoffset={severityStats.offSafe}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                />
              )}
              {/* Medium */}
              {severityStats.lenMed > 0 && (
                <circle
                  cx="80" cy="80" r="62" fill="none" stroke="#eab308" strokeWidth="15"
                  strokeDasharray={`${severityStats.lenMed} ${severityStats.circ}`}
                  strokeDashoffset={severityStats.offMed}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                />
              )}
              {/* High */}
              {severityStats.lenHigh > 0 && (
                <circle
                  cx="80" cy="80" r="62" fill="none" stroke="#f97316" strokeWidth="15"
                  strokeDasharray={`${severityStats.lenHigh} ${severityStats.circ}`}
                  strokeDashoffset={severityStats.offHigh}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                />
              )}
              {/* Critical */}
              {severityStats.lenCrit > 0 && (
                <circle
                  cx="80" cy="80" r="62" fill="none" stroke="#f43f5e" strokeWidth="15"
                  strokeDasharray={`${severityStats.lenCrit} ${severityStats.circ}`}
                  strokeDashoffset={severityStats.offCrit}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                />
              )}
            </svg>

            {/* Center Label */}
            <div style={{
              position: 'absolute',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>
                {severityStats.dominantPct}%
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {severityStats.dominantLabel}
              </span>
            </div>
          </div>

          {/* Donut Legend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', paddingTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f43f5e' }} />
              <span>Critical <strong>{severityStats.pCrit}%</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f97316' }} />
              <span>High <strong>{severityStats.pHigh}%</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#eab308' }} />
              <span>Medium <strong>{severityStats.pMed}%</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
              <span>Safe <strong>{severityStats.pSafe}%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Lower Row: Top Threat Categories & Quick Actions ─── */}
      <div className="dashboard-lower-grid">
        {/* Top Threat Categories */}
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: '14px'
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Top threat categories</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categoryStats.map(cat => (
              <div key={cat.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: '500' }}>{cat.label}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{cat.count}</span>
                </div>
                <div style={{ width: '100%', height: '5px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${cat.pct}%`,
                    height: '100%',
                    borderRadius: '3px',
                    background: cat.color
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions (2x2 Grid) */}
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: '14px'
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Quick actions</div>
          </div>

          <div className="dashboard-quick-actions-grid" style={{ flex: 1 }}>
            {/* Analyze URL */}
            <button
              onClick={() => onNavigateTab('url-scanner')}
              style={{
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '14px',
                textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '5px',
                background: 'rgba(129, 140, 248, 0.12)', border: '1px solid rgba(129, 140, 248, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Link2 size={14} color="#818cf8" />
              </div>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)' }}>Analyze a URL</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>SSRF protection & redirect tracer</div>
              </div>
            </button>

            {/* Investigate IP */}
            <button
              onClick={() => onNavigateTab('ip-scanner')}
              style={{
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '14px',
                textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '5px',
                background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Terminal size={14} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)' }}>Investigate an IP</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>GeoIP, ASN, DNSBL & Port probe</div>
              </div>
            </button>

            {/* Check a Domain */}
            <button
              onClick={() => onNavigateTab('domain-scanner')}
              style={{
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '14px',
                textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '5px',
                background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Globe size={14} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)' }}>Check a domain</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>DNS records, RDAP, SSL & DGA</div>
              </div>
            </button>

            {/* PDF Threat Research */}
            <button
              onClick={() => onNavigateTab('pdf-research')}
              style={{
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '14px',
                textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '5px',
                background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FileText size={14} color="#eab308" />
              </div>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)' }}>PDF Threat Research</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>TTPMapper MITRE & IOC extractor</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Bottom Full-Width Card: Recent Threats ─── */}
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '16px 20px',
        display: 'flex', flexDirection: 'column', gap: '14px'
      }}>
        {/* Table Header & Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Recent threats</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '6px 12px', width: '220px'
            }}>
              <Search size={14} color="var(--text-tertiary)" />
              <input
                type="text"
                placeholder="Search indicator or type"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: '12px', width: '100%'
                }}
              />
            </div>

            {/* Severity Filter Pills */}
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

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '820px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-tertiary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 14px' }}>Indicator</th>
                <th style={{ padding: '12px 14px' }}>Threat Type</th>
                <th style={{ padding: '12px 14px' }}>Risk Score</th>
                <th style={{ padding: '12px 14px' }}>Severity</th>
                <th style={{ padding: '12px 14px' }}>Detected</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredThreats.length > 0 ? (
                filteredThreats.map(t => {
                  const sevStyle = getSeverityStyle(t.severity);
                  const scoreColor = getScoreColor(t.riskScore);

                  return (
                    <tr
                      key={t.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        fontSize: '12.5px',
                        transition: 'background 0.12s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Indicator */}
                      <td style={{ padding: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: '500' }}>
                        {t.indicator}
                      </td>

                      {/* Threat Type */}
                      <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                        {t.threatType}
                      </td>

                      {/* Risk Score */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: scoreColor, width: '22px' }}>
                            {t.riskScore}
                          </span>
                          <div style={{ width: '60px', height: '4px', borderRadius: '2px', background: 'rgba(255, 255, 255, 0.08)' }}>
                            <div style={{ width: `${Math.min(100, Math.max(0, t.riskScore))}%`, height: '100%', borderRadius: '2px', background: scoreColor }} />
                          </div>
                        </div>
                      </td>

                      {/* Severity Pill */}
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          background: sevStyle.bg, border: sevStyle.border, color: sevStyle.color,
                          padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600'
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sevStyle.dot }} />
                          {t.severity}
                        </span>
                      </td>

                      {/* Detected */}
                      <td style={{ padding: '14px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                        {t.detected}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          color: t.status === 'Blocked' ? '#f43f5e' : t.status === 'Verified Safe' ? '#10b981' : 'var(--text-primary)',
                          fontWeight: '500', fontSize: '12px'
                        }}>
                          {t.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            if (onSelectIndicator) onSelectIndicator(t);
                            onNavigateTab('intelligence');
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent)',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            transition: 'all 0.12s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                          <span>View details</span>
                          <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 14px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                    {isLoading ? 'Loading active threat investigations...' : 'No matching scanned indicators found. Run an IP, Domain, or URL scan to populate verified telemetry.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
          <span>Showing {filteredThreats.length} of {investigations.length} verified investigations</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setPage(1)}
              style={{
                width: '28px', height: '28px', borderRadius: '6px',
                border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              &lt;
            </button>

            <button
              style={{
                width: '28px', height: '28px', borderRadius: '6px',
                border: '1px solid rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--accent)', cursor: 'pointer', fontSize: '11px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              1
            </button>

            <button
              onClick={() => setPage(2)}
              style={{
                width: '28px', height: '28px', borderRadius: '6px',
                border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              2
            </button>

            <button
              onClick={() => setPage(2)}
              style={{
                width: '28px', height: '28px', borderRadius: '6px',
                border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
