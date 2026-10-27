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
  LayoutDashboard,
  ShieldCheck,
  Search,
  MessageSquare,
  Cpu,
  Loader,
  Radio,
  ChevronRight,
  BookOpen
} from 'lucide-react';

const TABS = [
  { id: 'overview',  label: 'Threat Overview',    icon: LayoutDashboard, sub: 'What happened & who attacked' },
  { id: 'defense',   label: 'Defense Center',      icon: ShieldCheck,     sub: 'Firewall & containment rules' },
  { id: 'iocs',      label: 'Threat Indicators',   icon: Search,          sub: 'IPs, hashes & domains to block' },
  { id: 'copilot',   label: 'AI Copilot',          icon: MessageSquare,   sub: 'Ask questions in plain English' },
  { id: 'technical', label: 'Technical Deep Dive', icon: Cpu,             sub: 'MITRE ATT&CK & attack graph' },
];

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', gap: '20px', padding: '60px 20px'
    }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '14px',
        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 30px rgba(14,165,233,0.4)',
        animation: 'pulse-dot 1.5s ease-in-out infinite'
      }}>
        <Loader size={24} color="#fff" className="spin" />
      </div>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Analyzing Threat Report
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
          Gemini AI is extracting threat actors, mapping vulnerabilities to MITRE ATT&CK, and generating firewall defense rules in real-time.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {['Extracting IoCs', 'Mapping MITRE', 'Generating Rules'].map((s, i) => (
          <div key={i} style={{
            padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
            background: 'var(--bg-overlay)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
            animation: `pulse-dot 1.2s ease-in-out ${i * 0.4}s infinite`
          }}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onOpenIngest }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', gap: '24px', padding: '60px 20px', textAlign: 'center'
    }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '18px',
        background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(99,102,241,0.2))',
        border: '1px solid rgba(14,165,233,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <ShieldCheck size={28} color="var(--accent)" />
      </div>

      <div style={{ maxWidth: '420px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          No Threat Loaded
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.65', margin: 0 }}>
          Load a government security advisory from the sidebar, or click <strong style={{ color: 'var(--accent)' }}>Analyze Threat</strong> to upload your own PDF / paste logs.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { label: '🏛️ CISA Advisory', desc: 'CL0P Ransomware / MOVEit' },
          { label: '🛡️ NSA Report', desc: 'Volt Typhoon China APT' },
          { label: '🚨 FBI Alert', desc: 'ALPHV BlackCat Ransomware' },
        ].map(f => (
          <div key={f.label} style={{
            padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-secondary)',
            minWidth: '130px'
          }}>
            <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '13px', marginBottom: '2px' }}>{f.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab]             = useState('overview');
  const [threatData, setThreatData]           = useState(null);
  const [sampleReports, setSampleReports]     = useState([]);
  const [activeReportId, setActiveReportId]   = useState(null);
  const [tactics, setTactics]                 = useState([]);
  const [isIngestOpen, setIsIngestOpen]       = useState(false);
  const [isSettingsOpen, setIsSettingsOpen]   = useState(false);
  const [isReportOpen, setIsReportOpen]       = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen]   = useState(false);
  const [theme, setTheme]                     = useState(localStorage.getItem('CYBER_THEME') || 'dark');
  const [apiKey, setApiKey]                   = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [selectedModel, setSelectedModel]     = useState(localStorage.getItem('GEMINI_MODEL') || 'gemini-2.5-flash');
  const [isAnalyzing, setIsAnalyzing]         = useState(false);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [externalCopilotQuery, setExternalCopilotQuery] = useState('');
  const [copilotMessages, setCopilotMessages] = useState([{
    role: 'assistant',
    content: '👋 Hello! I\'m your AI Security Copilot. I can explain cyber attacks in plain language, give step-by-step containment instructions, or help write firewall rules.\n\nLoad a threat report on the left to get started, then ask me anything!'
  }]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('CYBER_THEME', theme);
  }, [theme]);

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
      setCopilotMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ Threat ingested: **"${d.title}"**\n\nAttacker: ${d.threat_actor?.name || 'Unknown'} | CVEs: ${d.cves?.length || 0} | Attack Techniques: ${d.mitre_techniques?.length || 0} | Malicious Indicators: ${d.iocs?.length || 0}\n\nWhat would you like to know?`
      }]);
    } catch {
      console.error('Backend unreachable on port 8000.');
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  const handleUploadFile = async (file) => {
    setIsAnalyzing(true);
    setActiveReportId('uploaded-custom');
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
      setCopilotMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ Analyzed "${file.name}" (${d.extracted_char_count?.toLocaleString()} chars)\n\nActor: ${d.threat_actor?.name || 'Unknown'} | CVEs: ${d.cves?.length || 0} | Techniques: ${d.mitre_techniques?.length || 0}\n\nReady for your questions.`
      }]);
    } catch (err) { alert(`Upload error: ${err.message}`); }
    finally { setIsAnalyzing(false); }
  };

  const handleSendMessage = async (q) => {
    const msgs = [...copilotMessages, { role: 'user', content: q }];
    setCopilotMessages(msgs);
    setIsCopilotLoading(true);
    try {
      const r = await fetch('http://localhost:8000/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, context_threat: threatData || {}, chat_history: msgs.slice(-6), api_key: apiKey || null, model: selectedModel })
      });
      const d = await r.json();
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: d.reply || 'No response.' }]);
    } catch {
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: '❌ Could not reach backend.' }]);
    } finally { setIsCopilotLoading(false); }
  };

  const askCopilot = (text) => { setActiveTab('copilot'); setExternalCopilotQuery(text); };

  const FEED_LABELS = {
    moveit: 'CISA: CL0P / MOVEit',
    '158a': 'CISA: CL0P / MOVEit',
    volt: 'NSA: Volt Typhoon',
    alphv: 'FBI: ALPHV Ransomware',
    blackcat: 'FBI: ALPHV Ransomware',
  };
  const getFeedLabel = (rep) => {
    for (const [key, label] of Object.entries(FEED_LABELS)) {
      if (rep.id.toLowerCase().includes(key)) return label;
    }
    return rep.title.slice(0, 24);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      <Header
        hasCustomKey={!!apiKey?.trim()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenIngest={() => setIsIngestOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        threatData={threatData}
        theme={theme}
        onToggleTheme={() => setTheme(p => p === 'dark' ? 'light' : 'dark')}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ─── Sidebar ─── */}
        <nav style={{
          width: '220px',
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
          padding: '14px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          overflowY: 'auto',
        }}>
          {/* Nav Tabs */}
          <div className="section-label" style={{ marginBottom: '6px' }}>Navigation</div>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: active ? '600' : '500', lineHeight: '1.2' }}>
                    {tab.label}
                  </div>
                  <div style={{ fontSize: '11px', color: active ? 'rgba(56,189,248,0.7)' : 'var(--text-tertiary)', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tab.sub}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Government Feeds */}
          <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
              <Radio size={10} color="var(--red)" />
              <span className="section-label">Live Feeds</span>
              <span className="status-dot" style={{ background: 'var(--red)', marginLeft: '2px' }}></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {sampleReports.map(rep => {
                const sel = activeReportId === rep.id;
                return (
                  <button
                    key={rep.id}
                    onClick={() => analyzeThreatReport(rep.content, rep.title, rep.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 9px', borderRadius: '6px', textAlign: 'left', width: '100%',
                      background: sel ? 'rgba(248,113,113,0.08)' : 'transparent',
                      border: `1px solid ${sel ? 'rgba(248,113,113,0.25)' : 'transparent'}`,
                      color: sel ? 'var(--red)' : 'var(--text-secondary)',
                      fontSize: '11px', fontFamily: 'var(--font-mono)',
                      cursor: 'pointer', transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={e => { if (!sel) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                    onMouseLeave={e => { if (!sel) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                    title={rep.title}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {getFeedLabel(rep)}
                    </span>
                    <ChevronRight size={10} style={{ flexShrink: 0, marginLeft: '4px', opacity: sel ? 1 : 0.4 }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Glossary button at bottom */}
          <div style={{ marginTop: 'auto', paddingTop: '14px' }}>
            <button
              onClick={() => setIsGlossaryOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer',
                fontSize: '12px', fontFamily: 'var(--font-sans)', fontWeight: '500',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <BookOpen size={13} />
              <span>Cyber Glossary</span>
            </button>
          </div>
        </nav>

        {/* ─── Main Content ─── */}
        <main style={{
          flex: 1,
          padding: '24px 28px',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 52px)',
        }}>
          {isAnalyzing ? <LoadingScreen /> : (
            <>
              {!threatData && activeTab !== 'copilot' && <EmptyState onOpenIngest={() => setIsIngestOpen(true)} />}
              {(threatData || activeTab === 'copilot') && (
                <>
                  {activeTab === 'overview'  && <OverviewTab threatData={threatData} onSwitchTab={setActiveTab} onOpenIngest={() => setIsIngestOpen(true)} />}
                  {activeTab === 'defense'   && <DefenseCenter defenseArtifacts={threatData?.defense_artifacts} threatData={threatData} />}
                  {activeTab === 'iocs'      && <IocExplorer iocs={threatData?.iocs || []} threatData={threatData} />}
                  {activeTab === 'technical' && <TechnicalDeepDive tactics={tactics} threatData={threatData} onAskCopilot={askCopilot} />}
                </>
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
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <IngestModal isOpen={isIngestOpen} onClose={() => setIsIngestOpen(false)} sampleReports={sampleReports} onAnalyze={analyzeThreatReport} onUploadFile={handleUploadFile} isAnalyzing={isAnalyzing} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} apiKey={apiKey} setApiKey={setApiKey} selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
      <ExecutiveReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} threatData={threatData} />
      <CyberGlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
    </div>
  );
}
