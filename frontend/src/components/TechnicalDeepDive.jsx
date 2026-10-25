import React, { useState } from 'react';
import { Target, GitCommit, BarChart3, HelpCircle } from 'lucide-react';
import MitreMatrix from './MitreMatrix';
import KnowledgeGraph from './KnowledgeGraph';
import AnalyticsDashboard from './AnalyticsDashboard';

export default function TechnicalDeepDive({ tactics, threatData, onAskCopilot }) {
  const [subTab, setSubTab] = useState('mitre');

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Subtab Navigation Pills */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', background: 'var(--bg-1)', borderRadius: '10px',
        border: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'mitre',     label: 'MITRE ATT&CK Matrix', icon: Target },
            { id: 'graph',     label: 'Interactive Knowledge Graph', icon: GitCommit },
            { id: 'analytics', label: 'Threat Metrics & Risk', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 14px', borderRadius: '7px',
                  background: active ? 'rgba(99,179,237,0.12)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(99,179,237,0.4)' : 'transparent'}`,
                  color: active ? 'var(--cyan)' : 'var(--text-3)',
                  fontFamily: 'var(--font-sans)', fontSize: '0.82rem',
                  fontWeight: active ? '700' : '500', cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '0.74rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <HelpCircle size={13} />
          <span>Technical forensics & taxonomy view</span>
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
