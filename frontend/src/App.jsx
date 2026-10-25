import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OverviewTab from './components/OverviewTab';
import KnowledgeGraph from './components/KnowledgeGraph';
import MitreMatrix from './components/MitreMatrix';
import DefenseCenter from './components/DefenseCenter';
import ThreatCopilot from './components/ThreatCopilot';
import IngestModal from './components/IngestModal';
import SettingsModal from './components/SettingsModal';
import { Activity, GitCommit, Target, ShieldCheck, Terminal, Loader } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview',         icon: Activity },
  { id: 'graph',    label: 'Knowledge Graph',  icon: GitCommit },
  { id: 'mitre',    label: 'MITRE ATT&CK',     icon: Target },
  { id: 'defense',  label: 'Defense Rules',     icon: ShieldCheck },
  { id: 'copilot',  label: 'AI Copilot',        icon: Terminal }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [threatData, setThreatData] = useState(null);
  const [sampleReports, setSampleReports] = useState([]);
  const [tactics, setTactics] = useState([]);
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('GEMINI_MODEL') || 'gemini-2.5-flash');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [externalCopilotQuery, setExternalCopilotQuery] = useState('');

  const [copilotMessages, setCopilotMessages] = useState([
    { role: 'assistant', content: 'Welcome to the Threat Intelligence Copilot. I can help you analyze adversary TTPs, suggest mitigations, draft SIEM rules, or answer questions about the currently loaded threat report.' }
  ]);

  useEffect(() => {
    (async () => {
      try {
        const [rr, mr] = await Promise.all([
          fetch('http://localhost:8000/api/sample-reports'),
          fetch('http://localhost:8000/api/mitre-matrix')
        ]);
        const rd = await rr.json(), md = await mr.json();
        setSampleReports(rd.reports || []);
        setTactics(md.tactics || []);
        if (rd.reports?.length > 0) analyzeThreatReport(rd.reports[0].content, rd.reports[0].title);
      } catch (err) { console.error('Init error:', err); }
    })();
  }, []);

  const analyzeThreatReport = async (text, title) => {
    setIsAnalyzing(true);
    try {
      const r = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, title, api_key: apiKey || null, model: selectedModel })
      });
      const d = await r.json();
      setThreatData(d);
      setIsIngestOpen(false);
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: `Loaded: "${d.title}". Actor: ${d.threat_actor?.name} — ${d.cves?.length || 0} CVEs, ${d.mitre_techniques?.length || 0} TTPs mapped. You can now ask me questions about this threat.` }]);
    } catch { alert('Backend unreachable. Start the server on port 8000.'); }
    finally { setIsAnalyzing(false); }
  };

  const handleUploadFile = async (file) => {
    setIsAnalyzing(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (apiKey) fd.append('api_key', apiKey);
      if (selectedModel) fd.append('model', selectedModel);
      const r = await fetch('http://localhost:8000/api/upload-pdf', { method: 'POST', body: fd });
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Upload failed'); }
      const d = await r.json();
      setThreatData(d);
      setIsIngestOpen(false);
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: `Processed "${file.name}" (${d.extracted_char_count} chars). Actor: ${d.threat_actor?.name} — ${d.cves?.length || 0} CVEs, ${d.mitre_techniques?.length || 0} TTPs.` }]);
    } catch (err) { alert(`Upload error: ${err.message}`); }
    finally { setIsAnalyzing(false); }
  };

  const handleSendMessage = async (q) => {
    const msgs = [...copilotMessages, { role: 'user', content: q }];
    setCopilotMessages(msgs);
    setIsCopilotLoading(true);
    try {
      const r = await fetch('http://localhost:8000/api/copilot', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, context_threat: threatData || {}, chat_history: msgs.slice(-6), api_key: apiKey || null, model: selectedModel })
      });
      const d = await r.json();
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: d.reply || 'No response.' }]);
    } catch { setCopilotMessages(prev => [...prev, { role: 'assistant', content: 'Could not reach backend.' }]); }
    finally { setIsCopilotLoading(false); }
  };

  const askCopilot = (text) => { setActiveTab('copilot'); setExternalCopilotQuery(text); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-0)' }}>
      <Header hasCustomKey={!!apiKey?.trim()} onOpenSettings={() => setIsSettingsOpen(true)} onOpenIngest={() => setIsIngestOpen(true)} />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar Navigation */}
        <nav style={{
          width: '220px', flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-1)',
          padding: '16px 10px',
          display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '7px', width: '100%', textAlign: 'left',
                  background: active ? 'rgba(99,179,237,0.1)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  color: active ? 'var(--cyan)' : 'var(--text-3)',
                  fontFamily: 'var(--font-sans)', fontSize: '0.84rem', fontWeight: active ? '600' : '500',
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Threat info at bottom of sidebar */}
          {threatData && (
            <div style={{ marginTop: 'auto', padding: '14px', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: '600', marginBottom: '6px' }}>Active Threat</div>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--red)', lineHeight: '1.3', marginBottom: '4px' }}>{threatData.threat_actor?.name || 'Unknown'}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                {threatData.cves?.length || 0} CVEs · {threatData.iocs?.length || 0} IoCs
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', maxHeight: 'calc(100vh - 56px)' }}>
          {isAnalyzing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px' }}>
              <Loader size={28} color="var(--cyan)" className="spin" />
              <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-0)' }}>Extracting Threat Intelligence…</div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-3)', maxWidth: '420px', textAlign: 'center', lineHeight: '1.5' }}>
                Parsing IoCs, CVEs, mapping TTPs to MITRE ATT&CK, and generating detection rules.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab threatData={threatData} onSwitchTab={setActiveTab} />}
              {activeTab === 'graph' && <KnowledgeGraph graphData={threatData?.graph_data} onAskCopilot={askCopilot} />}
              {activeTab === 'mitre' && <MitreMatrix tactics={tactics} activeTechniques={threatData?.mitre_techniques || []} onAskCopilot={askCopilot} />}
              {activeTab === 'defense' && <DefenseCenter defenseArtifacts={threatData?.defense_artifacts} />}
              {activeTab === 'copilot' && <ThreatCopilot messages={copilotMessages} onSendMessage={handleSendMessage} isLoading={isCopilotLoading} threatActor={threatData?.threat_actor?.name} externalQuery={externalCopilotQuery} onClearExternalQuery={() => setExternalCopilotQuery('')} />}
            </>
          )}
        </main>
      </div>

      <IngestModal isOpen={isIngestOpen} onClose={() => setIsIngestOpen(false)} sampleReports={sampleReports} onAnalyze={analyzeThreatReport} onUploadFile={handleUploadFile} isAnalyzing={isAnalyzing} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} apiKey={apiKey} setApiKey={setApiKey} selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
    </div>
  );
}
