import React, { useState } from 'react';
import { Target, GitCommit, BarChart3, HelpCircle, Layers } from 'lucide-react';
import MitreMatrix from './MitreMatrix';
import KnowledgeGraph from './KnowledgeGraph';
import AnalyticsDashboard from './AnalyticsDashboard';

export default function TechnicalDeepDive({ tactics, threatData, onAskCopilot }) {
  const [subTab, setSubTab] = useState('mitre');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Subtab Navigation Pills */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: '10px',
        border: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'mitre',     label: 'MITRE ATT&CK Matrix', icon: Target },
            { id: 'graph',     label: 'Threat Knowledge Graph', icon: GitCommit },
            { id: 'analytics', label: 'SOC Metrics & Threat Radar', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '7px 14px', borderRadius: '7px',
                  background: active ? 'var(--bg-overlay)' : 'transparent',
                  border: `1px solid ${active ? 'var(--border-accent)' : 'transparent'}`,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans)', fontSize: '12px',
                  fontWeight: active ? '700' : '500', cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} color={active ? 'var(--accent)' : 'currentColor'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={13} />
          <span>Interactive Cybersecurity Forensics & Taxonomy</span>
        </div>
      </div>

      {/* Tab Contents */}
      <div>
        {subTab === 'mitre' && (
          <MitreMatrix
            tactics={tactics}
            activeTechniques={threatData?.mitre_techniques || []}
            onAskCopilot={onAskCopilot}
          />
        )}
        {subTab === 'graph' && (
          <KnowledgeGraph
            graphData={threatData?.graph_data}
            onAskCopilot={onAskCopilot}
          />
        )}
        {subTab === 'analytics' && (
          <AnalyticsDashboard threatData={threatData} />
        )}
      </div>

    </div>
  );
}
