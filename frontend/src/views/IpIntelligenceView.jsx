import React, { useState } from 'react';
import {
  Globe,
  Shield,
  Activity,
  Server,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Search,
  ExternalLink,
  MapPin,
  Clock,
  Radio,
  RotateCcw
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function IpIntelligenceView({ onSelectIndicator }) {
  const [ipInput, setIpInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [hasCopied, setHasCopied] = useState(false);

  const sampleIps = [
    { ip: '8.8.8.8', label: 'Google Public DNS (Clean)' },
    { ip: '1.1.1.1', label: 'Cloudflare DNS (Clean)' },
    { ip: '203.0.113.42', label: 'Suspicious C2 Server (Ransomware)' },
    { ip: '192.168.1.1', label: 'Internal Gateway (RFC 1918)' }
  ];

  const handleScan = async (targetIp) => {
    const ipToScan = (targetIp || ipInput).trim();
    if (!ipToScan) return;

    setIsLoading(true);
    setScanError(null);
    setScanResult(null);

    try {
      const resp = await fetch(`${API_BASE}/api/scan/ip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: ipToScan })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.detail || 'IP scan request failed');
      }
      setScanResult(data);
      setIpInput(ipToScan);
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

  const handleClearIp = () => {
    setScanResult(null);
    setScanError(null);
    setIpInput('');
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
            <Server size={18} color="var(--accent)" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            IP Intelligence Scanner
          </h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Comprehensive IPv4 & IPv6 enrichment: GeoIP, ASN attribution, reverse DNS, DNSBL blacklists, and port discovery.
        </p>
      </div>

      {/* Input Card */}
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
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="Enter IPv4 or IPv6 address (e.g. 203.0.113.42, 8.8.8.8, 2001:4860::8888)"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '13.5px', fontFamily: 'monospace'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !ipInput.trim()}
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
            <span>{isLoading ? 'Scanning IP...' : 'Scan IP'}</span>
          </button>

          {(scanResult || ipInput) && (
            <button
              type="button"
              onClick={handleClearIp}
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
              title="Deselect / Clear IP input and result"
            >
              <RotateCcw size={14} />
              <span>Clear</span>
            </button>
          )}
        </form>

        {/* Quick Sample Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Samples:
          </span>
          {sampleIps.map((s) => (
            <button
              key={s.ip}
              type="button"
              onClick={() => handleScan(s.ip)}
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
              {s.ip} <span style={{ opacity: 0.6, fontSize: '10.5px' }}>({s.label.split(' ')[0]})</span>
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

      {/* Results Container */}
      {scanResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Reputation Card */}
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Abuse Confidence Score
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{
                  fontSize: '36px', fontWeight: '900',
                  color: scanResult.abuse_score >= 70 ? '#f43f5e' : scanResult.abuse_score >= 30 ? '#f59e0b' : '#10b981'
                }}>
                  {scanResult.abuse_score}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>/ 100</span>
                <span style={{
                  marginLeft: 'auto',
                  padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                  background: scanResult.abuse_score >= 70 ? 'rgba(244, 63, 94, 0.15)' : scanResult.abuse_score >= 30 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: scanResult.abuse_score >= 70 ? '#f43f5e' : scanResult.abuse_score >= 30 ? '#f59e0b' : '#10b981',
                  border: `1px solid ${scanResult.abuse_score >= 70 ? 'rgba(244, 63, 94, 0.3)' : scanResult.abuse_score >= 30 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                }}>
                  {scanResult.risk_classification}
                </span>
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                Scope: <strong>{scanResult.scope}</strong> ({scanResult.ip_version})
              </span>
            </div>

            {/* Geo & Location Card */}
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '8px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Geolocation & Country
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--accent)" />
                <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {scanResult.geolocation?.city}, {scanResult.geolocation?.country}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Region: {scanResult.geolocation?.region} | TZ: {scanResult.geolocation?.timezone}
              </span>
            </div>

            {/* ASN & Routing Card */}
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '8px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Autonomous System (ASN) & ISP
              </span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                {scanResult.geolocation?.isp}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                {scanResult.geolocation?.as_number} ({scanResult.geolocation?.as_org})
              </span>
            </div>

            {/* Reverse DNS Card */}
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '8px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Reverse DNS (PTR)
              </span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {scanResult.reverse_dns}
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                Confidence: {scanResult.confidence}%
              </span>
            </div>
          </div>

          {/* Evidence and Recommended Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '18px' }}>
            {/* Evidence List */}
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

            {/* Containment Actions */}
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

          {/* Open Ports & DNSBL Checks Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '18px' }}>
            {/* Open Ports */}
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '22px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 14px' }}>
                Authorized Port Probes
              </h3>
              {scanResult.open_ports?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scanResult.open_ports.map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', background: 'var(--bg-overlay)', borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Radio size={14} color="#10b981" />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                          Port {p.port} ({p.service})
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>
                        {p.state}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px', color: 'var(--text-tertiary)', fontSize: '12.5px', textAlign: 'center' }}>
                  No exposed standard services identified on probed ports.
                </div>
              )}
            </div>

            {/* Blacklist Status */}
            <div style={{
              background: 'var(--bg-glass-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '22px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 14px' }}>
                DNSBL Blacklist Feed Status
              </h3>
              {scanResult.blacklist_checks?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scanResult.blacklist_checks.map((b, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', background: 'var(--bg-overlay)', borderRadius: '8px'
                    }}>
                      <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {b.blacklist}
                      </span>
                      <span style={{
                        padding: '3px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '700',
                        background: b.listed ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                        color: b.listed ? '#f43f5e' : '#10b981'
                      }}>
                        {b.listed ? 'LISTED' : 'CLEAN'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px', color: 'var(--text-tertiary)', fontSize: '12.5px', textAlign: 'center' }}>
                  Non-routable IP address. DNSBL reputation checks bypassed.
                </div>
              )}
            </div>
          </div>

          {/* Export & Action Footer */}
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

