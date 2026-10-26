import React, { useState } from 'react';
import { X, BookOpen, Search, ChevronRight } from 'lucide-react';

const GLOSSARY = [
  {
    term: 'CVE',
    emoji: '🔓',
    plain: 'A catalogued software bug that hackers can exploit.',
    analogy: 'Like a known crack in a wall that thieves know about and can use to break in.',
    example: 'CVE-2023-34362 is the MOVEit file-transfer vulnerability used by CL0P ransomware.',
    category: 'Vulnerability',
  },
  {
    term: 'IoC (Indicator of Compromise)',
    emoji: '🚩',
    plain: 'Digital fingerprints left behind by a hacker — like a suspect\'s footprints at a crime scene.',
    analogy: 'If a burglar leaves a specific shoe print, police look for that pattern in other crimes. IoCs are those patterns.',
    example: 'A malicious IP like 192.168.1.200 connecting to your server at 3 AM is an IoC.',
    category: 'Detection',
  },
  {
    term: 'Zero-Day',
    emoji: '⚡',
    plain: 'A vulnerability that the software company doesn\'t know about yet — so there\'s no fix (zero days to patch it).',
    analogy: 'Like a secret passage in a bank vault that only the thief knows about — even the bank hasn\'t discovered it.',
    example: 'When a hacker discovers a new iPhone bug before Apple knows, it\'s a zero-day.',
    category: 'Vulnerability',
  },
  {
    term: 'Ransomware',
    emoji: '💰',
    plain: 'Malicious software that locks your files and demands payment to unlock them.',
    analogy: 'Imagine someone breaking into your home, changing all the locks, and demanding $10,000 for a new key.',
    example: 'WannaCry ransomware hit hospitals in 2017, encrypting patient records and demanding Bitcoin.',
    category: 'Malware',
  },
  {
    term: 'MITRE ATT&CK',
    emoji: '🗺️',
    plain: 'A publicly shared playbook that documents every attack technique real hackers use.',
    analogy: 'Like a football team\'s playbook — except it documents the opponent\'s plays so defenders can prepare.',
    example: '"T1059 — Command Scripting" means the hacker is using PowerShell or Bash scripts to run commands.',
    category: 'Framework',
  },
  {
    term: 'Threat Actor',
    emoji: '🕵️',
    plain: 'The hacker or group behind a cyberattack — could be a criminal gang, a nation-state, or an insider.',
    analogy: 'Like identifying whether a robbery was done by a local thief or an organised crime ring — it changes your response.',
    example: 'APT41 is a Chinese state-sponsored group. CL0P is a Russian criminal ransomware gang.',
    category: 'Attribution',
  },
  {
    term: 'Lateral Movement',
    emoji: '🏃',
    plain: 'After breaking into one computer, the hacker quietly moves to other machines in the same network.',
    analogy: 'A thief breaks through your front door, then creeps room-to-room looking for the safe.',
    example: 'Once inside the receptionist\'s PC, the hacker uses stolen credentials to access the CFO\'s computer.',
    category: 'Attack Tactic',
  },
  {
    term: 'Sigma Rule',
    emoji: '📡',
    plain: 'A detection rule that tells your security system what suspicious activity to look for in logs.',
    analogy: 'Like setting a motion detector to alert you when someone enters a restricted room.',
    example: 'A Sigma rule might flag "any PowerShell command that downloads a file from the internet after midnight."',
    category: 'Detection',
  },
  {
    term: 'YARA Rule',
    emoji: '🔬',
    plain: 'A pattern-matching rule used to identify malicious files on your computer or network.',
    analogy: 'Like a fingerprint scanner — if a file matches a known malware fingerprint, it\'s flagged.',
    example: 'A YARA rule for WannaCry looks for the string "WANNACRY" inside executable files.',
    category: 'Detection',
  },
  {
    term: 'STIX 2.1',
    emoji: '🗂️',
    plain: 'A standardised language for sharing threat intelligence between security teams worldwide.',
    analogy: 'Like a universal language that lets security teams in the US and UK describe the same hacker the same way.',
    example: 'STIX bundles can be shared between CISA, FBI, and private companies so everyone blocks the same threats.',
    category: 'Framework',
  },
  {
    term: 'Phishing',
    emoji: '🎣',
    plain: 'A fake email or message designed to trick you into clicking a malicious link or revealing your password.',
    analogy: 'Like a scam letter pretending to be from your bank — but it\'s designed to steal your account details.',
    example: '"Your PayPal account has been suspended. Click here to verify." — that\'s phishing.',
    category: 'Attack Tactic',
  },
  {
    term: 'C2 (Command & Control)',
    emoji: '🎛️',
    plain: 'A server that hackers use to remotely control malware they\'ve installed on your computer.',
    analogy: 'Like a puppeteer pulling strings — the C2 server is the puppeteer\'s control room, and malware is the puppet.',
    example: 'CobaltStrike C2 servers send instructions like "steal these files" to infected machines.',
    category: 'Attack Infrastructure',
  },
  {
    term: 'Patch',
    emoji: '🩹',
    plain: 'A software update released by a company to fix a security vulnerability.',
    analogy: 'Like a plumber fixing a leaking pipe — once patched, the vulnerability can no longer be exploited.',
    example: 'Microsoft released a patch for the PrintNightmare vulnerability within 72 hours of discovery.',
    category: 'Defence',
  },
  {
    term: 'MFA (Multi-Factor Authentication)',
    emoji: '🔐',
    plain: 'Requiring two or more forms of proof before letting someone log in (e.g. password + phone code).',
    analogy: 'Like needing both a key AND a fingerprint to enter a secure facility.',
    example: 'Even if a hacker steals your password, MFA stops them because they also need your phone.',
    category: 'Defence',
  },
];

