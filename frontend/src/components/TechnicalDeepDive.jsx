import React, { useState } from 'react';
import { Target, GitCommit, BarChart3, Layers } from 'lucide-react';
import MitreMatrix from './MitreMatrix';
import KnowledgeGraph from './KnowledgeGraph';
import AnalyticsDashboard from './AnalyticsDashboard';

export default function TechnicalDeepDive({ tactics, threatData, onAskCopilot }) {
  const [subTab, setSubTab] = useState('mitre');

  const TABS = [
    { id: 'mitre',     label: 'MITRE ATT&CK Matrix Heatmap', icon: Target },
    { id: 'graph',     label: 'Interactive Knowledge Graph',  icon: GitCommit },
    { id: 'analytics', label: 'SOC Intelligence Analytics',   icon: BarChart3 }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Subtab Segmented Switcher */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: '12px',
        border: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{
          display: 'flex', gap: '4px',
          background: 'var(--bg-overlay)', padding: '3px', borderRadius: '9px',
          border: '1px solid var(--border)'
        }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '7px 15px', borderRadius: '7px',
                  background: active ? 'var(--bg-elevated)' : 'transparent',
                  border: `1px solid ${active ? 'var(--border-strong)' : 'transparent'}`,
                  color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontFamily: 'var(--font-sans)', fontSize: '12px',
                  fontWeight: active ? '700' : '500', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <Icon size={14} color={active ? 'var(--accent)' : 'currentColor'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)' }}>
          <Layers size={13} color="var(--accent)" />
          <span>CYBER FORENSICS & ATT&CK TAXONOMY</span>
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
