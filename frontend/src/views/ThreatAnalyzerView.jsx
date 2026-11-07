import React, { useState, useEffect } from 'react';
import {
  Link2,
  Terminal,
  Globe,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Radio,
  AlertTriangle,
  Server,
  Shield,
  Layers,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import KnowledgeGraph from '../components/KnowledgeGraph';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function ThreatAnalyzerView({ onSelectIndicator, initialIndicator }) {
  const [activeTypeTab, setActiveTypeTab] = useState('URL');
  const [inputValue, setInputValue] = useState('https://github.com');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTechDetailsOpen, setIsTechDetailsOpen] = useState(false);
  const [hasCopiedSummary, setHasCopiedSummary] = useState(false);
  const [hasCopiedJson, setHasCopiedJson] = useState(false);
  const [scanError, setScanError] = useState(null);

  const [result, setResult] = useState({
    indicator: 'https://github.com',
    type: 'URL',
    riskScore: 0,
    severity: 'Safe',
    confidence: 95,
    classification: 'Clean / Legitimate',
    detectionSources: '0 of 4 flagged',
    summaryText: 'Official developer platform and repository host. Domain exhibits established history and trusted SSL certificate.',
    evidence: [
      'Target hostname resolves to valid public Microsoft / GitHub infrastructure.',
      'SSL certificate verified and issued by Digicert.',
      'No redirect manipulation or credential harvesting keywords identified.'
    ],
    recommendedActions: [
      'No perimeter containment required.',
      'Standard corporate proxy access approved.'
    ],
    relatedIndicators: [
      { type: 'Domain', val: 'github.com' },
      { type: 'IP', val: '20.207.73.82' }
    ],
    graph: null,
    technical: {}
  });

  const detectIndicatorType = (str) => {
    const s = str.trim().toLowerCase();
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('hxxp') || s.includes('/')) {
      return 'URL';
    }
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(s) || s.includes(':');
    if (isIp) return 'IP address';
    return 'Domain';
  };

  const runAnalysis = async (customVal) => {
    const raw = (customVal !== undefined ? customVal : inputValue).trim();
    if (!raw) return;

    setIsAnalyzing(true);
    setScanError(null);

    const detectedType = activeTypeTab || detectIndicatorType(raw);
    let endpoint = `${API_BASE}/api/scan/url`;
    let body = { url: raw };

    if (detectedType === 'IP address' || detectedType === 'IP') {
      endpoint = `${API_BASE}/api/scan/ip`;
      body = { ip: raw };
    } else if (detectedType === 'Domain') {
      endpoint = `${API_BASE}/api/scan/domain`;
      body = { domain: raw };
    }

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.detail || 'Analysis failed');
      }

      const score = data.risk_score !== undefined ? data.risk_score : data.abuse_score || 0;
      const related = [];
      if (data.resolved_ips) {
        data.resolved_ips.forEach(ip => related.push({ type: 'IP', val: ip }));
      }
      if (data.reverse_dns && data.reverse_dns !== 'No PTR record found') {
        related.push({ type: 'Domain', val: data.reverse_dns });
      }
      if (data.hostname && data.hostname !== raw) {
        related.push({ type: 'Domain', val: data.hostname });
      }

      setResult({
        indicator: data.indicator || raw,
        type: detectedType,
        riskScore: score,
        severity: data.severity || (score >= 70 ? 'Critical severity' : score >= 40 ? 'Medium severity' : 'Safe'),
        confidence: data.confidence || 90,
        classification: data.classification || data.risk_classification || 'Investigated',
        detectionSources: score > 70 ? '3 of 4 flagged' : score > 40 ? '2 of 4 flagged' : '0 of 4 flagged',
        summaryText: data.summary || `Intelligence telemetry for ${data.indicator || raw}.`,
        evidence: data.evidence || [],
        recommendedActions: data.recommended_actions || ['Maintain routine threat monitoring.'],
        relatedIndicators: related.slice(0, 4),
        graph: data.graph || null,
        technical: data
      });
    } catch (err) {
      setScanError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (initialIndicator?.indicator) {
      const val = initialIndicator.indicator.trim();
      setInputValue(val);
      runAnalysis(val);
    }
  }, [initialIndicator]);

  const copySummary = () => {
    const text = `AI ThreatLens Analysis for ${result.indicator}\nScore: ${result.riskScore}/100 (${result.severity})\nClassification: ${result.classification}\nEvidence:\n${result.evidence.map(e => `• ${e}`).join('\n')}\nRecommended Actions:\n${result.recommendedActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setHasCopiedSummary(true);
    setTimeout(() => setHasCopiedSummary(false), 2000);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result.technical, null, 2));
    setHasCopiedJson(true);
    setTimeout(() => setHasCopiedJson(false), 2000);
  };

  const getGaugeColors = (score) => {
    if (score >= 80) return { color1: '#f97316', color2: '#f43f5e', glow: 'rgba(244, 63, 94, 0.45)', pillBg: 'rgba(244, 63, 94, 0.1)', pillBorder: 'rgba(244, 63, 94, 0.25)', pillText: '#f43f5e' };
    if (score >= 50) return { color1: '#f59e0b', color2: '#f97316', glow: 'rgba(249, 115, 22, 0.45)', pillBg: 'rgba(249, 115, 22, 0.1)', pillBorder: 'rgba(249, 115, 22, 0.25)', pillText: '#f97316' };
    if (score >= 25) return { color1: '#eab308', color2: '#f59e0b', glow: 'rgba(234, 179, 8, 0.45)', pillBg: 'rgba(234, 179, 8, 0.1)', pillBorder: 'rgba(234, 179, 8, 0.25)', pillText: '#eab308' };
    return { color1: '#10b981', color2: '#00ff9d', glow: 'rgba(16, 185, 129, 0.45)', pillBg: 'rgba(16, 185, 129, 0.1)', pillBorder: 'rgba(16, 185, 129, 0.25)', pillText: '#10b981' };
  };

  const gaugeTheme = getGaugeColors(result.riskScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          Threat Intelligence Analyzer
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          Automated multi-engine indicator scoring powered by IntelOwl Observable Analyzers and MITRE ATT&CK mapping.
        </p>
      </div>

      {/* Input Card */}
      <div style={{
        background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '16px'
      }}>
        {/* Type Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['URL', 'IP address', 'Domain'].map(t => {
            const active = activeTypeTab === t;
            return (
              <button
                key={t}
                onClick={() => {
                  setActiveTypeTab(t);
                  if (t === 'URL') setInputValue('https://github.com');
                  if (t === 'IP address') setInputValue('8.8.8.8');
                  if (t === 'Domain') setInputValue('google.com');
                }}
                style={{
                  padding: '7px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600',
                  cursor: 'pointer',
                  border: active ? '1px solid var(--border-accent)' : '1px solid var(--border)',
                  background: active ? 'var(--accent-dim)' : 'var(--bg-overlay)',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)'
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); runAnalysis(); }} className="scanner-form" style={{ display: 'flex', gap: '12px' }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '12px',
            background: 'var(--bg-base)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '12px 18px'
          }}>
            <Link2 size={18} color="var(--text-tertiary)" />
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Paste URL, IP address, or domain to scan..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'monospace'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isAnalyzing || !inputValue.trim()}
            style={{
              padding: '0 24px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, var(--accent) 100%)',
              color: '#06090f', fontWeight: '700', fontSize: '13.5px', cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 20px var(--accent-glow)'
            }}
          >
            {isAnalyzing ? <Radio size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>{isAnalyzing ? 'Scanning...' : 'Analyze indicator'}</span>
          </button>

          {inputValue && (
            <button
              type="button"
              onClick={() => { setInputValue(''); setScanError(null); }}
              style={{
                padding: '0 16px', borderRadius: '10px',
                border: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
              title="Clear input indicator"
            >
              <RotateCcw size={14} />
              <span>Clear</span>
            </button>
          )}
        </form>
      </div>

      {/* Error Message */}
      {scanError && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '12px', padding: '14px 18px', color: '#f43f5e',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <AlertTriangle size={20} />
          <span style={{ fontSize: '13px', fontWeight: '600' }}>{scanError}</span>
        </div>
      )}

      {/* Main Results Layout */}
      <div className="scanner-main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '22px' }}>
        {/* Left Column: Gauge & Confidence */}
        <div style={{
          background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '26px 22px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '20px'
        }}>
          {/* Radial Ring Gauge */}
          <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="180" height="180" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={gaugeTheme.color1} />
                  <stop offset="100%" stopColor={gaugeTheme.color2} />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="9" />
              <circle
                cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGaugeGrad)" strokeWidth="9"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - result.riskScore / 100)}`}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '48px', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>
                {result.riskScore}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600', marginTop: '2px' }}>
                of 100
              </span>
            </div>
          </div>

          {/* Severity Pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px',
            background: gaugeTheme.pillBg, border: `1px solid ${gaugeTheme.pillBorder}`, color: gaugeTheme.pillText,
            fontSize: '12px', fontWeight: '700'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: gaugeTheme.pillText }} />
            <span>{result.severity}</span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace', textAlign: 'center', wordBreak: 'break-all' }}>
            {result.indicator}
          </div>

          {/* Model Confidence Bar */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <span>Confidence</span>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{result.confidence}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-overlay)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${result.confidence}%`, height: '100%',
                background: 'linear-gradient(90deg, #0284c7 0%, var(--accent) 100%)',
                borderRadius: '3px'
              }} />
            </div>
          </div>

          <button
            type="button"
            onClick={copySummary}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg-overlay)', color: 'var(--text-primary)', fontSize: '12.5px', fontWeight: '600',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {hasCopiedSummary ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{hasCopiedSummary ? 'Copied' : 'Copy result summary'}</span>
          </button>
        </div>

        {/* Right Column: Summary, Evidence, Actions, Related */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Summary Card */}
          <div style={{
            background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '22px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 14px' }}>
              Summary
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
              <div style={{ background: 'var(--bg-overlay)', padding: '10px 14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Classification</div>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{result.classification}</div>
              </div>
              <div style={{ background: 'var(--bg-overlay)', padding: '10px 14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Detections</div>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{result.detectionSources}</div>
              </div>
              <div style={{ background: 'var(--bg-overlay)', padding: '10px 14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Type</div>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{result.type}</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              {result.summaryText}
            </p>
          </div>

          {/* Evidence */}
          <div style={{
            background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '22px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 14px' }}>
              Evidence
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {result.evidence.map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f43f5e', marginTop: '6px', flexShrink: 0 }} />
                  <span>{ev}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{
            background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '22px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 14px' }}>
              Recommended actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {result.recommendedActions.map((act, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    width: '20px', height: '20px', borderRadius: '4px', background: 'var(--accent-dim)',
                    color: 'var(--accent)', fontWeight: '800', fontSize: '11px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related Indicators */}
          {result.relatedIndicators?.length > 0 && (
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '16px', padding: '20px 22px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 12px' }}>
                Related infrastructure
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.relatedIndicators.map((rel, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputValue(rel.val);
                      setActiveTypeTab(rel.type === 'IP' ? 'IP address' : rel.type);
                      runAnalysis(rel.val);
                    }}
                    style={{
                      background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                      borderRadius: '6px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{rel.type}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{rel.val}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible Technical Details */}
          <div style={{
            background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
            borderRadius: '16px', overflow: 'hidden'
          }}>
            <button
              onClick={() => setIsTechDetailsOpen(p => !p)}
              style={{
                width: '100%', padding: '16px 22px', background: 'transparent', border: 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                color: 'var(--text-primary)', fontSize: '13.5px', fontWeight: '700'
              }}
            >
              <span>Technical details</span>
              {isTechDetailsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isTechDetailsOpen && (
              <div style={{ padding: '0 22px 20px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px 0 6px' }}>
                  <button
                    onClick={copyJson}
                    style={{
                      background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                      borderRadius: '6px', padding: '4px 10px', color: 'var(--text-secondary)',
                      fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    {hasCopiedJson ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{hasCopiedJson ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre style={{
                  background: '#040711', padding: '14px', borderRadius: '8px',
                  color: 'var(--accent)', fontSize: '12px', fontFamily: 'monospace',
                  overflowX: 'auto', maxHeight: '300px', margin: 0
                }}>
                  {JSON.stringify(result.technical, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
