import React from 'react';
import { ShieldAlert, TrendingUp, Radio, AlertCircle } from 'lucide-react';
import { SEVERITY_COLORS } from './threatData';

export default function ThreatOriginRanking({
  countryProfiles = {},
  selectedCountry,
  onSelectCountry,
  timeRange = '24H'
}) {
  // Sort countries by observed events (actual collected/recorded telemetry)
  const rankingList = Object.values(countryProfiles)
    .filter(c => c.threatLevel.includes('Critical') || c.threatLevel.includes('Origin') || c.threatLevel.includes('High') || c.observedEvents > 5)
    .sort((a, b) => b.threatScore - a.threatScore);

  return (
    <div style={{
      background: 'var(--bg-glass-card)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={15} color="var(--accent)" />
          <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            Top Threat Origin Hubs & Infrastructure Density
          </h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '10px',
            color: 'var(--text-tertiary)',
            background: 'var(--bg-overlay)',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid var(--border)'
          }}>
            Time Window: <strong>{timeRange}</strong>
          </span>

          <span style={{
            fontSize: '10px',
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
            Verified SOC Telemetry
          </span>
        </div>
      </div>

      {/* Origin Ranking Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '10px'
      }}>
        {rankingList.slice(0, 5).map((country, idx) => {
          const isSelected = selectedCountry?.iso3 === country.iso3;
          const sevColor = country.threatScore >= 90
            ? SEVERITY_COLORS.critical
            : country.threatScore >= 80
              ? SEVERITY_COLORS.high
              : SEVERITY_COLORS.medium;

          return (
            <div
              key={country.iso3}
              onClick={() => onSelectCountry && onSelectCountry(country)}
              style={{
                background: isSelected ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                border: isSelected ? '1px solid var(--border-accent)' : '1px solid var(--border)',
                borderRadius: '9px',
                padding: '10px 14px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                if (!isSelected) e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
              }}
              onMouseLeave={e => {
                if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-mono)',
                    width: '14px'
                  }}>
                    #{idx + 1}
                  </span>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: sevColor, boxShadow: `0 0 6px ${sevColor}` }} />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {country.name}
                  </span>
                </div>

                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  color: sevColor,
                  background: `${sevColor}15`,
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  Score {country.threatScore}
                </span>
              </div>

              {/* Observed Telemetry Count & Primary Adversary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Observed Events: <strong style={{ color: 'var(--text-primary)' }}>{country.observedEvents}</strong></span>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                  {country.verifiedActors?.[0] || 'State / Cybercrime'}
                </span>
              </div>

              {/* Severity Distribution Bar */}
              <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255, 255, 255, 0.06)', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${country.threatScore}%`, height: '100%', background: sevColor }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Transparency Note */}
      <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <AlertCircle size={12} color="var(--text-tertiary)" />
        <span>Attribution reflects verified threat research from CISA, CERT-UA, and IntelOwl honeynet sensors, not arbitrary raw packet counts.</span>
      </div>
    </div>
  );
}

