import React, { useState } from 'react';
import {
  ArrowRight,
  Database,
  Activity,
  ShieldAlert,
  Zap,
  Radio,
  Lock,
  Server,
  Crosshair,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

export default function DataTransferPanel({
  events = [],
  selectedEvent = null,
  onSelectRoute = () => {}
}) {
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'exfiltration' | 'c2_tunnel' | 'ddos_flood'

  const filteredEvents = events.filter(evt => {
    const dt = evt.dataTransfer || evt.data_transfer;
    const flowType = dt?.flow_type || dt?.flowType || 'c2_tunnel';
    if (filterType === 'ALL') return true;
    if (filterType === 'exfiltration') return flowType === 'exfiltration';
    if (filterType === 'c2_tunnel') return flowType === 'c2_tunnel' || flowType === 'payload_delivery';
    if (filterType === 'ddos_flood') return flowType === 'ddos_flood';
    return true;
  });

  return (
    <div style={{
      background: 'rgba(10, 15, 29, 0.95)',
      border: '1px solid rgba(0, 229, 255, 0.25)',
      borderRadius: '14px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '520px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
    }}>
      {/* Panel Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(180deg, rgba(0, 229, 255, 0.08) 0%, transparent 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={15} color="#f43f5e" />
            </div>
            <div>
              <h3 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Live Data Exfiltration & Transfer
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                Tracking real-time cross-border network flows & payloads
              </p>
            </div>
          </div>
          <span style={{
            background: 'rgba(244, 63, 94, 0.18)',
            color: '#f43f5e',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '10.5px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f43f5e', animation: 'pulse 1.5s infinite' }} />
            {filteredEvents.length} Active Streams
          </span>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '10px' }}>
          {[
            { id: 'ALL', label: 'All Streams' },
            { id: 'exfiltration', label: '🔴 Exfiltration' },
            { id: 'c2_tunnel', label: '🟡 C2 Channels' },
            { id: 'ddos_flood', label: '🟢 Blocked' }
          ].map(f => {
            const active = filterType === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                style={{
                  background: active ? 'rgba(0, 229, 255, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  color: active ? '#00e5ff' : 'var(--text-secondary)',
                  border: active ? '1px solid rgba(0, 229, 255, 0.45)' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '6px',
                  padding: '3px 9px',
                  fontSize: '10.5px',
                  fontWeight: active ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stream List (Scrollable) */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-secondary)', fontSize: '12px' }}>
            No data streams found matching this filter.
          </div>
        ) : (
          filteredEvents.map(evt => {
            const dt = evt.dataTransfer || evt.data_transfer || {};
            const isSelected = selectedEvent?.id === evt.id;
            const flowType = dt.flow_type || dt.flowType || 'c2_tunnel';
            const isExfil = flowType === 'exfiltration';
            const isBlocked = flowType === 'ddos_flood';
            const themeColor = isExfil ? '#f43f5e' : (isBlocked ? '#10b981' : '#38bdf8');

            return (
              <div
                key={evt.id}
                onClick={() => onSelectRoute(evt)}
                style={{
                  background: isSelected ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 0 16px rgba(0, 229, 255, 0.2)' : 'none'
                }}
              >
                {/* Route Header: Origin -> Target */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    <span>{evt.sourceGeo?.city || 'Origin'}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>({evt.sourceGeo?.countryCode || 'SRC'})</span>
                    <ArrowRight size={13} color={themeColor} />
                    <span>{evt.destGeo?.city || 'Target'}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>({evt.destGeo?.countryCode || 'DST'})</span>
                  </div>

                  <span style={{
                    background: `${themeColor}22`,
                    color: themeColor,
                    border: `1px solid ${themeColor}44`,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '9.5px',
                    fontWeight: '800',
                    textTransform: 'uppercase'
                  }}>
                    {isExfil ? 'EXFILTRATION' : (isBlocked ? 'BLOCKED' : 'C2 TUNNEL')}
                  </span>
                </div>

                {/* Transfer Metrics Row: Bytes & Speed */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr',
                  gap: '6px',
                  background: 'rgba(0, 0, 0, 0.35)',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  marginBottom: '8px'
                }}>
                  <div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>Volume Exfiltrated</div>
                    <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#fca5a5', fontFamily: 'var(--font-mono)' }}>
                      {dt.bytes_transferred || dt.bytesTransferred || 'Streaming'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>Current Rate</div>
                    <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                      {dt.transfer_rate || dt.transferRate || 'Continuous'}
                    </div>
                  </div>
                </div>

                {/* Protocol & Payload Description */}
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                    <Server size={11} color="var(--accent)" />
                    <code style={{ fontSize: '10px', color: 'var(--text-primary)', background: 'rgba(0,0,0,0.4)', padding: '1px 4px', borderRadius: '3px' }}>
                      {dt.protocol || 'TCP / 443'}
                    </code>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>• {dt.packet_count || dt.packetCount || 'Active packets'}</span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#fde047', fontStyle: 'italic', lineHeight: 1.35 }}>
                    "{dt.payload_type || dt.payloadType || evt.evidence}"
                  </div>
                </div>

                {/* Threat Actor & Trace Action */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '6px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '10.5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#cbd5e1' }}>
                    <span style={{ color: '#94a3b8' }}>Actor:</span>
                    <strong style={{ color: '#f8fafc' }}>{evt.threatActor || 'Advanced Threat'}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRoute(evt);
                    }}
                    style={{
                      background: 'rgba(0, 229, 255, 0.15)',
                      color: '#00e5ff',
                      border: '1px solid rgba(0, 229, 255, 0.35)',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      fontSize: '10px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Trace Flow</span>
                    <ExternalLink size={10} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

