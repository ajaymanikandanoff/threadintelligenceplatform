import React, { useState } from 'react';
import {
  Globe,
  Shield,
  Lock,
  Calendar,
  Layers,
  Search,
  AlertTriangle,
  Copy,
  Check,
  Radio,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function DomainIntelligenceView({ onSelectIndicator }) {
  const [domainInput, setDomainInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [activeDnsTab, setActiveDnsTab] = useState('A');
  const [hasCopied, setHasCopied] = useState(false);

  const sampleDomains = [
    { domain: 'github.com', label: 'GitHub (Clean)' },
    { domain: 'google.com', label: 'Google (Clean)' },
    { domain: 'files-share.example.co', label: 'Malware Host (High Risk)' },
    { domain: 'login-update.example.net', label: 'Phishing (High Risk)' }
  ];

  const handleScan = async (targetDomain) => {
    const domainToScan = (targetDomain || domainInput).trim();
    if (!domainToScan) return;

    setIsLoading(true);
    setScanError(null);
    setScanResult(null);

    try {
      const resp = await fetch(`${API_BASE}/api/scan/domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainToScan })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.detail || 'Domain scan request failed');
      }
      setScanResult(data);
      setDomainInput(domainToScan);
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

  const handleClearDomain = () => {
    setScanResult(null);
    setScanError(null);
    setDomainInput('');
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
            <Globe size={18} color="var(--accent)" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Domain Intelligence Scanner
          </h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Deep DNS resolution (A, AAAA, MX, TXT, NS, CNAME), RDAP registrar ownership, SSL certificate validation, and DGA entropy.
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
        <form onSubmit={(e) => { e.preventDefault(); handleScan(); }} style={{ display: 'flex', gap: '10px' }}>
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
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="Enter domain name (e.g. github.com, suspicious-portal.xyz)"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '13.5px', fontFamily: 'monospace'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !domainInput.trim()}
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
            <span>{isLoading ? 'Scanning Domain...' : 'Scan Domain'}</span>
          </button>

          {(scanResult || domainInput) && (
            <button
              type="button"
              onClick={handleClearDomain}
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
              title="Deselect / Clear domain input and result"
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
          {sampleDomains.map((s) => (
            <button
              key={s.domain}
              type="button"
              onClick={() => handleScan(s.domain)}
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
              {s.domain}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {scanError && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '12px',
          padding: '14px 18px',
          color: '#f43f5e',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <AlertTriangle size={20} />
          <span style={{ fontSize: '13px', fontWeight: '600' }}>{scanError}</span>
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
                Domain Threat Score
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
                Shannon Entropy: <strong>{scanResult.entropy}</strong> {scanResult.entropy > 3.6 ? '(High DGA Risk)' : '(Normal)'}
              </span>
            </div>

            {/* WHOIS / Registrar Card */}
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '8px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Registrar & RDAP
              </span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                {scanResult.rdap?.registrar || 'Unknown Registrar'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Created: {scanResult.rdap?.created_date ? scanResult.rdap.created_date.split('T')[0] : 'N/A'}
                {scanResult.rdap?.age_days !== null && ` (${scanResult.rdap?.age_days} days ago)`}
              </span>
            </div>

            {/* SSL Certificate Card */}
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '8px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SSL / TLS Encryption
              </span>
              {scanResult.ssl?.has_ssl ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={16} color="#10b981" />
                    <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {scanResult.ssl.issuer_org || scanResult.ssl.issuer_cn}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: scanResult.ssl.is_expired ? '#f43f5e' : 'var(--text-secondary)' }}>
                    {scanResult.ssl.is_expired ? 'EXPIRED' : `Valid for next ${scanResult.ssl.days_remaining} days`}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                  {scanResult.ssl?.reason || 'No SSL Certificate Detected'}
                </span>
              )}
            </div>

            {/* Resolved IPs Card */}
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '8px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Resolved IP Infrastructure
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {scanResult.resolved_ips?.length > 0 ? (
                  scanResult.resolved_ips.slice(0, 3).map((ip) => (
                    <span key={ip} style={{
                      background: 'var(--bg-overlay)', padding: '3px 8px', borderRadius: '4px',
                      fontSize: '11.5px', fontFamily: 'monospace', color: 'var(--accent)'
                    }}>
                      {ip}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '12.5px', color: 'var(--text-tertiary)' }}>No IP records resolved</span>
                )}
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                Total host mappings: {scanResult.resolved_ips?.length || 0}
              </span>
            </div>
          </div>

          {/* DNS Records Tabbed View */}
          <div style={{
            background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                DNS Record Enumeration
              </h3>
              {/* Type Tabs */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'].map((rtype) => {
                  const count = scanResult.dns_records?.[rtype]?.length || 0;
                  const active = activeDnsTab === rtype;
                  return (
                    <button
                      key={rtype}
                      type="button"
                      onClick={() => setActiveDnsTab(rtype)}
                      style={{
                        padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600',
                        border: active ? '1px solid var(--border-accent)' : '1px solid var(--border)',
                        background: active ? 'var(--accent-dim)' : 'var(--bg-overlay)',
                        color: active ? 'var(--accent)' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {rtype} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Record Content List */}
            <div style={{ background: 'var(--bg-base)', borderRadius: '10px', padding: '16px', minHeight: '80px' }}>
              {scanResult.dns_records?.[activeDnsTab]?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scanResult.dns_records[activeDnsTab].map((rec, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 12px', background: 'var(--bg-glass-card)', borderRadius: '6px',
                      fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--text-primary)',
                      border: '1px solid var(--border)'
                    }}>
                      <span style={{ color: 'var(--accent)', fontWeight: '700', width: '50px' }}>{activeDnsTab}</span>
                      <span style={{ flex: 1, wordBreak: 'break-all' }}>
                        {typeof rec === 'object' ? `${rec.host} (Preference: ${rec.preference})` : rec}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-tertiary)', fontSize: '12.5px', textAlign: 'center', padding: '20px' }}>
                  No {activeDnsTab} records configured for {scanResult.domain}.
                </div>
              )}
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

