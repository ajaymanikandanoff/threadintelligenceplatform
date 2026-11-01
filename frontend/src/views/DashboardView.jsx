import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';
import GlobalThreatMap from '../components/GlobalThreatMap';

const INITIAL_RECENT_THREATS = [
  {
    id: 1,
    indicator: 'hxxp://secure-login.example-verify.com',
    threatType: 'Phishing',
    riskScore: 94,
    severity: 'critical',
    detected: '2 min ago',
    status: 'Blocked',
    type: 'URL'
  },
  {
    id: 2,
    indicator: '203.0.113.42',
    threatType: 'C2 server',
    riskScore: 88,
    severity: 'critical',
    detected: '14 min ago',
    status: 'Investigating',
    type: 'IP'
  },
  {
    id: 3,
    indicator: 'files-share.example.co',
    threatType: 'Malware distribution',
    riskScore: 81,
    severity: 'high',
    detected: '41 min ago',
    status: 'Open',
    type: 'Domain'
  },
  {
    id: 4,
    indicator: 'login-update.example.net',
    threatType: 'Credential harvesting',
    riskScore: 76,
    severity: 'high',
    detected: '1 h ago',
    status: 'Investigating',
    type: 'URL'
  },
  {
    id: 5,
    indicator: '198.51.100.17',
    threatType: 'Port scanning',
    riskScore: 58,
    severity: 'medium',
    detected: '2 h ago',
    status: 'Resolved',
    type: 'IP'
  },
  {
    id: 6,
    indicator: '192.0.2.88',
    threatType: 'Brute force',
    riskScore: 52,
    severity: 'medium',
    detected: '3 h ago',
    status: 'Open',
    type: 'IP'
  },
  {
    id: 7,
    indicator: 'cdn.example.org',
    threatType: 'No threat found',
    riskScore: 6,
    severity: 'safe',
    detected: '5 h ago',
    status: 'Resolved',
    type: 'Domain'
  }
];

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

  // Filtered threats list
  const filteredThreats = INITIAL_RECENT_THREATS.filter(t => {
    const matchSev = filterSeverity === 'All' || t.severity.toLowerCase() === filterSeverity.toLowerCase();
    const matchQ = !searchQuery ||
      t.indicator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.threatType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSev && matchQ;
  });

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '7px 14px', borderRadius: '20px',
            fontSize: '12px', color: '#10b981', fontWeight: '600'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span>API status <strong style={{ color: 'var(--text-primary)' }}>Online</strong></span>
          </div>

          <button
            onClick={onOpenNewAnalysis}
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
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.35)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(6, 182, 212, 0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(6, 182, 212, 0.35)'; }}
          >
            <Plus size={16} strokeWidth={2.6} />
            <span>New analysis</span>
          </button>
        </div>
      </div>

      {/* ─── 5 KPI Metric Cards ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        {/* Total Analyzed */}
        <div style={{
          background: 'var(--bg-glass-card)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '18px 20px',
          display: 'flex', flexDirection: 'column', gap: '10px',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Total analyzed</span>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShieldAlert size={16} color="var(--accent)" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>12,480</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>All indicators to date</div>
          </div>
        </div>

        {/* Critical Threats */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(244, 63, 94, 0.05) 0%, var(--bg-glass-card) 100%)',
          border: '1px solid rgba(244, 63, 94, 0.18)',
          borderRadius: '14px',
          padding: '18px 20px',
          display: 'flex', flexDirection: 'column', gap: '10px',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Critical threats</span>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <AlertTriangle size={16} color="#f43f5e" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>214</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Score 85 and above</div>
          </div>
        </div>

        {/* High Risk */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, var(--bg-glass-card) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.18)',
          borderRadius: '14px',
          padding: '18px 20px',
          display: 'flex', flexDirection: 'column', gap: '10px',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>High-risk</span>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={16} color="#f59e0b" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>1,036</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Score 70 to 84</div>
          </div>
        </div>

        {/* Safe Results */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, var(--bg-glass-card) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.18)',
          borderRadius: '14px',
          padding: '18px 20px',
          display: 'flex', flexDirection: 'column', gap: '10px',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Safe results</span>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShieldCheck size={16} color="#10b981" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>9,871</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>No threat indicators</div>
          </div>
        </div>

        {/* Recent Investigations */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(129, 140, 248, 0.05) 0%, var(--bg-glass-card) 100%)',
          border: '1px solid rgba(129, 140, 248, 0.18)',
          borderRadius: '14px',
          padding: '18px 20px',
          display: 'flex', flexDirection: 'column', gap: '10px',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Recent investigations</span>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(129, 140, 248, 0.15)', border: '1px solid rgba(129, 140, 248, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Clock size={16} color="#818cf8" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>58</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Opened this week</div>
          </div>
        </div>
      </div>

      {/* ─── Global Threat Activity & Attack Origins World Map ─── */}
      <GlobalThreatMap
        onSelectCountry={(hotspot) => {
          if (hotspot && onSelectIndicator) {
            onSelectIndicator({
              type: 'country',
              value: hotspot.country,
              threatLevel: hotspot.threatLevel,
              details: hotspot
            });
          }
        }}
      />

      {/* ─── Middle Row: Threat Activity & Severity Distribution ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)',
        gap: '16px'
      }}>
        {/* Threat Activity Dual-Wave Chart */}
        <div style={{
          background: 'var(--bg-glass-card)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '22px 24px',
          display: 'flex', flexDirection: 'column', gap: '16px'
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

              {/* Grid lines */}
              {[40, 75, 110, 145].map((y, idx) => (
                <g key={idx}>
                  <line x1="40" y1={y} x2="590" y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
                  <text x="30" y={y + 3} fill="var(--text-tertiary)" fontSize="10" textAnchor="end" fontFamily="var(--font-mono)">
                    {idx === 0 ? '400' : idx === 1 ? '300' : idx === 2 ? '200' : '100'}
                  </text>
                </g>
              ))}

              {/* Wave 1: Total Analyses (Purple) */}
              <path
                d="M 60 140 C 130 130, 170 125, 210 115 C 250 100, 270 70, 310 65 C 350 60, 380 90, 430 85 C 480 80, 520 75, 580 70 L 580 160 L 60 160 Z"
                fill="url(#purpleWaveGrad)"
              />
              <path
                d="M 60 140 C 130 130, 170 125, 210 115 C 250 100, 270 70, 310 65 C 350 60, 380 90, 430 85 C 480 80, 520 75, 580 70"
                fill="none"
                stroke="#818cf8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Peak Point on Wave 1 */}
              <circle cx="310" cy="65" r="4.5" fill="#818cf8" stroke="#06090f" strokeWidth="2" />

              {/* Wave 2: Flagged High or Critical (Cyan) */}
              <path
                d="M 60 155 C 130 150, 170 145, 210 135 C 250 125, 270 115, 310 110 C 350 105, 380 120, 430 115 C 480 110, 520 100, 580 95 L 580 160 L 60 160 Z"
                fill="url(#cyanWaveGrad)"
              />
              <path
                d="M 60 155 C 130 150, 170 145, 210 135 C 250 125, 270 115, 310 110 C 350 105, 380 120, 430 115 C 480 110, 520 100, 580 95"
                fill="none"
                stroke="#00e5ff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Peak Point on Wave 2 */}
              <circle cx="310" cy="110" r="4.5" fill="#00e5ff" stroke="#06090f" strokeWidth="2" />

              {/* X Axis Labels */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => (
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
          background: 'var(--bg-glass-card)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '22px 24px',
          display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Severity distribution</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Share of all analyzed indicators</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '170px', position: 'relative' }}>
            <svg viewBox="0 0 160 160" width="160" height="160">
              <circle cx="80" cy="80" r="62" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="15" />
              {/* Safe: 45% (Circumference ~ 389.5, stroke-dasharray) */}
              <circle
                cx="80" cy="80" r="62" fill="none" stroke="#10b981" strokeWidth="15"
                strokeDasharray="175 390" strokeDashoffset="0" strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
              {/* Medium: 27% */}
              <circle
                cx="80" cy="80" r="62" fill="none" stroke="#eab308" strokeWidth="15"
                strokeDasharray="105 390" strokeDashoffset="-180" strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
              {/* High: 20% */}
              <circle
                cx="80" cy="80" r="62" fill="none" stroke="#f97316" strokeWidth="15"
                strokeDasharray="78 390" strokeDashoffset="-290" strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
              {/* Critical: 8% */}
              <circle
                cx="80" cy="80" r="62" fill="none" stroke="#f43f5e" strokeWidth="15"
                strokeDasharray="31 390" strokeDashoffset="-372" strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
            </svg>

            {/* Center Label */}
            <div style={{
              position: 'absolute',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>8%</span>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>critical</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', paddingTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f43f5e' }} />
              <span>Critical <strong>8%</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f97316' }} />
              <span>High <strong>20%</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#eab308' }} />
              <span>Medium <strong>27%</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
              <span>Safe <strong>45%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Lower Row: Top Threat Categories & Quick Actions ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '16px'
      }}>
        {/* Top Threat Categories */}
        <div style={{
          background: 'var(--bg-glass-card)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '22px 24px',
          display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Top threat categories</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Phishing', count: 412, pct: 85, color: '#38bdf8' },
              { label: 'Malware distribution', count: 301, pct: 64, color: '#38bdf8' },
              { label: 'Command and control', count: 188, pct: 40, color: 'linear-gradient(90deg, #38bdf8, #818cf8)' },
              { label: 'Credential harvesting', count: 142, pct: 30, color: '#818cf8' },
              { label: 'Port scanning', count: 97, pct: 20, color: '#3b82f6' },
            ].map(cat => (
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
          background: 'var(--bg-glass-card)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '22px 24px',
          display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Quick actions</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
            {/* Analyze URL */}
            <button
              onClick={() => onNavigateTab('url-scanner')}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(129, 140, 248, 0.15)', border: '1px solid rgba(129, 140, 248, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Link2 size={16} color="#818cf8" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Analyze a URL</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>SSRF protection & redirect tracer</div>
              </div>
            </button>

            {/* Investigate IP */}
            <button
              onClick={() => onNavigateTab('ip-scanner')}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Terminal size={16} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Investigate an IP</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>GeoIP, ASN, DNSBL & Port probe</div>
              </div>
            </button>

            {/* Check a Domain */}
            <button
              onClick={() => onNavigateTab('domain-scanner')}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Globe size={16} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Check a domain</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>DNS records, RDAP, SSL & DGA</div>
              </div>
            </button>

            {/* PDF Threat Research */}
            <button
              onClick={() => onNavigateTab('pdf-research')}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FileText size={16} color="#eab308" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>PDF Threat Research</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>TTPMapper MITRE & IOC extractor</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Bottom Full-Width Card: Recent Threats ─── */}
      <div style={{
        background: 'var(--bg-glass-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '22px 24px',
        display: 'flex', flexDirection: 'column', gap: '16px'
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
              {filteredThreats.map(t => {
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
                          <div style={{ width: `${t.riskScore}%`, height: '100%', borderRadius: '2px', background: scoreColor }} />
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
                        color: t.status === 'Blocked' ? '#f43f5e' : t.status === 'Resolved' ? '#10b981' : 'var(--text-primary)',
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
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
          <span>Showing {filteredThreats.length} of 58 investigations</span>

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
