import React, { useState } from 'react';
import {
  Link2,
  Terminal,
  Globe,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader
} from 'lucide-react';

export default function ThreatAnalyzerView({ initialIndicator, onAnalyzeReport, isAnalyzingBackend }) {
  const [activeTypeTab, setActiveTypeTab] = useState('URL');
  const [inputValue, setInputValue] = useState(
    initialIndicator?.indicator || 'https://suspicious-link.example.com/login'
  );
  const [hasCopiedSummary, setHasCopiedSummary] = useState(false);
  const [hasCopiedJson, setHasCopiedJson] = useState(false);
  const [isJsonOpen, setIsJsonOpen] = useState(true);
  const [isLocalAnalyzing, setIsLocalAnalyzing] = useState(false);

  // Analysis result state
  const [result, setResult] = useState({
    indicator: 'hxxp://secure-login.example-verify.com',
    type: 'URL',
    riskScore: 87,
    severity: 'Critical severity',
    confidence: 92,
    classification: 'Phishing',
    detectionSources: '3 of 4 flagged',
    summaryText: 'The URL shows several traits common to credential-harvesting pages. Review the evidence below before taking action.',
    evidence: [
      'Domain imitates a login portal and uses a lookalike keyword in the hostname.',
      'Page requests credentials over a form that posts to a different host.',
      'Domain registered recently with privacy-protected WHOIS.',
      'Hosting IP shares infrastructure with previously flagged indicators.'
    ],
    recommendedActions: [
      'Block the URL and its hostname at the proxy and DNS filter.',
      'Search mail and web logs for users who visited it.',
      'Reset credentials for any account that submitted the form.'
    ],
    relatedIndicators: [
      { type: 'IP', val: '203.0.113.42' },
      { type: 'Domain', val: 'example-verify.com' },
      { type: 'IP', val: '198.51.100.17' },
      { type: 'URL', val: 'hxxp://login-update.example.net' }
    ]
  });

  const handleAnalyze = async () => {
    if (!inputValue.trim()) return;
    setIsLocalAnalyzing(true);

    // Defang display
    const defanged = inputValue
      .replace(/http:\/\//gi, 'hxxp://')
      .replace(/https:\/\//gi, 'hxxps://')
      .replace(/\./g, '.');

    // Simulate analysis or optionally call backend
    setTimeout(() => {
      let score = 87;
      let classification = 'Phishing';
      let sev = 'Critical severity';
      if (activeTypeTab === 'IP address') {
        score = 88;
        classification = 'Command & Control';
      } else if (activeTypeTab === 'Domain') {
        score = 81;
        classification = 'Malware distribution';
      }

      setResult(prev => ({
        ...prev,
        indicator: defanged,
        type: activeTypeTab,
        riskScore: score,
        classification,
        severity: sev
      }));
      setIsLocalAnalyzing(false);
    }, 600);

    // If onAnalyzeReport passed, trigger full backend telemetry extraction
    if (onAnalyzeReport) {
      onAnalyzeReport(`Incident Report: Suspicious indicator observed in corporate perimeter telemetry.\nIndicator: ${inputValue}\nType: ${activeTypeTab}\nObserved automated beaconing and credential harvesting behavior.`, `Analysis: ${inputValue}`);
    }
  };

  const handleClear = () => {
    setInputValue('');
  };

  const handleExampleClick = (ex, type) => {
    setActiveTypeTab(type);
    setInputValue(ex);
  };

  const copySummary = () => {
    const text = `ThreatLens Analysis for ${result.indicator}\nScore: ${result.riskScore}/100 (${result.severity})\nClassification: ${result.classification}\nEvidence:\n${result.evidence.map(e => `• ${e}`).join('\n')}\nRecommended Actions:\n${result.recommendedActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setHasCopiedSummary(true);
    setTimeout(() => setHasCopiedSummary(false), 2000);
  };

  const technicalJson = {
    indicator: result.indicator,
    type: result.type.toLowerCase(),
    risk_score: result.riskScore,
    classification: result.classification.toLowerCase(),
    confidence: result.confidence / 100,
    sources: ['model', 'telemetry', 'whois', 'passive_dns']
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(technicalJson, null, 2));
    setHasCopiedJson(true);
    setTimeout(() => setHasCopiedJson(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ─── Top Header ─── */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          Threat Intelligence Analyzer
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          Analyze suspicious indicators and understand potential cyber threats.
        </p>
      </div>

      {/* ─── Top Input Container Card ─── */}
      <div style={{
        background: 'var(--bg-glass-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '22px 26px',
        display: 'flex', flexDirection: 'column', gap: '16px'
      }}>
        {/* Indicator Type Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['URL', 'IP address', 'Domain'].map(t => {
            const active = activeTypeTab === t;
            return (
              <button
                key={t}
                onClick={() => setActiveTypeTab(t)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: active ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid var(--border)',
                  background: active ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-overlay)',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'all 0.12s ease'
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Input & Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '11px 16px', flex: 1, minWidth: '300px'
          }}>
            {activeTypeTab === 'URL' && <Link2 size={16} color="var(--accent)" />}
            {activeTypeTab === 'IP address' && <Terminal size={16} color="var(--accent)" />}
            {activeTypeTab === 'Domain' && <Globe size={16} color="var(--accent)" />}
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={
                activeTypeTab === 'URL'
                  ? 'https://suspicious-link.example.com/login'
                  : activeTypeTab === 'IP address'
                  ? '203.0.113.42'
                  : 'files-share.example.co'
              }
              onKeyDown={e => { if (e.key === 'Enter') handleAnalyze(); }}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                width: '100%'
              }}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLocalAnalyzing || isAnalyzingBackend}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '11px 24px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: (isLocalAnalyzing || isAnalyzingBackend) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            {(isLocalAnalyzing || isAnalyzingBackend) ? <Loader size={16} className="spin" /> : <Sparkles size={16} />}
            <span>Analyze indicator</span>
          </button>

          <button
            onClick={handleClear}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              borderRadius: '10px',
              padding: '11px 20px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.12s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Clear
          </button>
        </div>

        {/* Try an Example Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Try an example:</span>
          <button
            onClick={() => handleExampleClick('http://login-check.example.net', 'URL')}
            style={{
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              cursor: 'pointer'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            http://login-check.example.net
          </button>

          <button
            onClick={() => handleExampleClick('https://files.example.org/invoice', 'URL')}
            style={{
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              cursor: 'pointer'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            https://files.example.org/invoice
          </button>
        </div>
      </div>

      {/* ─── Preview Notice Banner ─── */}
      <div style={{
        background: 'rgba(129, 140, 248, 0.08)',
        border: '1px solid rgba(129, 140, 248, 0.22)',
        borderRadius: '10px',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <span style={{
          background: 'rgba(129, 140, 248, 0.2)',
          color: 'var(--purple)',
          fontSize: '10.5px',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          Sample result
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Layout preview of how a completed analysis will appear. Real values come from your backend response.
        </span>
      </div>

      {/* ─── Two-Column Analysis Results Grid ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 2fr)',
        gap: '20px'
      }}>
        {/* Left Column: Radial Score Gauge & Summary Card */}
        <div style={{
          background: 'var(--bg-glass-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '28px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '20px', textAlign: 'center'
        }}>
          {/* Circular SVG Gauge */}
          <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 160 160" width="180" height="180">
              <defs>
                <linearGradient id="scoreGaugeGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>
              {/* Background track */}
              <circle
                cx="80" cy="80" r="64"
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="14"
              />
              {/* Glowing active arc (87%) */}
              <circle
                cx="80" cy="80" r="64"
                fill="none"
                stroke="url(#scoreGaugeGrad)"
                strokeWidth="14"
                strokeDasharray="402"
                strokeDashoffset={402 - (402 * result.riskScore) / 100}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
                style={{ filter: 'drop-shadow(0 0 12px rgba(244, 63, 94, 0.45))' }}
              />
            </svg>

            {/* Score in Center */}
            <div style={{
              position: 'absolute',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '42px', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>
                {result.riskScore}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                of 100
              </span>
            </div>
          </div>

          {/* Severity Pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            color: '#f43f5e',
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f43f5e' }} />
            <span>{result.severity}</span>
          </div>

          {/* Indicator text */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
            wordBreak: 'break-all'
          }}>
            {result.indicator}
          </div>

          {/* Model Confidence Progress Bar */}
          <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Model confidence</span>
              <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{result.confidence}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
              <div style={{
                width: `${result.confidence}%`,
                height: '100%',
                borderRadius: '3px',
                background: 'linear-gradient(90deg, #00e5ff 0%, #818cf8 100%)'
              }} />
            </div>
          </div>

          {/* Copy Result Summary Button */}
          <button
            onClick={copySummary}
            style={{
              width: '100%', maxWidth: '280px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.12s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {hasCopiedSummary ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{hasCopiedSummary ? 'Copied to clipboard' : 'Copy result summary'}</span>
          </button>
        </div>

        {/* Right Column: Stacked Analysis Detail Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Card A: Summary */}
          <div style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '20px 24px',
            display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Summary</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <div style={{ background: 'var(--bg-overlay)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>Classification</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{result.classification}</div>
              </div>
              <div style={{ background: 'var(--bg-overlay)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>Detection sources</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{result.detectionSources}</div>
              </div>
              <div style={{ background: 'var(--bg-overlay)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>Indicator type</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{result.type}</div>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
              {result.summaryText}
            </p>
          </div>

          {/* Card B: Evidence */}
          <div style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '20px 24px',
            display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Evidence</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {result.evidence.map((ev, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#f43f5e', boxShadow: '0 0 6px #f43f5e',
                    marginTop: '6px', flexShrink: 0
                  }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {ev}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card C: Recommended actions */}
          <div style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '20px 24px',
            display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Recommended actions</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {result.recommendedActions.map((act, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '6px',
                    background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: 'var(--accent)', fontSize: '11px', fontWeight: '800',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {act}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card D: Related indicators */}
          <div style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '20px 24px',
            display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Related indicators</div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {result.relatedIndicators.map((rel, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                    padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px',
                    fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)'
                  }}
                >
                  <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{rel.type}</span>
                  <span>{rel.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card E: Technical details Accordion */}
          <div style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '16px 24px',
            display: 'flex', flexDirection: 'column', gap: '10px'
          }}>
            <div
              onClick={() => setIsJsonOpen(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', userSelect: 'none'
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Technical details</span>
              {isJsonOpen ? <ChevronUp size={16} color="var(--text-tertiary)" /> : <ChevronDown size={16} color="var(--text-tertiary)" />}
            </div>

            {isJsonOpen && (
              <div style={{ position: 'relative', marginTop: '6px' }}>
                <pre style={{
                  background: '#04070d',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  margin: 0,
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: '#38bdf8',
                  overflowX: 'auto',
                  lineHeight: '1.6'
                }}>
                  {JSON.stringify(technicalJson, null, 2)}
                </pre>

                <button
                  onClick={copyJson}
                  style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: 'var(--text-secondary)',
                    padding: '4px 8px', borderRadius: '4px',
                    cursor: 'pointer', fontSize: '11px',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  {hasCopiedJson ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  <span>{hasCopiedJson ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

