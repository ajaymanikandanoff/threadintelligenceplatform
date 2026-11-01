import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './views/DashboardView';
import ThreatAnalyzerView from './views/ThreatAnalyzerView';
import ThreatIntelligenceView from './views/ThreatIntelligenceView';
import AttackMappingView from './views/AttackMappingView';
import InvestigationHistoryView from './views/InvestigationHistoryView';
import LoginView from './views/LoginView';

import DefenseCenter from './components/DefenseCenter';
import ThreatCopilot from './components/ThreatCopilot';
import IngestModal from './components/IngestModal';
import SettingsModal from './components/SettingsModal';
import ExecutiveReportModal from './components/ExecutiveReportModal';
import CyberGlossaryModal from './components/CyberGlossaryModal';

import {
  Shield,
  LayoutDashboard,
  Search,
  Globe,
  Crosshair,
  Clock,
  FileText,
  Sliders,
  MessageSquare,
  ShieldCheck,
  Loader
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab]             = useState('dashboard');
  const [threatData, setThreatData]           = useState(null);
  const [sampleReports, setSampleReports]     = useState([]);
  const [activeReportId, setActiveReportId]   = useState(null);
  const [_tactics, setTactics]               = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  // Modals & Auth
  const [isIngestOpen, setIsIngestOpen]       = useState(false);
  const [isSettingsOpen, setIsSettingsOpen]   = useState(false);
  const [isReportOpen, setIsReportOpen]       = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen]   = useState(false);
  const [isAuthOpen, setIsAuthOpen]           = useState(false);
  const [currentUser, setCurrentUser]         = useState({
    name: 'Ajay M.',
    email: 'analyst@example.com',
    role: 'Security analyst'
  });

  // Settings
  const [theme, setTheme]                     = useState(localStorage.getItem('CYBER_THEME') || 'dark');
  const [apiKey, setApiKey]                   = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [selectedModel, setSelectedModel]     = useState(localStorage.getItem('GEMINI_MODEL') || 'gemini-2.5-flash');

  // Loading States
  const [isAnalyzing, setIsAnalyzing]         = useState(false);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [externalCopilotQuery, setExternalCopilotQuery] = useState('');
  const [copilotMessages, setCopilotMessages] = useState([{
    role: 'assistant',
    content: '👋 Hello Ajay! I\'m your ThreatLens AI Copilot. I analyze suspicious indicators, correlate MITRE ATT&CK techniques, provide step-by-step containment instructions, and generate defensive firewall rules.\n\nHow can I help your investigation today?'
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
        content: `✅ Telemetry synthesized for: **"${d.title}"**\n\nAttribution: ${d.threat_actor?.name || 'Unknown'} | CVEs: ${d.cves?.length || 0} | MITRE Techniques: ${d.mitre_techniques?.length || 0} | IOCs: ${d.iocs?.length || 0}\n\nReady for analyst investigation.`
      }]);
    } catch (e) {
      console.error('Backend analysis error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load sample reports and MITRE tactics from backend on init
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
        console.error('FastAPI Backend connection status:', err);
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
        content: `✅ Ingested PDF "${file.name}" (${d.extracted_char_count?.toLocaleString()} chars)\n\nThreat Actor: ${d.threat_actor?.name || 'Unknown'} | CVEs: ${d.cves?.length || 0} | Techniques: ${d.mitre_techniques?.length || 0}`
      }]);
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
        body: JSON.stringify({ query: q, context_threat: threatData || {}, chat_history: msgs.slice(-6), api_key: apiKey || null, model: selectedModel })
      });
      const d = await r.json();
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: d.reply || 'No response.' }]);
    } catch {
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: '❌ Could not reach backend.' }]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const handleGlobalSearch = (query) => {
    setSelectedIndicator({ indicator: query });
    setActiveTab('analyzer');
  };

  const handleNavigateTab = (tabId, params = null) => {
    if (tabId === 'reports') {
      setIsReportOpen(true);
      return;
    }
    if (tabId === 'settings') {
      setIsSettingsOpen(true);
      return;
    }
    if (params) {
      setSelectedIndicator(params);
    }
    setActiveTab(tabId);
  };

  // If Auth screen is active, show the Login View (matching Image 4)
  if (isAuthOpen) {
    return (
      <LoginView
        onSignIn={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
        }}
        onCancel={() => setIsAuthOpen(false)}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-base)',
      backgroundImage: `
        radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to right, rgba(255, 255, 255, 0.01) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.01) 1px, transparent 1px)
      `,
      backgroundSize: '28px 28px, 56px 56px, 56px 56px'
    }}>
      {/* ─── Top Header Bar ─── */}
      <Header
        activeTab={activeTab}
        theme={theme}
        onToggleTheme={() => setTheme(p => p === 'dark' ? 'light' : 'dark')}
        onSearchGlobal={handleGlobalSearch}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ─── Sidebar Navigation (ThreatLens Brand & Exact Workspace Items) ─── */}
        <aside style={{
          width: '240px',
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '20px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto'
        }}>
          {/* Brand Logo & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 6px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '9px',
              background: 'linear-gradient(135deg, #0284c7 0%, #00e5ff 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(0, 229, 255, 0.35)',
              flexShrink: 0
            }}>
              <Shield size={18} color="#06090f" strokeWidth={2.6} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                ThreatLens
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', letterSpacing: '0.02em', marginTop: '2px' }}>
                AI Threat Intelligence
              </span>
            </div>
          </div>

          {/* WORKSPACE Menu Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="section-label" style={{ marginBottom: '6px', fontSize: '10px' }}>
              WORKSPACE
            </div>

            {[
              { id: 'dashboard',      label: 'Dashboard',             icon: LayoutDashboard },
              { id: 'analyzer',       label: 'Threat Analyzer',       icon: Search },
              { id: 'intelligence',   label: 'Threat Intelligence',   icon: Globe },
              { id: 'attack-mapping', label: 'Attack Mapping',        icon: Crosshair },
              { id: 'history',        label: 'Investigation History', icon: Clock },
              { id: 'reports',        label: 'Reports',               icon: FileText },
              { id: 'settings',       label: 'Settings',              icon: Sliders },
            ].map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: active ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: active ? '600' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    outline: active ? '1px solid rgba(56, 189, 248, 0.3)' : 'none',
                    transition: 'all 0.12s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'var(--bg-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon size={16} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* SECONDARY OPERATIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            <div className="section-label" style={{ marginBottom: '6px', fontSize: '10px' }}>
              ANALYST TOOLS
            </div>

            {[
              { id: 'copilot', label: 'AI Security Copilot', icon: MessageSquare },
              { id: 'defense', label: 'Defense Engineering', icon: ShieldCheck }
            ].map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: active ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: active ? '600' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    outline: active ? '1px solid rgba(56, 189, 248, 0.3)' : 'none',
                    transition: 'all 0.12s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'var(--bg-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon size={16} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* BOTTOM CARDS: Model Engine & User Profile */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Model Engine Status Card */}
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Model engine
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
                Risk scoring runs on your FastAPI backend.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#10b981' }}>Connected</span>
              </div>
            </div>

            {/* User Profile Card */}
            <div
              onClick={() => setIsAuthOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'background 0.12s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title="Click to manage analyst session"
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                AM
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.name}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── Main Content Canvas ─── */}
        <main style={{
          flex: 1,
          padding: '24px 32px',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 56px)'
        }}>
          {isAnalyzing ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: '60vh', gap: '20px', textAlign: 'center'
            }}>
              <Loader size={36} color="var(--accent)" className="spin" />
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                Synthesizing Threat Intelligence
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '420px', margin: 0 }}>
                FastAPI engine and Gemini AI are formulating adversary attribution, extracting indicators, and generating detection artifacts.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  onNavigateTab={handleNavigateTab}
                  onOpenNewAnalysis={() => setIsIngestOpen(true)}
                  onOpenReport={() => setIsReportOpen(true)}
                  onSelectIndicator={(t) => setSelectedIndicator({ indicator: t.indicator, type: t.type })}
                />
              )}

              {activeTab === 'analyzer' && (
                <ThreatAnalyzerView
                  initialIndicator={selectedIndicator}
                  onAnalyzeReport={analyzeThreatReport}
                  isAnalyzingBackend={isAnalyzing}
                />
              )}

              {activeTab === 'intelligence' && (
                <ThreatIntelligenceView
                  threatData={threatData}
                  onNavigateTab={handleNavigateTab}
                  onOpenReport={() => setIsReportOpen(true)}
                />
              )}

              {activeTab === 'attack-mapping' && (
                <AttackMappingView
                  threatData={threatData}
                  onNavigateTab={handleNavigateTab}
                />
              )}

              {activeTab === 'history' && (
                <InvestigationHistoryView
                  sampleReports={sampleReports}
                  activeReportId={activeReportId}
                  onSelectReport={(repId) => {
                    const rep = sampleReports.find(x => x.id === repId);
                    if (rep) analyzeThreatReport(rep.content, rep.title, rep.id);
                  }}
                  onOpenIngest={() => setIsIngestOpen(true)}
                  onOpenReport={() => setIsReportOpen(true)}
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

              {activeTab === 'defense' && (
                <DefenseCenter
                  defenseArtifacts={threatData?.defense_artifacts}
                  threatData={threatData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* ─── Integrated Modals ─── */}
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
