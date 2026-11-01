import React, { useState } from 'react';
import { X, BookOpen, Search, ChevronRight } from 'lucide-react';

const FEATURES = [
  {
    title: 'Threat Overview Dashboard',
    emoji: '📊',
    role: 'Central operational command center for active cyber threats.',
    whatItDoes: 'Calculates composite risk scores (0-100%), displays attacker attribution dossiers, identifies targeted industry sectors, lists active CVE exploits, and tracks the Blue Team containment checklist.',
    action: 'Review threat risk level, listen to the automated executive briefing audio, and click items in the response checklist as your team completes each containment action.',
    category: 'Platform Navigation',
  },
  {
    title: 'Defense Center & Rule Generator',
    emoji: '🛡️',
    role: 'Automated perimeter defense script and SIEM detection engine.',
    whatItDoes: 'Instantly generates copy-paste firewall block commands for Windows Defender (PowerShell), Linux (iptables), Cisco ASA/IOS, and Hosts DNS sinkholes, alongside Sigma YAML detection rules and YARA scanners.',
    action: 'Select your firewall platform tab, click "Copy" or "Download", and deploy directly into boundary firewalls or Splunk/Elastic SIEM to block malicious command-and-control traffic.',
    category: 'Automated Defense',
  },
  {
    title: 'Threat Indicators (IoCs Explorer)',
    emoji: '🎯',
    role: 'Malicious indicator database with automated safe defanging.',
    whatItDoes: 'Catalogs all malicious IPv4 addresses, attacker proxy nodes, C2 domains, and SHA256/MD5 malware hashes with one-click defanging ([.]) to prevent accidental clicks.',
    action: 'Filter indicators by IP, Domain, or Hash, export as CSV or STIX 2.1, and click the external OSINT link to check reputation live on VirusTotal or AbuseIPDB.',
    category: 'Threat Forensics',
  },
  {
    title: 'AI Threat Hunter Copilot',
    emoji: '🤖',
    role: 'Interactive SOC conversational intelligence assistant.',
    whatItDoes: 'Answers technical and managerial security queries grounded specifically in the currently analyzed threat report using Google Gemini 2.5 Flash.',
    action: 'Ask practical questions like "What software must our team patch in the next hour?" or "Write me a custom containment procedure" to receive step-by-step guidance.',
    category: 'Platform Navigation',
  },
  {
    title: 'MITRE ATT&CK Matrix Heatmap',
    emoji: '🗺️',
    role: '14-tactic Enterprise adversary behavior heatmap.',
    whatItDoes: 'Maps unstructured threat narrative text against the global MITRE ATT&CK framework, illuminating all active attacker techniques in glowing red columns.',
    action: 'Click any illuminated technique (e.g., T1190 or T1059.001) to read the exact extracted report evidence and see recommended detection mitigations.',
    category: 'Threat Forensics',
  },
  {
    title: 'Interactive Knowledge Graph',
    emoji: '🕸️',
    role: 'Graph ontology and adversary relationship visualizer.',
    whatItDoes: 'Constructs an interactive SVG network linking the Threat Actor to deployed Malware payloads, exploited CVEs, MITRE attack techniques, target sectors, and C2 servers.',
    action: 'Drag nodes to reposition them, zoom in and out, and click any node to view entity attributes in the inspector drawer or pass it directly into AI Copilot for analysis.',
    category: 'Threat Forensics',
  },
  {
    title: 'Cyber Kill Chain Intrusion Timeline',
    emoji: '⚡',
    role: '5-phase attacker intrusion progression timeline.',
    whatItDoes: 'Visualizes the sequential attack lifecycle across Perimeter Breach, Malware Execution, Backdoor Implant, C2 Beaconing, and Data Theft & Extortion.',
    action: 'Select intrusion stages to inspect adversary attack objectives, correlate extracted forensic telemetry, and implement direct defense containment controls.',
    category: 'Threat Forensics',
  },
  {
    title: 'Vulnerability (CVE) Tracker',
    emoji: '🔓',
    role: 'Exploited software flaw inventory and CVSS rating.',
    whatItDoes: 'Extracts all CVE vulnerabilities referenced in the advisory, determines CVSS severity scores, and identifies the vulnerable gateway or software product.',
    action: 'Click the external link icon to view official NIST NVD advisories and immediately deploy emergency security patches to affected perimeter appliances.',
    category: 'Automated Defense',
  },
  {
    title: 'Sigma Rules for SIEM',
    emoji: '📡',
    role: 'Universal log detection logic formatted in standard YAML.',
    whatItDoes: 'Provides detection rules compatible with Splunk, Microsoft Sentinel, and Elastic SIEM that trigger alerts when adversary commands or C2 connections occur.',
    action: 'Copy the generated Sigma rule from the Defense Center tab and import it directly into your SOC SIEM rule repository.',
    category: 'Automated Defense',
  },
  {
    title: 'YARA File & Memory Scanners',
    emoji: '🔬',
    role: 'Malware and webshell artifact detection scanner.',
    whatItDoes: 'Generates binary string and hex condition rules to detect malicious webshell files (e.g., LEMURLOOT) and ransomware payloads on endpoints and servers.',
    action: 'Download the .yar rule file and run it across DMZ web application servers to check for unauthorized backdoor implants.',
    category: 'Automated Defense',
  },
  {
    title: 'Advisory Ingestion (PDF / Text)',
    emoji: '📥',
    role: 'Document ingestion portal and automated intelligence extractor.',
    whatItDoes: 'Extracts threat data from government PDFs (CISA, NSA, FBI) or custom incident writeups and generates a full threat intelligence model in seconds.',
    action: 'Click "Analyze Advisory" in the top header, pick an advisory from the live feeds, upload your own PDF, or paste raw server incident logs.',
    category: 'Data Ingestion',
  },
  {
    title: 'Executive CTI Briefing Export',
    emoji: '📄',
    role: 'C-suite and Board of Directors threat briefing generator.',
    whatItDoes: 'Synthesizes high-level executive summaries, attacker motivations, business impact statements, and defense readiness into clean printable reports and STIX 2.1 JSON.',
    action: 'Click "Export CTI Dossier" in the header to preview the briefing, click "Print / PDF" for executive distribution, or download the standard STIX 2.1 JSON bundle.',
    category: 'Data Ingestion',
  },
];

