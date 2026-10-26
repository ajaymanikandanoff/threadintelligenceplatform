import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OverviewTab from './components/OverviewTab';
import DefenseCenter from './components/DefenseCenter';
import IocExplorer from './components/IocExplorer';
import ThreatCopilot from './components/ThreatCopilot';
import TechnicalDeepDive from './components/TechnicalDeepDive';
import IngestModal from './components/IngestModal';
import SettingsModal from './components/SettingsModal';
import ExecutiveReportModal from './components/ExecutiveReportModal';
import CyberGlossaryModal from './components/CyberGlossaryModal';
import {
  FileText,
  ShieldCheck,
  Database,
  Terminal,
  Cpu,
  Loader,
  Radio,
  ChevronRight,
  FileUp,
  AlertCircle
} from 'lucide-react';

const TABS = [
  { id: 'overview',   label: 'Threat Summary',       icon: FileText,    sub: 'What happened & who attacked' },
  { id: 'defense',    label: 'Defense & Rules',      icon: ShieldCheck, sub: 'Firewall & containment rules' },
  { id: 'iocs',       label: 'Block Indicators',     icon: Database,    sub: 'Malicious IPs & file hashes' },
  { id: 'copilot',    label: 'AI Security Copilot',  icon: Terminal,    sub: 'Ask questions in plain English' },
  { id: 'technical',  label: 'Technical Deep Dive',  icon: Cpu,         sub: 'MITRE Matrix & Attack Graph' }
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
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('CYBER_THEME') || 'dark');
  const [apiKey, setApiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('GEMINI_MODEL') || 'gemini-2.5-flash');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [externalCopilotQuery, setExternalCopilotQuery] = useState('');

  // Set Theme attribute on html root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('CYBER_THEME', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [copilotMessages, setCopilotMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Security Copilot. I can explain this cyber attack in simple words, give step-by-step containment instructions, or help write firewall rules. Ask me anything!'
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
          content: `Ingested threat: "${d.title}". Hacker: ${d.threat_actor?.name || 'Unknown'} — ${d.cves?.length || 0} Vulnerabilities, ${d.mitre_techniques?.length || 0} Attack Techniques, ${d.iocs?.length || 0} Malicious Indicators. How can I help you analyze or defend against this threat?`
        }
      ]);
    } catch {
      alert('Backend unreachable. Make sure python backend is running on port 8000.');
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
          content: `Analyzed "${file.name}" (${d.extracted_char_count} chars). Actor: ${d.threat_actor?.name || 'Unknown'} — ${d.cves?.length || 0} CVEs, ${d.mitre_techniques?.length || 0} Techniques. Ready for your questions.`
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
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        threatData={threatData}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Simple & Clean Sidebar */}
        <nav style={{
          width: '240px', flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-1)',
          padding: '16px 12px',
          display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
          {/* Main Navigation */}
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', fontWeight: '700', padding: '0 8px 6px' }}>
            Platform Views
          </div>

          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px', width: '100%', textAlign: 'left',
                  background: active ? 'rgba(99,179,237,0.1)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(99,179,237,0.3)' : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={18} color={active ? 'var(--cyan)' : 'var(--text-3)'} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: active ? '700' : '500', color: active ? 'var(--cyan)' : 'var(--text-1)' }}>
                    {tab.label}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginTop: '2px' }}>
                    {tab.sub}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Real-World Official Advisories Switcher */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'var(--text-3)', fontWeight: '700', padding: '0 8px 8px'
            }}>
              <Radio size={11} color="var(--red)" />
              <span>Government Cyber Feeds</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sampleReports.map(rep => {
                const isSelected = activeReportId === rep.id;
                const shortLabel = rep.id.includes('moveit') || rep.id.includes('158a')
                  ? 'CISA: CL0P / MOVEit'
                  : rep.id.includes('volt')
                  ? 'NSA: Volt Typhoon (LotL)'
                  : rep.id.includes('alphv') || rep.id.includes('blackcat')
                  ? 'FBI: ALPHV Ransomware'
                  : rep.title.slice(0, 22);

                return (
                  <button
                    key={rep.id}
                    onClick={() => analyzeThreatReport(rep.content, rep.title, rep.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 10px', borderRadius: '6px',
                      background: isSelected ? 'rgba(252,129,129,0.1)' : 'var(--bg-2)',
                      border: `1px solid ${isSelected ? 'rgba(252,129,129,0.35)' : 'var(--border)'}`,
                      color: isSelected ? 'var(--red)' : 'var(--text-2)',
                      fontSize: '0.74rem', fontFamily: 'var(--font-mono)',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'all 0.12s ease'
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? 'rgba(252,129,129,0.1)' : 'var(--bg-2)'; }}
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

          {/* Quick Jargon Buster trigger in sidebar */}
          <div style={{ marginTop: 'auto', padding: '12px', background: 'var(--bg-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-0)', marginBottom: '3px' }}>
              💡 Confused by acronyms?
            </div>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-3)', margin: '0 0 8px 0', lineHeight: '1.35' }}>
              Click Jargon Buster to see CVE, IoC & Zero-Day explained in plain English.
            </p>
            <button
              onClick={() => setIsGlossaryOpen(true)}
              className="btn-ghost"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.72rem', padding: '5px' }}
            >
              <span>Open Jargon Buster</span>
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', maxHeight: 'calc(100vh - 58px)' }}>
          {isAnalyzing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '420px', gap: '16px' }}>
              <Loader size={30} color="var(--cyan)" className="spin" />
              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-0)' }}>
                Analyzing Threat Report with Gemini AI…
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', maxWidth: '440px', textAlign: 'center', lineHeight: '1.6' }}>
                Extracting hacker attribution, identifying software vulnerabilities, mapping tactics to MITRE ATT&CK, and generating firewall defense rules.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  threatData={threatData}
                  onSwitchTab={setActiveTab}
                  onOpenIngest={() => setIsIngestOpen(true)}
                />
              )}
              {activeTab === 'defense' && (
                <DefenseCenter
                  defenseArtifacts={threatData?.defense_artifacts}
                  threatData={threatData}
                />
              )}
              {activeTab === 'iocs' && (
                <IocExplorer
                  iocs={threatData?.iocs || []}
                  threatData={threatData}
                />
              )}
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
              {activeTab === 'technical' && (
                <TechnicalDeepDive
                  tactics={tactics}
                  threatData={threatData}
                  onAskCopilot={askCopilot}
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
      <CyberGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />
    </div>
  );
}
