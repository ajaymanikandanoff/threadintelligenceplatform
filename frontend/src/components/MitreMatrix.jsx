import React, { useState, useMemo } from 'react';
import { X, Search, Filter, ExternalLink, MessageSquare } from 'lucide-react';

export default function MitreMatrix({ tactics = [], activeTechniques = [], onAskCopilot }) {
  const [selectedTech, setSelectedTech] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDetectedOnly, setFilterDetectedOnly] = useState(false);

  const activeMap = useMemo(() => {
    const map = {};
    activeTechniques.forEach(t => {
      map[t.id] = t;
      const base = t.id.split('.')[0];
      if (!map[base]) map[base] = t;
    });
    return map;
  }, [activeTechniques]);

  const filteredTactics = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tactics.map(tactic => {
      const filteredTechs = tactic.techniques.filter(item => {
        const [techId, ...rest] = item.split(' - ');
        const techName = rest.join(' - ') || techId;
        const isActive = !!activeMap[techId];

        if (filterDetectedOnly && !isActive) return false;
        if (!q) return true;
        return techId.toLowerCase().includes(q) || techName.toLowerCase().includes(q) || tactic.name.toLowerCase().includes(q);
      });
      return { ...tactic, filteredTechs };
    }).filter(t => t.filteredTechs.length > 0);
  }, [tactics, activeMap, searchQuery, filterDetectedOnly]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Control Bar & Legend */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '14px', background: 'var(--bg-elevated)',
        padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              MITRE ATT&CK® Enterprise Matrix Heatmap
            </h2>
            <span style={{
              background: 'var(--red-dim)', color: 'var(--red)',
              border: '1px solid rgba(244,63,94,0.3)', padding: '2px 8px',
              borderRadius: '4px', fontSize: '10.5px', fontWeight: '800', fontFamily: 'var(--font-mono)'
            }}>
              {activeTechniques.length} DETECTED IN REPORT
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Tactics, Techniques and Procedures (TTPs) mapped from extracted adversary telemetry.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--bg-base)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '6px 12px', width: '230px'
          }}>
            <Search size={14} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search T1059, PowerShell…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '12px', width: '100%',
                fontFamily: 'var(--font-sans)'
              }}
            />
            {searchQuery && (
              <X size={12} color="var(--text-tertiary)" style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
            )}
          </div>

          <button
            onClick={() => setFilterDetectedOnly(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 12px', borderRadius: '8px',
              background: filterDetectedOnly ? 'var(--red-dim)' : 'var(--bg-base)',
              border: `1px solid ${filterDetectedOnly ? 'rgba(244,63,94,0.35)' : 'var(--border)'}`,
              color: filterDetectedOnly ? 'var(--red)' : 'var(--text-secondary)',
              fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s ease'
            }}
          >
            <Filter size={12} />
            <span>DETECTED ONLY</span>
          </button>
        </div>
      </div>

      {/* Matrix Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '12px'
      }}>
        {filteredTactics.map(tactic => {
          const detectedCountInTactic = tactic.filteredTechs.filter(item => {
            const [techId] = item.split(' - ');
            return !!activeMap[techId];
          }).length;

          return (
            <div
              key={tactic.id}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {/* Tactic Column Header */}
              <div style={{
                borderBottom: '1px solid var(--border)',
                paddingBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: '700' }}>
                    {tactic.id}
                  </span>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', margin: '2px 0 0' }}>
                    {tactic.name}
                  </h4>
                </div>
                {detectedCountInTactic > 0 && (
                  <span style={{
                    padding: '2px 6px', borderRadius: '4px',
                    background: 'var(--red-dim)', color: 'var(--red)',
                    fontSize: '10px', fontWeight: '800', fontFamily: 'var(--font-mono)',
                    border: '1px solid rgba(244,63,94,0.25)'
                  }}>
                    {detectedCountInTactic}
                  </span>
                )}
              </div>

              {/* Technique Cards in Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '420px', overflowY: 'auto' }}>
                {tactic.filteredTechs.map((item, i) => {
                  const [techId, ...rest] = item.split(' - ');
                  const techName = rest.join(' - ') || techId;
                  const isActive = !!activeMap[techId];
                  const details = activeMap[techId];

                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedTech({ id: techId, name: techName, tactic: tactic.name, isActive, details })}
                      style={{
                        padding: '9px 11px',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        background: isActive
                          ? 'rgba(244,63,94,0.1)'
                          : 'var(--bg-base)',
                        border: `1px solid ${isActive ? 'rgba(244,63,94,0.35)' : 'var(--border)'}`,
                        boxShadow: isActive ? '0 0 10px rgba(244,63,94,0.1)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = isActive ? 'var(--red)' : 'var(--accent)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = isActive ? 'rgba(244,63,94,0.35)' : 'var(--border)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '11px',
                          color: isActive ? 'var(--red)' : 'var(--accent)'
                        }}>
                          {techId}
                        </span>
                        {isActive && (
                          <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: 'var(--red)', boxShadow: '0 0 6px var(--red)'
                          }} />
                        )}
                      </div>
                      <div style={{
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontSize: '11.5px', marginTop: '3px', lineHeight: '1.35',
                        fontWeight: isActive ? '700' : '500'
                      }}>
                        {techName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Technique Detail Modal Drawer */}
      {selectedTech && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedTech(null)}
        >
          <div
            className="modal-container"
            style={{ maxWidth: '540px', padding: '24px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '12px',
                    color: selectedTech.isActive ? 'var(--red)' : 'var(--accent)'
                  }}>
                    {selectedTech.id}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    {selectedTech.tactic}
                  </span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  {selectedTech.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTech(null)}
                className="btn-ghost"
                style={{ padding: '6px', border: 'none', background: 'transparent' }}
              >
                <X size={16} />
              </button>
            </div>

            {selectedTech.isActive ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px 14px', background: 'var(--red-dim)', borderRadius: '8px', border: '1px solid rgba(244,63,94,0.25)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    🚨 Verified Attacker Telemetry in Advisory
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    {selectedTech.details?.description || selectedTech.details?.evidence || 'Adversary leveraged this technique during active operations.'}
                  </p>
                </div>

                {selectedTech.details?.mitigation && (
                  <div style={{ padding: '12px 14px', background: 'var(--bg-overlay)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      🛡️ Recommended Defense Mitigation
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                      {selectedTech.details.mitigation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-overlay)', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                This MITRE ATT&CK technique was not actively observed in the loaded advisory telemetry.
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <a
                href={`https://attack.mitre.org/techniques/${selectedTech.id.replace('.', '/')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
                style={{ flex: 1, fontSize: '12px' }}
              >
                <ExternalLink size={13} /> Official MITRE Page
              </a>
              {onAskCopilot && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    onAskCopilot(`How do we detect and mitigate MITRE ATT&CK technique ${selectedTech.id} (${selectedTech.name})?`);
                    setSelectedTech(null);
                  }}
                  style={{ flex: 1, fontSize: '12px' }}
                >
                  <MessageSquare size={13} /> Ask Copilot
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