const CATEGORIES = ['All', ...new Set(GLOSSARY.map(g => g.category))];

export default function CyberGlossaryModal({ isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [expanded, setExpanded] = useState(null);

  if (!isOpen) return null;

  const filtered = GLOSSARY.filter(g => {
    const matchCat = activeCat === 'All' || g.category === activeCat;
    const matchSearch = !search || g.term.toLowerCase().includes(search.toLowerCase()) || g.plain.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'sticky', top: 0, background: 'var(--bg-elevated)', zIndex: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <BookOpen size={16} color="var(--accent)" />
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Cyber Jargon Buster</h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>
              {GLOSSARY.length} terms explained in plain English with real-world analogies.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Search + Filter */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} color="var(--text-tertiary)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              className="input"
              style={{ paddingLeft: '32px', fontSize: '13px' }}
              placeholder="Search terms…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                style={{
                  padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '700',
                  cursor: 'pointer', fontFamily: 'var(--font-mono)',
                  background: activeCat === c ? 'var(--accent)' : 'var(--bg-overlay)',
                  color: activeCat === c ? '#0a0f1a' : 'var(--text-secondary)',
                  border: `1px solid ${activeCat === c ? 'transparent' : 'var(--border)'}`,
                  transition: 'all 0.12s'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Terms List */}
        <div style={{ padding: '12px 24px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filtered.map((g, i) => {
            const isOpen_ = expanded === i;
            return (
              <div
                key={i}
                style={{
                  borderRadius: '10px', border: `1px solid ${isOpen_ ? 'var(--border-accent)' : 'var(--border)'}`,
                  overflow: 'hidden', transition: 'border-color 0.15s ease',
                  background: isOpen_ ? 'var(--bg-active)' : 'var(--bg-overlay)'
                }}
              >
                <button
                  onClick={() => setExpanded(isOpen_ ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', background: 'transparent', border: 'none',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)'
                  }}
                >
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{g.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: isOpen_ ? 'var(--accent)' : 'var(--text-primary)', marginBottom: '2px' }}>{g.term}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isOpen_ ? 'normal' : 'nowrap' }}>
                      {g.plain}
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px', background: 'var(--bg-raised)', color: 'var(--text-tertiary)', flexShrink: 0, marginRight: '4px' }}>
                    {g.category}
                  </span>
                  <ChevronRight size={14} color="var(--text-tertiary)" style={{ transform: isOpen_ ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                </button>

                {isOpen_ && (
                  <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ padding: '10px 12px', background: 'var(--bg-overlay)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--purple)', marginBottom: '4px' }}>🔑 Real-World Analogy</div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>{g.analogy}</p>
                    </div>
                    <div style={{ padding: '10px 12px', background: 'rgba(52,211,153,0.05)', borderRadius: '8px', border: '1px solid rgba(52,211,153,0.15)' }}>
                      <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--green)', marginBottom: '4px' }}>💡 Real Example</div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>{g.example}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              No terms match your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
