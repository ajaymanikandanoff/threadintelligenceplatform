import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './views/DashboardView';
import ThreatAnalyzerView from './views/ThreatAnalyzerView';
import ThreatIntelligenceView from './views/ThreatIntelligenceView';
import AttackMappingView from './views/AttackMappingView';
import InvestigationHistoryView from './views/InvestigationHistoryView';
import SettingsView from './views/SettingsView';
import LoginView from './views/LoginView';

// Dedicated IntelOwl & TTPMapper Modules
import IpIntelligenceView from './views/IpIntelligenceView';
import DomainIntelligenceView from './views/DomainIntelligenceView';
import UrlAnalysisView from './views/UrlAnalysisView';
import PdfResearchView from './views/PdfResearchView';
import ThreatGraphView from './views/ThreatGraphView';
import ThreatMapView from './views/ThreatMapView';

import DefenseCenter from './components/DefenseCenter';
import ThreatCopilot from './components/ThreatCopilot';
import IngestModal from './components/IngestModal';
import ExecutiveReportModal from './components/ExecutiveReportModal';
import CyberGlossaryModal from './components/CyberGlossaryModal';

import {
  Shield,
  LayoutDashboard,
  Search,
  Globe,
  Crosshair,
  Clock,
  Sliders,
  MessageSquare,
  ShieldCheck,
  Loader,
  Activity,
  Link2,
  FileSearch,
  Share2,
  Radio,
  LogOut
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [threatData, setThreatData] = useState(null);
  const [sampleReports, setSampleReports] = useState([]);
  const [_activeReportId, setActiveReportId] = useState(null);
  const [_tactics, setTactics] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  // Modals & Auth
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user_session') || sessionStorage.getItem('user_session');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.email || u.name)) return u;
      }
    } catch { }
    return null;
  });

  // Themes & Cybersecurity Colors
  const [theme, setTheme] = useState(localStorage.getItem('CYBER_THEME') || 'dark');
  const [cyberAccent, setCyberAccent] = useState(localStorage.getItem('CYBER_ACCENT') || 'cyan');
  const [apiKey, setApiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('GEMINI_MODEL') || 'gemini-3.5-flash');

  // Loading States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [externalCopilotQuery, setExternalCopilotQuery] = useState('');
  const [copilotMessages, setCopilotMessages] = useState([{
    role: 'assistant',
    content: '👋 Hello Ajay! I\'m your AI ThreatLens Copilot. I analyze suspicious indicators, correlate MITRE ATT&CK techniques, provide step-by-step containment instructions, and generate defensive firewall rules.\n\nHow can I help your investigation today?'
  }]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('CYBER_THEME', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-cyber-accent', cyberAccent);
    localStorage.setItem('CYBER_ACCENT', cyberAccent);
  }, [cyberAccent]);

  const analyzeThreatReport = async (text, title, reportId = null) => {
    setIsAnalyzing(true);
    if (reportId) setActiveReportId(reportId);
    try {
      const r = await fetch(`${API_BASE}/api/analyze`, {
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
        const [rr, mr, hr] = await Promise.all([
          fetch(`${API_BASE}/api/sample-reports`),
          fetch(`${API_BASE}/api/mitre-matrix`),
          fetch(`${API_BASE}/api/health`)
        ]);
        const rd = await rr.json(), md = await mr.json(), hd = await hr.json();
        setSampleReports(rd.reports || []);
        setTactics(md.tactics || []);
        if (hd.api_key) {
          setApiKey(hd.api_key);
          localStorage.setItem('GEMINI_API_KEY', hd.api_key);
        }
        if (hd.default_model) {
          setSelectedModel(hd.default_model);
          localStorage.setItem('GEMINI_MODEL', hd.default_model);
        }
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
      const r = await fetch(`${API_BASE}/api/upload-pdf`, { method: 'POST', body: fd });
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
      const r = await fetch(`${API_BASE}/api/copilot`, {
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
    if (params) {
      setSelectedIndicator(params);
    }
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('user_session');
    sessionStorage.removeItem('user_session');
    setCurrentUser(null);
  };

  // Mandatory Authentication Gate: First step is login or account creation
  if (!currentUser) {
    return (
      <LoginView
        onSignIn={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-base)'
    }}>
      {/* ─── Top Header Bar ─── */}
      <Header
        activeTab={activeTab}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={() => setTheme(p => p === 'dark' ? 'light' : 'dark')}
        onSearchGlobal={handleGlobalSearch}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(p => !p)}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Mobile Backdrop Overlay */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-drawer-backdrop"
          />
        )}

        {/* ─── Sidebar Navigation (Clean Workspace Items) ─── */}
        <aside className={`app-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          {/* WORKSPACE Menu Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div className="section-label" style={{ marginBottom: '4px', fontSize: '10px' }}>
              WORKSPACE
            </div>

            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'analyzer', label: 'Unified Analyzer', icon: Search },
              { id: 'history', label: 'Investigation History', icon: Clock },
            ].map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateTab(item.id)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: active ? '600' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    outline: active ? '1px solid var(--border-accent)' : 'none',
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
                  {active && (
                    <span style={{
                      position: 'absolute',
                      left: '-14px',
                      width: '3.5px',
                      height: '24px',
                      borderRadius: '0 4px 4px 0',
                      background: 'var(--accent)'
                    }} />
                  )}
                  <Icon size={16} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* INTELOWL & TTPMAPPER MODULES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            <div className="section-label" style={{ marginBottom: '4px', fontSize: '10px' }}>
              INTELLIGENCE SCANNERS
            </div>

            {[
              { id: 'ip-scanner', label: 'IP Intelligence', icon: Activity },
              { id: 'domain-scanner', label: 'Domain Intelligence', icon: Globe },
              { id: 'url-scanner', label: 'URL Threat Analysis', icon: Link2 },
              { id: 'pdf-research', label: 'PDF Threat Research', icon: FileSearch },
              { id: 'threat-graph', label: 'Threat Graph', icon: Share2 },
            ].map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateTab(item.id)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: active ? '600' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    outline: active ? '1px solid var(--border-accent)' : 'none',
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
                  {active && (
                    <span style={{
                      position: 'absolute',
                      left: '-14px',
                      width: '3.5px',
                      height: '24px',
                      borderRadius: '0 4px 4px 0',
                      background: 'var(--accent)'
                    }} />
                  )}
                  <Icon size={16} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* ADVANCED ATT&CK & THREAT INTEL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            <div className="section-label" style={{ marginBottom: '4px', fontSize: '10px' }}>
              ADVANCED RESEARCH
            </div>

            {[
              { id: 'threat-map', label: 'Global Threat Map', icon: Radio },
              { id: 'intelligence', label: 'Threat Intelligence', icon: Globe },
              { id: 'attack-mapping', label: 'ATT&CK Matrix', icon: Crosshair },
            ].map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateTab(item.id)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: active ? '600' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    outline: active ? '1px solid var(--border-accent)' : 'none',
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
                  {active && (
                    <span style={{
                      position: 'absolute',
                      left: '-14px',
                      width: '3.5px',
                      height: '24px',
                      borderRadius: '0 4px 4px 0',
                      background: 'var(--accent)'
                    }} />
                  )}
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
              { id: 'copilot', label: 'AI Security Copilot', icon: MessageSquare }
            ].map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateTab(item.id)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: active ? '600' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    outline: active ? '1px solid var(--border-accent)' : 'none',
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
                  {active && (
                    <span style={{
                      position: 'absolute',
                      left: '-14px',
                      width: '3.5px',
                      height: '24px',
                      borderRadius: '0 4px 4px 0',
                      background: 'var(--accent)'
                    }} />
                  )}
                  <Icon size={16} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* BOTTOM: User Profile Card */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* User Profile Card */}
            <div
              onClick={() => handleNavigateTab('settings')}
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
              title="Click to view Settings & Profile"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid var(--accent)',
                    flexShrink: 0
                  }}
                />
              ) : (
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AM'}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.name}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {currentUser.role}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSignOut();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  padding: '5px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                title="Sign out of ThreatLens"
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#f43f5e';
                  e.currentTarget.style.background = 'rgba(244, 63, 94, 0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>

        {/* ─── Main Content Canvas ─── */}
        <main className="app-main-canvas">
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

              {/* Module 1: IP Intelligence Scanner */}
              {activeTab === 'ip-scanner' && (
                <IpIntelligenceView
                  onNavigateTab={handleNavigateTab}
                />
              )}

              {/* Module 2: Domain Intelligence Scanner */}
              {activeTab === 'domain-scanner' && (
                <DomainIntelligenceView
                  onNavigateTab={handleNavigateTab}
                />
              )}

              {/* Module 3: URL Threat Analysis */}
              {activeTab === 'url-scanner' && (
                <UrlAnalysisView
                  onNavigateTab={handleNavigateTab}
                />
              )}

              {/* Module 4: PDF Threat Intelligence Research */}
              {activeTab === 'pdf-research' && (
                <PdfResearchView
                  onNavigateTab={handleNavigateTab}
                />
              )}

              {/* Module 5: Threat Intelligence Graph */}
              {activeTab === 'threat-graph' && (
                <ThreatGraphView
                  onNavigateTab={handleNavigateTab}
                />
              )}

              {activeTab === 'threat-map' && (
                <ThreatMapView
                  onNavigateTab={handleNavigateTab}
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
                  onNavigateTab={handleNavigateTab}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  currentUser={currentUser}
                  onUpdateUser={setCurrentUser}
                  onSignOut={handleSignOut}
                  cyberAccent={cyberAccent}
                  onChangeCyberAccent={setCyberAccent}
                  theme={theme}
                  onToggleTheme={() => setTheme(p => p === 'dark' ? 'light' : 'dark')}
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
                  apiKey={apiKey}
                  onNavigateTab={handleNavigateTab}
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
