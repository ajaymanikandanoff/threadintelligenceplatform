import React, { useState } from 'react';
import { X, BookOpen, Search, Sparkles, Shield, AlertTriangle, Key, Terminal } from 'lucide-react';

const GLOSSARY_ITEMS = [
  {
    term: "CVE (Common Vulnerabilities & Exposures)",
    analogy: "A Broken Lock Factory Defect",
    definition: "A globally recognized ID for a specific software security loophole or bug that hackers can exploit.",
    example: "CVE-2023-34362 (SQL injection in MOVEit software)",
    category: "Vulnerability"
  },
  {
    term: "CVSS Score (0 to 10.0)",
    analogy: "The Fire Danger Meter",
    definition: "A standardized score measuring how dangerous and easy an attack is. 9.0 - 10.0 is Critical Emergency; 7.0 - 8.9 is High Danger.",
    example: "CVSS 9.8 Critical means remote hackers can take over without needing a password.",
    category: "Metrics"
  },
  {
    term: "IoC (Indicator of Compromise)",
    analogy: "Hacker's Digital Fingerprints & Vehicle Plates",
    definition: "Evidence left behind by hackers — such as malicious IP addresses, infected file hashes, or phishing domains.",
    example: "IP 138.197.152.201 used by hackers to control the malware.",
    category: "Forensics"
  },
  {
    term: "Zero-Day Vulnerability",
    analogy: "The Undiscovered Trapdoor",
    definition: "A flaw unknown to the software creator. The developers have had 'zero days' to create a patch.",
    example: "Hackers using a secret bug before Microsoft or Progress Software can release an update.",
    category: "Vulnerability"
  },
  {
    term: "C2 (Command & Control Server)",
    analogy: "The Hacker's Remote Control Base",
    definition: "A computer operated by attackers to issue orders to infected computers and receive stolen files.",
    example: "Webshell transmitting database tables back to the attacker's server.",
    category: "Attack Flow"
  },
  {
    term: "Webshell",
    analogy: "A Hidden Key Left Inside the Building",
    definition: "A malicious script (like .aspx or .php) uploaded to a web server that gives attackers remote command line control.",
    example: "LEMURLOOT (human2.aspx) disguised as a valid file inside MOVEit root directory.",
    category: "Malware"
  },
  {
    term: "Ransomware & Double Extortion",
    analogy: "Kidnapping Files & Threatening Leak",
    definition: "Malware that encrypts company databases AND threatens to publish secret data online unless ransom is paid.",
    example: "CL0P and ALPHV ransomware gangs extorting hospitals and universities.",
    category: "Threat Type"
  },
  {
    term: "Sigma Rule",
    analogy: "Universal Smoke Detector Alarm",
    definition: "An open standard detection rule that works across Splunk, Microsoft Sentinel, and Elastic SIEM.",
    example: "Alerts the security team the millisecond someone runs suspicious PowerShell commands.",
    category: "Defense"
  },
  {
    term: "YARA Rule",
    analogy: "Metal Detector for Malicious Code",
    definition: "A pattern-matching tool used by antivirus and security analysts to scan files and detect malware families.",
    example: "Scanning server drives to detect disguised webshell scripts.",
    category: "Defense"
  },
  {
    term: "MFA (Multi-Factor Authentication)",
    analogy: "Two Different Keys to Open the Safe",
    definition: "Requiring a password PLUS a one-time code on your phone. Stops 99% of stolen password attacks.",
    example: "Even if hackers buy your password on the dark web, they cannot login without your phone OTP.",
    category: "Defense"
  }
];

export default function CyberGlossaryModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = GLOSSARY_ITEMS.filter(item =>
    item.term.toLowerCase().includes(query.toLowerCase()) ||
    item.analogy.toLowerCase().includes(query.toLowerCase()) ||
    item.definition.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(6,9,15,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="surface"
        style={{
          maxWidth: '680px', width: '100%', padding: '24px',
          maxHeight: '88vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          border: '1px solid var(--border)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <BookOpen size={18} color="var(--cyan)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-0)', margin: 0 }}>
                Cyber Jargon Buster (எளிய விளக்கம்)
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', margin: 0 }}>
              Confusing cybersecurity acronyms translated into simple, real-world analogies.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search any term (e.g., CVE, IoC, Zero-Day, Sigma, Ransomware)..."
            style={{
              width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: '7px', padding: '9px 14px 9px 36px', color: 'var(--text-0)',
              fontSize: '0.82rem', fontFamily: 'var(--font-sans)', outline: 'none'
            }}
          />
        </div>

        {/* Cards list */}
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
          {filtered.map((item, i) => (
            <div
              key={i}
              style={{
                padding: '12px 16px', background: 'var(--bg-2)', borderRadius: '8px',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--cyan)' }}>
                  {item.term}
                </span>
                <span className="tag tag-amber" style={{ fontSize: '0.66rem' }}>
                  💡 {item.analogy}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-1)', lineHeight: '1.45', marginBottom: '4px' }}>
                {item.definition}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                e.g. {item.example}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>
            Cybersecurity made understandable for everyone 🛡️
          </span>
        </div>
      </div>
    </div>
  );
}
