import React, { useState } from 'react';
import { Target, Shield, AlertTriangle, ExternalLink, Info, CheckCircle2, X } from 'lucide-react';

export default function MitreMatrix({ tactics = [], activeTechniques = [], onAskCopilot }) {
  const [selectedTech, setSelectedTech] = useState(null);

  // Map active techniques by ID for rapid lookup
  const activeMap = {};
  activeTechniques.forEach(t => {
    activeMap[t.id] = t;
    // Also map sub-technique base ID if applicable (e.g. T1059.001 -> T1059)
    const baseId = t.id.split('.')[0];
    if (!activeMap[baseId]) {
      activeMap[baseId] = t;
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="cyber-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Target size={20} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.03em' }}>
              MITRE ATT&CK® Enterprise Matrix Heatmap
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            14 Enterprise Tactics with real-time detection overlay. Illuminated cells highlight techniques extracted from current adversary activity.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(255, 51, 102, 0.35)', border: '1px solid var(--accent-red)', display: 'inline-block' }}></span>
            <span>Active Adversary Technique ({activeTechniques.length})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', display: 'inline-block' }}></span>
            <span>Standard Catalog</span>
          </div>
        </div>
      </div>

      {/* Responsive Horizontal Matrix Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
        overflowX: 'auto',
        paddingBottom: '16px'
      }}>
        {tactics.map((tactic) => {
          return (
            <div key={tactic.id} className="cyber-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Tactic Header */}
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                  {tactic.id}
                </span>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', marginTop: '2px' }}>
                  {tactic.name}
                </h4>
              </div>

              {/* Techniques List in this Tactic */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tactic.techniques.map((item, idx) => {
                  const parts = item.split(' - ');
                  const techId = parts[0];
                  const techName = parts[1] || techId;
                  const isActive = !!activeMap[techId];
                  const activeDetails = activeMap[techId];

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedTech({
                          id: techId,
                          name: techName,
                          tactic: tactic.name,
                          isActive,
                          details: activeDetails
                        });
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.76rem',
                        transition: 'all 0.2s ease',
                        background: isActive ? 'rgba(255, 51, 102, 0.16)' : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${isActive ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                        boxShadow: isActive ? '0 0 10px rgba(255, 51, 102, 0.25)' : 'none',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '700',
                          color: isActive ? 'var(--accent-red)' : 'var(--accent-cyan)'
                        }}>
                          {techId}
                        </span>
                        {isActive && (
                          <span className="pulse-dot" style={{ background: 'var(--accent-red)', width: '6px', height: '6px' }}></span>
                        )}
                      </div>
                      <div style={{ color: isActive ? '#fff' : 'var(--text-muted)', lineHeight: '1.25' }}>
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

      {/* Selected Technique Detail Modal */}
      {selectedTech && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 8, 17, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }} onClick={() => setSelectedTech(null)}>
          <div 
            className="cyber-card" 
            style={{ 
              maxWidth: '560px', 
              width: '100%', 
              padding: '26px',
              border: `1px solid ${selectedTech.isActive ? 'var(--accent-red)' : 'var(--border-glow)'}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${selectedTech.isActive ? 'badge-red' : 'badge-cyan'}`}>
                    {selectedTech.id}
                  </span>
                  <span className="badge badge-purple">{selectedTech.tactic}</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginTop: '8px' }}>
                  {selectedTech.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTech(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {selectedTech.isActive ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  background: 'rgba(255, 51, 102, 0.08)',
                  border: '1px solid rgba(255, 51, 102, 0.25)',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  fontSize: '0.84rem'
                }}>
                  <strong style={{ color: 'var(--accent-red)', display: 'block', marginBottom: '4px' }}>
                    🚨 Incident Report Evidence:
                  </strong>
                  <span style={{ color: '#fecdd3' }}>
                    {selectedTech.details?.evidence || 'Adversary execution observed in current active threat telemetry.'}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <strong>Confidence:</strong> <span className="badge badge-green">{selectedTech.details?.confidence || 'HIGH'}</span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                This technique is part of the standard MITRE Enterprise ATT&CK matrix. It was not explicitly identified in the current loaded threat report.
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
              <a
                href={`https://attack.mitre.org/techniques/${selectedTech.id.replace('.', '/')}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <ExternalLink size={14} />
                <span>View on MITRE</span>
              </a>
              <button
                className="cyber-btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  onAskCopilot(`How do we detect and mitigate MITRE technique ${selectedTech.id} (${selectedTech.name})?`);
                  setSelectedTech(null);
                }}
              >
                <span>Ask Copilot Defense</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
