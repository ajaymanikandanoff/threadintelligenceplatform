import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OverviewTab from './components/OverviewTab';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import IocExplorer from './components/IocExplorer';
import KnowledgeGraph from './components/KnowledgeGraph';
import MitreMatrix from './components/MitreMatrix';
import DefenseCenter from './components/DefenseCenter';
import ThreatCopilot from './components/ThreatCopilot';
import IngestModal from './components/IngestModal';
import SettingsModal from './components/SettingsModal';
import ExecutiveReportModal from './components/ExecutiveReportModal';
import {
  Activity,
  BarChart3,
  Database,
  GitCommit,
  Target,
  ShieldCheck,
  Terminal,
  Loader,
  Radio,
  ChevronRight
} from 'lucide-react';

const TABS = [
  { id: 'overview',   label: 'Overview',          icon: Activity },
  { id: 'analytics',  label: 'Analytics & Risk',  icon: BarChart3 },
  { id: 'iocs',       label: 'IoC Explorer',      icon: Database },
  { id: 'graph',      label: 'Knowledge Graph',   icon: GitCommit },
  { id: 'mitre',      label: 'MITRE ATT&CK',      icon: Target },
  { id: 'defense',    label: 'Defense Rules',      icon: ShieldCheck },
  { id: 'copilot',    label: 'AI Copilot',         icon: Terminal }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [threatData, setThreatData] = useState(null);
  const [sampleReports, setSampleReports] = useState([]);
  const [activeReportId, setActiveReportId] = useState(null);
  const [tactics, setTactics] = useState([]);
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('GEMINI_MODEL') || 'gemini-2.5-flash');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [externalCopilotQuery, setExternalCopilotQuery] = useState('');

  const [copilotMessages, setCopilotMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to the Threat Intelligence Copilot. I can help you analyze adversary TTPs, suggest mitigations, draft SIEM/YARA rules, or investigate indicators from this campaign.'
    }
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
        if (rd.reports?.length > 0) {
          setActiveReportId(rd.reports[0].id);
          analyzeThreatReport(rd.reports[0].content, rd.reports[0].title);
        }
      } catch (err) {
        console.error('Init error:', err);
      }
    })();
  }, []);

  const analyzeThreatReport = async (text, title, reportId = null) => {
    setIsAnalyzing(true);
    if (reportId) setActiveReportId(reportId);
    try {
      const r = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, title, api_key: apiKey || null, model: selectedModel })
      });
      const d = await r.json();
      setThreatData(d);
      setIsIngestOpen(false);
      setCopilotMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Ingested: "${d.title}". Actor: ${d.threat_actor?.name || 'Unknown'} — ${d.cves?.length || 0} CVEs, ${d.mitre_techniques?.length || 0} TTPs mapped, ${d.iocs?.length || 0} IoCs extracted. What would you like to investigate?`
        }
      ]);
    } catch {
      alert('Backend unreachable. Ensure backend server is running on port 8000.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadFile = async (file) => {
    setIsAnalyzing(true);
    setActiveReportId('uploaded-custom');
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (apiKey) fd.append('api_key', apiKey);
      if (selectedModel) fd.append('model', selectedModel);
      const r = await fetch('http://localhost:8000/api/upload-pdf', { method: 'POST', body: fd });
      if (!r.ok) {
        const e = await r.json();
        throw new Error(e.detail || 'Upload failed');
      }
      const d = await r.json();
      setThreatData(d);
      setIsIngestOpen(false);
      setCopilotMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Processed "${file.name}" (${d.extracted_char_count} chars). Actor: ${d.threat_actor?.name || 'Unknown'} — ${d.cves?.length || 0} CVEs, ${d.mitre_techniques?.length || 0} TTPs.`
        }
      ]);
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (q) => {
    const msgs = [...copilotMessages, { role: 'user', content: q }];
    setCopilotMessages(msgs);
    setIsCopilotLoading(true);
    try {
      const r = await fetch('http://localhost:8000/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          context_threat: threatData || {},
          chat_history: msgs.slice(-6),
          api_key: apiKey || null,
          model: selectedModel
        })
      });
      const d = await r.json();
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: d.reply || 'No response.' }]);
    } catch {
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: 'Could not reach backend.' }]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const askCopilot = (text) => {
    setActiveTab('copilot');
    setExternalCopilotQuery(text);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-0)' }}>
      <Header
        hasCustomKey={!!apiKey?.trim()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenIngest={() => setIsIngestOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        threatData={threatData}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar Navigation */}
        <nav style={{
          width: '235px', flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-1)',
          padding: '16px 10px',
          display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
          {/* Main Navigation Tabs */}
          <div style={{ fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', fontWeight: '700', padding: '0 12px 6px' }}>
            Navigation
          </div>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '7px', width: '100%', textAlign: 'left',
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

          {/* Quick Threat Feed Switcher */}
          <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'var(--text-3)', fontWeight: '700', padding: '0 12px 8px'
            }}>
              <Radio size={11} color="var(--red)" />
              <span>Live Threat Feed</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {sampleReports.map(rep => {
                const isSelected = activeReportId === rep.id;
                // shorten label
                const shortLabel = rep.id.includes('moveit') || rep.id.includes('158a')
                  ? 'CL0P / MOVEit'
                  : rep.id.includes('volt')
                  ? 'Volt Typhoon (LotL)'
                  : rep.id.includes('alphv') || rep.id.includes('blackcat')
                  ? 'ALPHV / BlackCat'
                  : rep.title.slice(0, 20);

                return (
                  <button
                    key={rep.id}
                    onClick={() => analyzeThreatReport(rep.content, rep.title, rep.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 10px', borderRadius: '5px',
                      background: isSelected ? 'rgba(252,129,129,0.1)' : 'transparent',
                      border: `1px solid ${isSelected ? 'rgba(252,129,129,0.3)' : 'transparent'}`,
                      color: isSelected ? 'var(--red)' : 'var(--text-2)',
                      fontSize: '0.74rem', fontFamily: 'var(--font-mono)',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'all 0.12s ease'
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    title={rep.title}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {shortLabel}
                    </span>
                    <ChevronRight size={12} opacity={isSelected ? 1 : 0.4} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Threat Summary Info Card */}
          {threatData && (
            <div style={{ marginTop: 'auto', padding: '12px', background: 'var(--bg-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.64rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: '700', marginBottom: '4px' }}>
                Active Adversary
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--red)', lineHeight: '1.2', marginBottom: '4px' }}>
                {threatData.threat_actor?.name || 'Unattributed'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                {threatData.cves?.length || 0} CVEs · {threatData.iocs?.length || 0} IoCs
              </div>
            </div>
          )}
        </nav>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', maxHeight: 'calc(100vh - 56px)' }}>
          {isAnalyzing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px' }}>
              <Loader size={28} color="var(--cyan)" className="spin" />
              <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-0)' }}>Extracting Threat Intelligence…</div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-3)', maxWidth: '420px', textAlign: 'center', lineHeight: '1.5' }}>
                Parsing IoCs, mapping adversary TTPs to MITRE ATT&CK, calculating risk score, and generating defense rules.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab threatData={threatData} onSwitchTab={setActiveTab} />}
              {activeTab === 'analytics' && <AnalyticsDashboard threatData={threatData} />}
              {activeTab === 'iocs' && <IocExplorer iocs={threatData?.iocs || []} threatData={threatData} />}
              {activeTab === 'graph' && <KnowledgeGraph graphData={threatData?.graph_data} onAskCopilot={askCopilot} />}
              {activeTab === 'mitre' && <MitreMatrix tactics={tactics} activeTechniques={threatData?.mitre_techniques || []} onAskCopilot={askCopilot} />}
              {activeTab === 'defense' && <DefenseCenter defenseArtifacts={threatData?.defense_artifacts} />}
              {activeTab === 'copilot' && (
                <ThreatCopilot
                  messages={copilotMessages}
                  onSendMessage={handleSendMessage}
                  isLoading={isCopilotLoading}
                  threatActor={threatData?.threat_actor?.name}
                  externalQuery={externalCopilotQuery}
                  onClearExternalQuery={() => setExternalCopilotQuery('')}
                />
              )}
            </>
          )}
        </main>
      </div>

      <IngestModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        sampleReports={sampleReports}
        onAnalyze={analyzeThreatReport}
        onUploadFile={handleUploadFile}
        isAnalyzing={isAnalyzing}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
      <ExecutiveReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        threatData={threatData}
      />
    </div>
  );
}
