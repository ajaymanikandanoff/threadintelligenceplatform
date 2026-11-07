import React, { useState } from 'react';
import {
  Link2,
  Shield,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Search,
  ExternalLink,
  ShieldAlert,
  Radio,
  Server,
  RotateCcw
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function UrlAnalysisView({ onSelectIndicator }) {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [hasCopied, setHasCopied] = useState(false);

  const sampleUrls = [
    { url: 'https://github.com', label: 'GitHub Official (Clean)' },
    { url: 'http://secure-login.example-verify.com/login.php?dest=admin', label: 'Credential Harvest (Phishing)' },
    { url: 'https://files-share.example.co/payload.zip', label: 'Executable Download (Malware)' },
    { url: 'http://127.0.0.1:8000/internal-api', label: 'Localhost / SSRF Test' }
  ];

  const handleScan = async (targetUrl) => {
    const urlToScan = (targetUrl || urlInput).trim();
    if (!urlToScan) return;

    setIsLoading(true);
    setScanError(null);
    setScanResult(null);

    try {
      const resp = await fetch(`${API_BASE}/api/scan/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToScan })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.detail || 'URL analysis request failed');
      }
      setScanResult(data);
      setUrlInput(urlToScan);
    } catch (err) {
      setScanError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyResults = () => {
    if (!scanResult) return;
    navigator.clipboard.writeText(JSON.stringify(scanResult, null, 2));
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleClearUrl = () => {
    setScanResult(null);
    setScanError(null);
    setUrlInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Link2 size={18} color="var(--accent)" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            URL Threat Analyzer & SSRF Crawler
          </h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Safe multi-hop redirect tracer with strict SSRF filtering, phishing heuristic scoring, and payload parameter inspection.
        </p>
      </div>

      {/* Input Container */}
      <div style={{
        background: 'var(--bg-glass-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '22px 26px',
        display: 'flex', flexDirection: 'column', gap: '16px'
      }}>
        <form className="scanner-form" onSubmit={(e) => { e.preventDefault(); handleScan(); }} style={{ display: 'flex', gap: '10px' }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '12px 16px'
          }}>
            <Search size={18} color="var(--text-tertiary)" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter target URL (e.g. https://suspicious-link.com/login?token=abc)"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '13.5px', fontFamily: 'monospace'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !urlInput.trim()}
            style={{
              padding: '0 24px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, var(--accent) 100%)',
              color: '#06090f',
              fontWeight: '700',
              fontSize: '13px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 0 20px var(--accent-glow)'
            }}
          >
            {isLoading ? <Radio size={16} className="animate-spin" /> : <Shield size={16} />}
            <span>{isLoading ? 'Crawling URL...' : 'Analyze URL'}</span>
          </button>

          {(scanResult || urlInput) && (
            <button
              type="button"
              onClick={handleClearUrl}
              style={{
                padding: '0 16px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
              title="Deselect / Clear URL input and result"
            >
              <RotateCcw size={14} />
              <span>Clear</span>
            </button>
          )}
        </form>

        {/* Quick Samples */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Samples:
          </span>
          {sampleUrls.map((s) => (
            <button
              key={s.url}
              type="button"
              onClick={() => handleScan(s.url)}
              style={{
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '4px 10px',
                color: 'var(--text-secondary)',
                fontSize: '11.5px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert / SSRF Violation */}
      {scanError && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '12px',
          padding: '14px 18px',
          color: '#f43f5e',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <ShieldAlert size={22} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700' }}>SSRF & Security Defense Triggered</div>
            <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '2px' }}>{scanError}</div>
          </div>
        </div>
      )}

      {/* Results */}
      {scanResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Risk Score */}
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                URL Threat Risk Score
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{
                  fontSize: '36px', fontWeight: '900',
                  color: scanResult.risk_score >= 70 ? '#f43f5e' : scanResult.risk_score >= 30 ? '#f59e0b' : '#10b981'
                }}>
                  {scanResult.risk_score}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>/ 100</span>
                <span style={{
                  marginLeft: 'auto',
                  padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                  background: scanResult.risk_score >= 70 ? 'rgba(244, 63, 94, 0.15)' : scanResult.risk_score >= 30 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: scanResult.risk_score >= 70 ? '#f43f5e' : scanResult.risk_score >= 30 ? '#f59e0b' : '#10b981',
                  border: `1px solid ${scanResult.risk_score >= 70 ? 'rgba(244, 63, 94, 0.3)' : scanResult.risk_score >= 30 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                }}>
                  {scanResult.classification}
                </span>
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                Target Host: <strong>{scanResult.hostname}</strong>
              </span>
            </div>

            {/* SSRF & Boundary Card */}
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '8px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SSRF Boundary Inspection
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                  Publicly Routable (Safe)
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Resolved IPs: {scanResult.resolved_ips?.join(', ') || 'N/A'}
              </span>
            </div>

            {/* Redirect Hops Card */}
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '8px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Redirect Traversal
              </span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {scanResult.redirect_chain?.length || 1} Hop(s) Recorded
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Final Status: <strong>HTTP {scanResult.final_status_code || '200'}</strong> ({scanResult.crawl_duration_ms} ms)
              </span>
            </div>
          </div>

          {/* Multi-Hop Redirect Chain Trace Card */}
          <div style={{
            background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              Multi-Hop Redirect Chain Trace
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {scanResult.redirect_chain?.map((hop, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 16px', background: 'var(--bg-overlay)', borderRadius: '10px',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-dim)',
                    color: 'var(--accent)', fontWeight: '800', fontSize: '12px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {hop.hop}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {hop.url}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      Server: {hop.server} | Content-Type: {hop.content_type}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                      background: hop.status_code >= 300 && hop.status_code < 400 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: hop.status_code >= 300 && hop.status_code < 400 ? '#f59e0b' : '#10b981'
                    }}>
                      HTTP {hop.status_code}
                    </span>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                      {hop.latency_ms} ms
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence and Recommended Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '18px' }}>
            {/* Evidence */}
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '22px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 14px' }}>
                Observed Evidence & Findings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {scanResult.evidence?.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', marginTop: '6px', flexShrink: 0 }} />
                    <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '22px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 14px' }}>
                Recommended Containment Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {scanResult.recommended_actions?.map((act, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '12px', alignItems: 'center',
                    background: 'var(--bg-overlay)', padding: '10px 14px', borderRadius: '8px'
                  }}>
                    <span style={{
                      width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-dim)',
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
          </div>

          {/* Export Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={copyResults}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '9px 16px', color: 'var(--text-primary)',
                fontSize: '12.5px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              {hasCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{hasCopied ? 'Copied Raw JSON' : 'Export Raw JSON'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

