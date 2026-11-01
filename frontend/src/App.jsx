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
  BookOpen,
  FileUp
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    heading: 'OPERATIONS',
    items: [
      { id: 'overview',  label: 'Threat Overview',    icon: LayoutDashboard, sub: 'Incident dossier & metrics' },
      { id: 'defense',   label: 'Defense Center',      icon: ShieldCheck,     sub: 'Firewall rules & SIEM detections' },
    ]
  },
  {
    heading: 'INTELLIGENCE',
    items: [
      { id: 'iocs',      label: 'Threat Indicators',   icon: Search,          sub: 'Malicious IPs, domains & hashes' },
      { id: 'technical', label: 'Technical Deep Dive', icon: Cpu,             sub: 'MITRE matrix & knowledge graph' },
    ]
  },
  {
    heading: 'AI ASSISTANT',
    items: [
      { id: 'copilot',   label: 'AI Security Copilot', icon: MessageSquare,   sub: 'Interactive SOC intelligence' },
    ]
  }
];

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', minHeight: '60vh', gap: '24px', padding: '60px 20px'
    }}>
      <div style={{
        position: 'relative',
        width: '64px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '2px solid rgba(56, 189, 248, 0.2)',
          borderTopColor: 'var(--accent)',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{
          position: 'absolute', inset: '8px',
          borderRadius: '50%',
          border: '2px dashed rgba(129, 140, 248, 0.3)',
          borderBottomColor: 'var(--purple)',
          animation: 'spin 2s linear infinite reverse'
        }} />
        <Loader size={20} color="var(--accent)" />
      </div>

      <div style={{ textAlign: 'center', maxWidth: '440px' }}>
        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Extracting Threat Intelligence
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
          Google Gemini AI is synthesizing adversary attribution, mapping enterprise MITRE ATT&CK vectors, and formulating defensive perimeter scripts.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Attribution & CVEs', 'MITRE Heatmap Matrix', 'Perimeter Containment Rules'].map((s, i) => (
          <div key={i} style={{
            padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
            background: 'var(--bg-overlay)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)'
          }}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onOpenIngest, onSelectReport }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '70vh', gap: '28px', padding: '60px 20px', textAlign: 'center'
    }}>
      <div style={{
        width: '72px', height: '72px', borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(129,140,248,0.15))',
        border: '1px solid rgba(56,189,248,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 32px rgba(56,189,248,0.12)'
      }}>
        <ShieldCheck size={32} color="var(--accent)" strokeWidth={2.2} />
      </div>

      <div style={{ maxWidth: '480px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          No Threat Campaign Active
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.65', margin: 0 }}>
          Select a verified government cyber advisory below to inspect adversary techniques, or click <strong style={{ color: 'var(--accent)' }}>Analyze Advisory</strong> to upload an incident PDF or paste raw telemetry.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', maxWidth: '680px', width: '100%' }}>
        {[
          { label: '🏛️ CISA Advisory AA23-158A', desc: 'CL0P Ransomware / MOVEit Transfer', id: 'cisa-aa23-158a', badge: 'CRITICAL' },
          { label: '🛡️ NSA / CISA Alert', desc: 'Volt Typhoon Living-off-the-Land APT', id: 'cisa-volt-typhoon', badge: 'NATION-STATE' },
          { label: '🚨 FBI Cyber Alert', desc: 'ALPHV BlackCat Healthcare Extortion', id: 'alphv-blackcat-healthcare', badge: 'HIGH SEV' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => onSelectReport ? onSelectReport(f.id) : onOpenIngest?.()}
            style={{
              padding: '16px 18px', borderRadius: '12px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', textAlign: 'left', cursor: 'pointer',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex', flexDirection: 'column', gap: '6px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: 'rgba(56,189,248,0.1)', color: 'var(--accent)' }}>
                {f.badge}
              </span>
            </div>
            <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '13px', marginTop: '2px' }}>{f.label}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{f.desc}</div>
          </button>
        ))}
      </div>

      <button className="btn-primary" onClick={onOpenIngest} style={{ padding: '9px 20px', fontSize: '13px' }}>
        <FileUp size={15} /> Ingest Custom Advisory / PDF
      </button>
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
    content: '👋 Hello! I\'m your AI Security Copilot. I can analyze threat incident reports, correlate MITRE ATT&CK techniques, provide step-by-step containment instructions, and generate defensive firewall rules.\n\nSelect a threat report from the left sidebar to get started, then ask me anything!'
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

        {/* ─── Categorized Enterprise Sidebar ─── */}
        <nav style={{
          width: '240px',
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
        }}>
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div className="section-label" style={{ marginBottom: '4px' }}>
                {section.heading}
              </div>
              {section.items.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`nav-item ${active ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={16} className="nav-icon" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '13px', lineHeight: '1.2' }}>
                        {tab.label}
                      </div>
                      <div style={{
                        fontSize: '10.5px',
                        color: active ? 'rgba(56,189,248,0.75)' : 'var(--text-tertiary)',
                        marginTop: '1px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {tab.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

          {/* Government Live Threat Feeds */}
          <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', padding: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Radio size={11} color="var(--red)" />
                <span className="section-label">Live Advisory Feeds</span>
              </div>
              <span className="status-dot" style={{ background: 'var(--red)', width: '6px', height: '6px' }} />
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
                      padding: '8px 10px', borderRadius: '6px', textAlign: 'left', width: '100%',
                      background: sel ? 'rgba(244,63,94,0.08)' : 'transparent',
                      border: `1px solid ${sel ? 'rgba(244,63,94,0.25)' : 'transparent'}`,
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
                    <ChevronRight size={11} style={{ flexShrink: 0, marginLeft: '4px', opacity: sel ? 1 : 0.4 }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature Guide Shortcut */}
          <div style={{ paddingTop: '8px' }}>
            <button
              onClick={() => setIsGlossaryOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', padding: '9px 12px', borderRadius: '8px',
                background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer',
                fontSize: '12px', fontFamily: 'var(--font-sans)', fontWeight: '500',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <BookOpen size={13} color="var(--accent)" />
              <span>Platform Feature Guide</span>
            </button>
          </div>
        </nav>

        {/* ─── Main Content Canvas ─── */}
        <main style={{
          flex: 1,
          padding: '24px 32px',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 56px)',
        }}>
          {isAnalyzing ? <LoadingScreen /> : (
            <>
              {!threatData && activeTab !== 'copilot' && (
                <EmptyState
                  onOpenIngest={() => setIsIngestOpen(true)}
                  onSelectReport={(repId) => {
                    const rep = sampleReports.find(x => x.id === repId);
                    if (rep) analyzeThreatReport(rep.content, rep.title, rep.id);
                  }}
                />
              )}
              {(threatData || activeTab === 'copilot') && (
                <>
                  {activeTab === 'overview'  && <OverviewTab threatData={threatData} onSwitchTab={setActiveTab} _onOpenIngest={() => setIsIngestOpen(true)} />}
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
