import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

export default function MitreMatrix({ tactics = [], activeTechniques = [], onAskCopilot }) {
  const [selectedTech, setSelectedTech] = useState(null);

  const activeMap = {};
  activeTechniques.forEach(t => { activeMap[t.id] = t; const base = t.id.split('.')[0]; if (!activeMap[base]) activeMap[base] = t; });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-0)' }}>MITRE ATT&CK® Enterprise Matrix</h2>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.74rem', color: 'var(--text-3)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(252,129,129,0.3)', border: '1px solid var(--red)', display: 'inline-block' }}></span>
            Detected ({activeTechniques.length})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'inline-block' }}></span>
            Catalog
          </span>
        </div>
      </div>

      {/* Matrix Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '10px' }}>
        {tactics.map(tactic => (
          <div key={tactic.id} className="surface" style={{ padding: '14px 16px' }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>{tactic.id}</span>
              <h4 style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-0)', marginTop: '2px' }}>{tactic.name}</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {tactic.techniques.map((item, i) => {
                const [techId, ...rest] = item.split(' - ');
                const techName = rest.join(' - ') || techId;
                const isActive = !!activeMap[techId];
                return (
                  <div key={i} onClick={() => setSelectedTech({ id: techId, name: techName, tactic: tactic.name, isActive, details: activeMap[techId] })}
                    style={{
                      padding: '7px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.76rem',
                      background: isActive ? 'rgba(252,129,129,0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isActive ? 'rgba(252,129,129,0.3)' : 'var(--border)'}`,
                      transition: 'all 0.15s ease'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '600', fontSize: '0.72rem', color: isActive ? 'var(--red)' : 'var(--cyan)' }}>{techId}</span>
                      {isActive && <span className="status-dot" style={{ background: 'var(--red)', width: '5px', height: '5px' }}></span>}
                    </div>
                    <div style={{ color: isActive ? 'var(--text-1)' : 'var(--text-3)', marginTop: '2px', lineHeight: '1.3' }}>{techName}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Technique Detail Modal */}
      {selectedTech && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,9,15,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
          onClick={() => setSelectedTech(null)}>
          <div className="surface" style={{ maxWidth: '480px', width: '100%', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <span className={`tag ${selectedTech.isActive ? 'tag-red' : 'tag-cyan'}`}>{selectedTech.id}</span>
                  <span className="tag tag-purple">{selectedTech.tactic}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-0)' }}>{selectedTech.name}</h3>
              </div>
              <button onClick={() => setSelectedTech(null)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            {selectedTech.isActive ? (
              <div style={{ background: 'rgba(252,129,129,0.06)', border: '1px solid rgba(252,129,129,0.2)', padding: '12px 14px', borderRadius: '6px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--red)', marginBottom: '4px' }}>Detected in Active Threat Report</div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: '1.45' }}>{selectedTech.details?.evidence || 'Technique execution observed in adversary telemetry.'}</p>
                <div style={{ marginTop: '8px' }}><span className="tag tag-green">{selectedTech.details?.confidence || 'HIGH'} confidence</span></div>
              </div>
            ) : (
              <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: '1.5', marginBottom: '16px' }}>This technique is in the MITRE catalog but was not identified in the current threat report.</p>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <a href={`https://attack.mitre.org/techniques/${selectedTech.id.replace('.', '/')}/`} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                <ExternalLink size={14} /><span>View on MITRE</span>
              </a>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { onAskCopilot(`How do we detect and mitigate ${selectedTech.id} (${selectedTech.name})?`); setSelectedTech(null); }}>
                Ask Copilot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
