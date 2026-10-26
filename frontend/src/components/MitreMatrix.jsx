import React, { useState, useMemo } from 'react';
import { X, ExternalLink, Search, Filter, ShieldAlert, Sparkles, MessageSquare, CheckCircle2, ChevronRight } from 'lucide-react';

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
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              MITRE ATT&CK® Enterprise Matrix
            </h2>
            <span style={{
              background: 'rgba(248,113,113,0.15)', color: 'var(--red)',
              border: '1px solid rgba(248,113,113,0.3)', padding: '2px 8px',
              borderRadius: '4px', fontSize: '11px', fontWeight: '700'
            }}>
              {activeTechniques.length} Active in Report
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Tactics, Techniques and Procedures (TTPs) mapped from adversary telemetry.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--bg-base)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '6px 12px', width: '220px'
          }}>
            <Search size={14} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search T1059, PowerShell…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '12px', width: '100%'
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
              padding: '6px 12px', borderRadius: '8px',
              background: filterDetectedOnly ? 'rgba(248,113,113,0.15)' : 'var(--bg-base)',
              border: `1px solid ${filterDetectedOnly ? 'rgba(248,113,113,0.35)' : 'var(--border)'}`,
              color: filterDetectedOnly ? 'var(--red)' : 'var(--text-secondary)',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease'
            }}
          >
            <Filter size={13} />
            <span>Detected Only</span>
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
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: '2px 0 0' }}>
                    {tactic.name}
                  </h4>
                </div>
                {detectedCountInTactic > 0 && (
                  <span style={{
                    padding: '2px 6px', borderRadius: '4px',
                    background: 'rgba(248,113,113,0.15)', color: 'var(--red)',
                    fontSize: '10px', fontWeight: '700', fontFamily: 'var(--font-mono)'
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
                        padding: '8px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: isActive
                          ? 'rgba(248,113,113,0.12)'
                          : 'var(--bg-base)',
                        border: `1px solid ${isActive ? 'rgba(248,113,113,0.35)' : 'var(--border)'}`,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = isActive ? 'var(--red)' : 'var(--border-accent)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = isActive ? 'rgba(248,113,113,0.35)' : 'var(--border)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '11px',
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
                        fontSize: '11px', marginTop: '3px', lineHeight: '1.3',
                        fontWeight: isActive ? '600' : '400'
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
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, padding: '20px'
          }}
          onClick={() => setSelectedTech(null)}
        >
          <div
            style={{
              maxWidth: '520px', width: '100%',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '28px', boxShadow: '0 24px 64px rgba(0,0,0,0.7)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: '4px', fontSize: '11px',
                    fontFamily: 'var(--font-mono)', fontWeight: '700',
                    background: selectedTech.isActive ? 'rgba(248,113,113,0.15)' : 'rgba(56,189,248,0.15)',
                    color: selectedTech.isActive ? 'var(--red)' : 'var(--accent)',
                    border: `1px solid ${selectedTech.isActive ? 'rgba(248,113,113,0.3)' : 'var(--border-accent)'}`
                  }}>
                    {selectedTech.id}
                  </span>
                  <span style={{
                    padding: '3px 8px', borderRadius: '4px', fontSize: '11px',
                    background: 'var(--bg-base)', color: 'var(--text-secondary)',
                    border: '1px solid var(--border)'
                  }}>
                    {selectedTech.tactic}
                  </span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  {selectedTech.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTech(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Status Details */}
            {selectedTech.isActive ? (
              <div style={{
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
                padding: '14px 16px', borderRadius: '8px', marginBottom: '18px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--red)', marginBottom: '4px' }}>
                  Observed in Active Threat Advisory
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                  {selectedTech.details?.evidence || selectedTech.details?.description || 'Adversary behavior telemetry matches this technique signature.'}
                </p>
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                    background: 'rgba(52,211,153,0.15)', color: 'var(--green)',
                    border: '1px solid rgba(52,211,153,0.3)', fontWeight: '600'
                  }}>
                    {selectedTech.details?.confidence || 'HIGH'} Confidence
                  </span>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-base)', border: '1px solid var(--border)',
                padding: '14px 16px', borderRadius: '8px', marginBottom: '18px',
                fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5'
              }}>
                This technique is part of the official MITRE ATT&CK framework catalog, but was not directly identified in the current report telemetry.
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={`https://attack.mitre.org/techniques/${selectedTech.id.replace('.', '/')}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
                style={{ flex: 1, justifyContent: 'center', padding: '9px 12px', fontSize: '12px' }}
              >
                <ExternalLink size={14} /><span>MITRE ATT&CK Docs</span>
              </a>
              <button
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '9px 12px', fontSize: '12px' }}
                onClick={() => {
                  onAskCopilot?.(`How can our security team detect, block, and hunt for MITRE technique ${selectedTech.id} (${selectedTech.name})?`);
                  setSelectedTech(null);
                }}
              >
                <MessageSquare size={14} /><span>Ask AI Copilot</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
