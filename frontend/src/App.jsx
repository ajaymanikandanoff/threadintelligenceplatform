import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OverviewTab from './components/OverviewTab';
import KnowledgeGraph from './components/KnowledgeGraph';
import MitreMatrix from './components/MitreMatrix';
import DefenseCenter from './components/DefenseCenter';
import ThreatCopilot from './components/ThreatCopilot';
import IngestModal from './components/IngestModal';
import SettingsModal from './components/SettingsModal';
import { 
  Activity, 
  GitCommit, 
  Target, 
  ShieldCheck, 
  Terminal, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

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
    {
      role: 'assistant',
      content: '👋 Welcome to the Cyber Threat Intelligence (CTI) Knowledge Platform. I am your AI Threat Hunter Copilot powered by Google Gemini. Ask me anything about the active threat campaign, attack kill chain, or request customized Sigma & YARA rules!'
    }
  ]);

  // Load initial sample reports & MITRE tactics on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [repRes, mitreRes] = await Promise.all([
          fetch('http://localhost:8000/api/sample-reports'),
          fetch('http://localhost:8000/api/mitre-matrix')
        ]);
        const repData = await repRes.json();
        const mitreData = await mitreRes.json();

        setSampleReports(repData.reports || []);
        setTactics(mitreData.tactics || []);

        // Automatically run initial analysis on the first sample report
        if (repData.reports && repData.reports.length > 0) {
          analyzeThreatReport(repData.reports[0].content, repData.reports[0].title);
        }
      } catch (err) {
        console.error("Initial fetch error:", err);
      }
    };
    fetchInitialData();
  }, []);

  const analyzeThreatReport = async (text, title) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          title,
          api_key: apiKey || null,
          model: selectedModel
        })
      });
      const data = await res.json();
      setThreatData(data);
      setIsIngestOpen(false);

      // Add notification in Copilot
      setCopilotMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `🔄 **New Threat Context Ingested:** Analyzed "${data.title}". Identified Threat Actor **${data.threat_actor?.name}** with ${data.cves?.length || 0} CVEs and ${data.mitre_techniques?.length || 0} MITRE ATT&CK techniques mapped.`
        }
      ]);
    } catch (err) {
      console.error("Analysis error:", err);
      alert("Failed to analyze threat report. Please verify backend is running on port 8000.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadFile = async (file) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (apiKey) formData.append('api_key', apiKey);
      if (selectedModel) formData.append('model', selectedModel);

      const res = await fetch('http://localhost:8000/api/upload-pdf', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      const data = await res.json();
      setThreatData(data);
      setIsIngestOpen(false);

      setCopilotMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `📄 **Processed Document "${file.name}":** Successfully extracted ${data.extracted_char_count || 'all'} characters. Identified Threat Actor **${data.threat_actor?.name}** with ${data.cves?.length || 0} CVEs and ${data.mitre_techniques?.length || 0} MITRE ATT&CK techniques mapped into the live Knowledge Graph.`
        }
      ]);
    } catch (err) {
      console.error("File upload error:", err);
      alert(`Error extracting PDF: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (userQuery) => {
    const updatedMessages = [...copilotMessages, { role: 'user', content: userQuery }];
    setCopilotMessages(updatedMessages);
    setIsCopilotLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery,
          context_threat: threatData || {},
          chat_history: updatedMessages.slice(-6),
          api_key: apiKey || null,
          model: selectedModel
        })
      });
      const data = await res.json();
      setCopilotMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply || "No response received." }
      ]);
    } catch (err) {
      setCopilotMessages(prev => [
        ...prev,
        { role: 'assistant', content: "⚠️ Could not reach AI Copilot backend server. Please verify port 8000." }
      ]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const handleAskCopilotFromNodeOrTech = (promptText) => {
    setActiveTab('copilot');
    setExternalCopilotQuery(promptText);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Header
        provider={threatData?.provider}
        activeThreatTitle={threatData?.title}
        hasCustomKey={Boolean(apiKey && apiKey.trim())}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenIngest={() => setIsIngestOpen(true)}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1600px', margin: '0 auto', width: '100%', padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '12px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'overview', label: 'Threat Overview', icon: Activity },
            { id: 'graph', label: 'Knowledge Graph', icon: GitCommit },
            { id: 'mitre', label: 'MITRE ATT&CK Matrix', icon: Target },
            { id: 'defense', label: 'Defense & Rules (Sigma/YARA)', icon: ShieldCheck },
            { id: 'copilot', label: 'AI Threat Copilot', icon: Terminal }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(0, 153, 255, 0.15))' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '0.86rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 16px rgba(0, 240, 255, 0.2)' : 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className="cyber-card" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <RefreshCw size={28} color="var(--accent-cyan)" className="pulse-dot" />
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
              Autonomous Threat Extraction in Progress...
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '500px' }}>
              Gemini AI is parsing IoCs, CVEs, mapping TTPs to MITRE ATT&CK, synthesizing the Knowledge Graph, and compiling Sigma detection rules.
            </p>
          </div>
        )}

        {/* Tab Views */}
        {!isAnalyzing && (
          <div>
            {activeTab === 'overview' && (
              <OverviewTab 
                threatData={threatData} 
                onSwitchTab={setActiveTab} 
              />
            )}

            {activeTab === 'graph' && (
              <KnowledgeGraph 
                graphData={threatData?.graph_data} 
                onAskCopilot={handleAskCopilotFromNodeOrTech} 
              />
            )}

            {activeTab === 'mitre' && (
              <MitreMatrix 
                tactics={tactics} 
                activeTechniques={threatData?.mitre_techniques || []} 
                onAskCopilot={handleAskCopilotFromNodeOrTech}
              />
            )}

            {activeTab === 'defense' && (
              <DefenseCenter 
                defenseArtifacts={threatData?.defense_artifacts} 
                threatActor={threatData?.threat_actor?.name}
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
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '16px 24px',
        background: 'rgba(5, 8, 17, 0.9)',
        fontSize: '0.76rem',
        color: 'var(--text-dim)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>CYBERINTEL // AI PLATFORM</span>
          <span>•</span>
          <span>STIX 2.1 & MITRE ATT&CK® v14 COMPLIANT</span>
          <span>•</span>
          <span>BUILT FOR SOC & THREAT INTEL RESEARCH</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)' }}>
          SYSTEM LATENCY: 24ms // STATUS: OPERATIONAL
        </div>
      </footer>

      {/* Modals */}
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
    </div>
  );
}
