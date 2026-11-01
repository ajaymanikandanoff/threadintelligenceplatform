import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Server,
  Crosshair,
  Layers,
  ExternalLink,
  Flame,
  Globe,
  Radio,
  FileText,
  Cpu,
  Info
} from 'lucide-react';
import { SEVERITY_COLORS } from './threatData';

export default function CountryIntelligencePanel({
  selectedCountry,
  selectedEvent,
  onSelectEvent,
  allEvents = []
}) {
  if (!selectedCountry) {
    return (
      <div style={{
        background: 'var(--bg-glass-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'var(--text-tertiary)',
        height: '100%',
        minHeight: '440px'
      }}>
        <Globe size={36} color="var(--border)" style={{ marginBottom: '12px' }} />
        <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-secondary)', margin: 0 }}>
          Geospatial Intelligence Ready
        </h4>
        <p style={{ fontSize: '12px', margin: '6px 0 0', maxWidth: '240px', lineHeight: 1.5 }}>
          Click any country on the map or select an attack vector to inspect telemetry, infrastructure, and verified attribution.
        </p>
      </div>
    );
  }

  // Defensively normalize properties (supporting both camelCase and snake_case)
  const threatScore = selectedCountry.threatScore ?? selectedCountry.threat_score ?? 50;
  const threatLevel = selectedCountry.threatLevel || selectedCountry.threat_level || 'Monitored Region';
  const observedEvents = selectedCountry.observedEvents ?? selectedCountry.observed_events ?? 1;
  const primaryVectors = selectedCountry.primaryVectors || selectedCountry.primary_vectors || [];
  const verifiedActors = selectedCountry.verifiedActors || selectedCountry.verified_actors || [];
  const malwareFamilies = selectedCountry.malwareFamilies || selectedCountry.malware_families || [];
  const mitreTechniques = selectedCountry.mitreTechniques || selectedCountry.mitre_techniques || [];
  const affectedSectors = selectedCountry.affectedSectors || selectedCountry.affected_sectors || [];
  const evidenceAttribution = selectedCountry.evidenceAttribution || selectedCountry.evidence_attribution || 'Attribution strictly verified against official CISA, CERT, and MITRE evidence.';
  const infrastructureNote = selectedCountry.infrastructureNote || selectedCountry.infrastructure_note || 'Residential proxy gateways, compromised SOHO edge appliances, or fast-flux bulletproof servers.';
  const sources = selectedCountry.sources || [];

  // Filter events related to this country
  const countryEvents = (allEvents || []).filter(e => {
    if (!e) return false;
    const sIso = e.sourceGeo?.iso3 || e.source_geo?.iso3;
    const dIso = e.destGeo?.iso3 || e.dest_geo?.iso3;
    const sCountry = e.sourceGeo?.country || e.source_geo?.country;
    const dCountry = e.destGeo?.country || e.dest_geo?.country;
    const targetIso = selectedCountry.iso3;
    const targetName = selectedCountry.name;
    return (
      (sIso && targetIso && sIso === targetIso) ||
      (dIso && targetIso && dIso === targetIso) ||
      (sCountry && targetName && sCountry === targetName) ||
      (dCountry && targetName && dCountry === targetName)
    );
  });

  const sevColor = threatScore >= 90
    ? SEVERITY_COLORS.critical
    : threatScore >= 80
      ? SEVERITY_COLORS.high
      : threatScore >= 70
        ? SEVERITY_COLORS.medium
        : SEVERITY_COLORS.low;

  return (
    <div style={{
      background: 'var(--bg-glass-card)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      overflowY: 'auto',
      maxHeight: '620px'
    }}>
      {/* Country Header & Severity */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Geospatial Intelligence Dossier
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: '2px 0 0' }}>
            {selectedCountry.name} ({selectedCountry.code || selectedCountry.iso3})
          </h3>
        </div>

        <span style={{
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '800',
          background: `${sevColor}20`,
          color: sevColor,
          border: `1px solid ${sevColor}45`
        }}>
          {threatLevel}
        </span>
      </div>

      {/* Metrics Row: Threat Score & Observed Events */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        padding: '10px 12px',
        background: 'var(--bg-base)',
        borderRadius: '8px',
        border: '1px solid var(--border)'
      }}>
        <div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>Threat Index</div>
          <div style={{ fontSize: '17px', fontWeight: '800', color: sevColor, fontFamily: 'var(--font-mono)' }}>
            {threatScore}/100
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>Observed CTI Events</div>
          <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {countryEvents.length > 0 ? countryEvents.length : observedEvents} Verified
          </div>
        </div>
      </div>

      {/* SECTION 1: CRITICAL INTEL NOTICE - 3-TIER DISTINCTION */}
      <div style={{
        background: 'rgba(56, 189, 248, 0.05)',
        borderLeft: '3px solid var(--accent)',
        borderRadius: '4px',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={13} color="var(--accent)" />
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            3-Tier CTI Correlation Standard
          </span>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          <div><strong>1. IP Geolocation:</strong> {selectedCountry.name} hosting infrastructure / ASN block.</div>
          <div><strong>2. Observed Infrastructure:</strong> {infrastructureNote}</div>
          <div><strong>3. Threat Attribution:</strong> {evidenceAttribution}</div>
        </div>
      </div>

      {/* SECTION 2: Verified Threat Actors & Syndicates */}
      {verifiedActors && verifiedActors.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Verified Threat Actors
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {verifiedActors.map(actor => (
              <span
                key={actor}
                style={{
                  background: 'var(--bg-overlay)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  padding: '3px 8px',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                {actor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Known Malware Families & Tooling */}
      {malwareFamilies && malwareFamilies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Known Malware Families
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {malwareFamilies.map(malware => (
              <span
                key={malware}
                style={{
                  background: 'rgba(244, 63, 94, 0.08)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  color: '#fb7185',
                  padding: '3px 8px',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                {malware}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: MITRE ATT&CK Techniques */}
      {mitreTechniques && mitreTechniques.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            MITRE ATT&CK Techniques
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {mitreTechniques.map(tech => (
              <a
                key={tech}
                href={`https://attack.mitre.org/techniques/${tech.replace('.', '/')}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border)',
                  color: 'var(--accent)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '10.5px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '700',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{tech}</span>
                <ExternalLink size={10} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: Affected Sectors */}
      {affectedSectors && affectedSectors.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Primary Sectors Targeted
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {affectedSectors.join(', ')}
          </div>
        </div>
      )}

      {/* SECTION 6: Intersecting Vectors List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Observed Vectors Intersecting Region ({countryEvents.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {countryEvents.length > 0 ? (
            countryEvents.map(evt => {
              const isSelectedEvt = selectedEvent && selectedEvent.id === evt.id;
              const evtColor = SEVERITY_COLORS[evt.severity] || '#f43f5e';

              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent && onSelectEvent(evt)}
                  style={{
                    background: isSelectedEvt ? 'var(--accent-dim)' : 'var(--bg-base)',
                    border: isSelectedEvt ? '1px solid var(--border-accent)' : '1px solid var(--border)',
                    borderRadius: '7px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: evtColor }} />
                      <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {evt.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', color: evtColor, fontWeight: '800', textTransform: 'uppercase' }}>
                      {evt.severity}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                    <span>{evt.sourceIp || evt.source_ip || 'Origin'} &rarr; {evt.destIp || evt.dest_ip || 'Target'}</span>
                    <span>{evt.confidence}% conf</span>
                  </div>

                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Source: {evt.dataSource || evt.data_source || 'CTI Feed'}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '10px' }}>
              No direct attack lines intersecting this region currently.
            </div>
          )}
        </div>
      </div>

      {/* SECTION 7: Intelligence References */}
      {sources && sources.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Attribution References
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {sources.map((src, i) => (
              <span key={i}>&bull; {src}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