const CATEGORIES = ['All', 'Platform Navigation', 'Automated Defense', 'Threat Forensics', 'Data Ingestion'];

export default function CyberGlossaryModal({ isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [expanded, setExpanded] = useState(0);

  if (!isOpen) return null;

  const filtered = FEATURES.filter(f => {
    const matchCat = activeCat === 'All' || f.category === activeCat;
    const matchSearch = !search ||
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.role.toLowerCase().includes(search.toLowerCase()) ||
      f.whatItDoes.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '740px' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '20px 26px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-elevated)',
          zIndex: 10
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <BookOpen size={16} color="var(--accent)" />
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                Platform Capabilities & Feature Guide
              </h2>
              <span style={{
                fontSize: '9.5px', padding: '1.5px 7px', borderRadius: '4px',
                background: 'var(--accent-dim)', color: 'var(--accent)',
                border: '1px solid var(--border-accent)', fontWeight: '800', fontFamily: 'var(--font-mono)'
              }}>
                OPERATIONAL DIRECTORY
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', margin: 0 }}>
              Practical operational breakdown of each intelligence module — purpose, capabilities, and direct analyst workflows.
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', border: 'none', background: 'transparent' }}>
            <X size={18} />
          </button>
        </div>

        {/* Search + Category Filter */}
        <div style={{ padding: '14px 26px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-overlay)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              className="input"
              style={{ paddingLeft: '34px', fontSize: '12.5px' }}
              placeholder="Search platform capabilities (e.g. Firewall, Copilot, MITRE, CVE, Ingestion)…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                style={{
                  padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  background: activeCat === c ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: activeCat === c ? '#06090f' : 'var(--text-secondary)',
                  border: `1px solid ${activeCat === c ? 'transparent' : 'var(--border)'}`,
                  transition: 'all 0.12s'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards List */}
        <div style={{ padding: '16px 26px 26px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '55vh', overflowY: 'auto' }}>
          {filtered.map((f, i) => {
            const isOpen = expanded === i;
            return (
              <div
                key={i}
                style={{
                  borderRadius: '10px',
                  border: `1px solid ${isOpen ? 'var(--border-accent)' : 'var(--border)'}`,
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                  background: isOpen ? 'rgba(56,189,248,0.04)' : 'var(--bg-elevated)'
                }}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '13px 16px', background: 'transparent', border: 'none',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)'
                  }}
                >
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{f.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: isOpen ? 'var(--accent)' : 'var(--text-primary)', marginBottom: '2px' }}>
                      {f.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isOpen ? 'normal' : 'nowrap' }}>
                      {f.role}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px',
                    background: 'var(--bg-overlay)', color: 'var(--text-tertiary)', flexShrink: 0, marginRight: '6px',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {f.category.toUpperCase()}
                  </span>
                  <ChevronRight size={14} color="var(--text-tertiary)" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                </button>

                {isOpen && (
                  <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ padding: '12px 14px', background: 'var(--bg-overlay)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: '5px' }}>
                        ⚙️ Operational Functionality
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                        {f.whatItDoes}
                      </p>
                    </div>

                    <div style={{ padding: '12px 14px', background: 'var(--green-dim)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.25)' }}>
                      <div style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--green)', marginBottom: '5px' }}>
                        ⚡ Analyst Workflow & Action
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', margin: 0, lineHeight: '1.6' }}>
                        {f.action}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              No platform features match your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
