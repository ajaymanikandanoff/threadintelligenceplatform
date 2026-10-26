import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  UserX,
  Bug,
  ShieldCheck,
  Check,
  ArrowRight,
  Volume2,
  VolumeX,
  Languages,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Calculator
} from 'lucide-react';

export default function OverviewTab({ threatData, onSwitchTab, onOpenIngest }) {
  const [checkedSteps, setCheckedSteps] = useState({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [languageMode, setLanguageMode] = useState('en'); // 'en' or 'ta'

  // Risk Calculator State
  const [usesSoftware, setUsesSoftware] = useState(false);
  const [isPublicExposed, setIsPublicExposed] = useState(false);
  const [noMfa, setNoMfa] = useState(false);

  // Stop audio if component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!threatData) {
    return (
      <div className="surface" style={{ textAlign: 'center', padding: '60px 24px', maxWidth: '640px', margin: '40px auto' }}>
        <ShieldAlert size={48} color="var(--cyan)" style={{ marginBottom: '16px', opacity: 0.8 }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-0)', marginBottom: '8px' }}>
          No Threat Report Loaded Yet
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: '1.6', marginBottom: '20px' }}>
          Upload any cybersecurity advisory PDF, incident log, or choose an official government cyber advisory to let the AI analyze it automatically.
        </p>
        <button className="btn-primary" onClick={onOpenIngest} style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
          Analyze a Threat Report
        </button>
      </div>
    );
  }

  const {
    title,
    threat_actor = {},
    target_sectors = [],
    cves = [],
    mitre_techniques = [],
    iocs = [],
    executive_summary,
    attack_flow_steps = [],
    blue_team_actions = []
  } = threatData;

  const toggleCheck = (idx) => {
    setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Text to Speech Narrator
  const toggleAudioBriefing = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `Cyber Threat Intelligence Briefing for ${title}. Attacking group: ${threat_actor.name || 'Unknown'}. Summary: ${executive_summary || 'Exploitation observed targeting enterprise systems.'}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  // Calculate Organization Risk Score
  let riskLevel = 'LOW';
  let riskColor = 'var(--green)';
  let riskAdvice = 'Your environment is at low risk if you do not run this specific targeted software.';
  const riskFactors = (usesSoftware ? 2 : 0) + (isPublicExposed ? 2 : 0) + (noMfa ? 1 : 0);

  if (riskFactors >= 4) {
    riskLevel = 'CRITICAL EMERGENCY';
    riskColor = 'var(--red)';
    riskAdvice = 'URGENT: Your systems match the attacker targets with open exposure. Isolate vulnerable servers and patch immediately!';
  } else if (riskFactors >= 2) {
    riskLevel = 'MODERATE TO HIGH';
    riskColor = 'var(--amber)';
    riskAdvice = 'WARNING: You have partial exposure. Enforce MFA, block attacker IPs on perimeter, and verify software patches.';
  }

  // Tamil summary generator helper
  const getTamilExplanation = () => {
    const actorName = threat_actor.name || 'ஒரு சர்வதேச ஹேக்கர் குழு';
    const cveName = cves.length > 0 ? cves[0].id : 'மென்பொருள் குறைபாடு';
    return (
      <div style={{ fontSize: '0.86rem', lineHeight: '1.8', color: 'var(--text-1)' }}>
        <p style={{ marginBottom: '10px' }}>
          <strong>யார் தாக்குகிறார்கள்?</strong> {actorName} என்ற அபாயகரமான ஹேக்கர் அமைப்பு உங்கள் நெட்வொர்க்கைத் தாக்க முயற்சிக்கிறது.
        </p>
        <p style={{ marginBottom: '10px' }}>
          <strong>எப்படி நுழைகிறார்கள்?</strong> இவர்கள் <strong>{cveName}</strong> என்ற மென்பொருள் பிழையைப் பயன்படுத்தி உங்கள் கணினிகளுக்குள் எந்த கடவுச்சொல்லும் (password) இல்லாமல் நுழைய முடியும்.
        </p>
        <p style={{ margin: 0 }}>
          <strong>உடனே என்ன செய்ய வேண்டும்?</strong> கீழே கொடுக்கப்பட்டுள்ள தீங்கிழைக்கும் IP முகவரிகளை உங்கள் ஃபயர்வால்-இல் (Firewall) தடை செய்துவிட்டு, உங்கள் சேவையகங்களை (Servers) உடனடியாக அப்டேட் செய்யவும்.
        </p>
      </div>
    );
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* 1. Header Toolbar with Audio Narrator & Tamil Toggle */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 18px', background: 'var(--bg-2)', borderRadius: '10px',
        border: '1px solid var(--border)', flexWrap: 'wrap', gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--cyan)" />
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-0)' }}>
            AI Threat Assessment:
          </span>
          <span className="tag tag-red" style={{ fontSize: '0.68rem' }}>LIVE ADVISORY</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Audio Narrator */}
          <button
            onClick={toggleAudioBriefing}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '6px',
              border: `1px solid ${isPlayingAudio ? 'var(--cyan)' : 'var(--border)'}`,
              background: isPlayingAudio ? 'rgba(99,179,237,0.15)' : 'var(--bg-1)',
              color: isPlayingAudio ? 'var(--cyan)' : 'var(--text-2)',
              fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600'
            }}
            title="Read summary aloud using browser text-to-speech"
          >
            {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{isPlayingAudio ? 'Stop Narrator' : '🔊 Listen to Audio Briefing'}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguageMode(languageMode === 'en' ? 'ta' : 'en')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '6px',
              border: '1px solid var(--border)',
              background: languageMode === 'ta' ? 'rgba(183,148,244,0.15)' : 'var(--bg-1)',
              color: languageMode === 'ta' ? 'var(--purple)' : 'var(--text-2)',
              fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600'
            }}
            title="Switch between English and Tamil plain explanation"
          >
            <Languages size={14} />
            <span>{languageMode === 'en' ? 'தமிழ் விளக்கம்' : 'English Summary'}</span>
          </button>
        </div>
      </div>

      {/* 2. Threat Title Header */}
      <div className="surface" style={{ padding: '24px 28px', borderLeft: '4px solid var(--red)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span className="tag tag-red" style={{ fontSize: '0.72rem' }}>CRITICAL ADVISORY</span>
          <span className="tag tag-amber" style={{ fontSize: '0.72rem' }}>
            {threat_actor.motivation || 'Financial Extortion / Espionage'}
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-3)', marginLeft: 'auto' }}>
            Engine: Gemini 2.5 Flash
          </span>
        </div>

        <h1 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-0)', lineHeight: '1.35', margin: '4px 0 12px 0' }}>
          {title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: '600' }}>Targeted Industries:</span>
          {target_sectors.length > 0 ? (
            target_sectors.map((sec, i) => (
              <span key={i} className="tag tag-purple" style={{ fontSize: '0.72rem' }}>{sec}</span>
            ))
          ) : (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Broad Commercial & Enterprise Organizations</span>
          )}
        </div>
      </div>

      {/* 3. The 3 Core Answers (Who, How, What to do) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>

        {/* Card 1: WHO ATTACKED? */}
        <div className="surface" style={{ padding: '20px 22px', borderTop: '3px solid var(--red)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <UserX size={18} color="var(--red)" />
            <span style={{ fontSize: '0.76rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)' }}>
              1. The Hacker Group
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--red)', marginBottom: '6px' }}>
            {threat_actor.name || 'Unattributed Group'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: '1.4', marginBottom: '10px' }}>
            Origin: <strong>{threat_actor.country || 'Global / Unknown'}</strong>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: 0, lineHeight: '1.45' }}>
            {threat_actor.description || 'Known advanced cyber threat group operating active intrusion campaigns.'}
          </p>
        </div>

        {/* Card 2: HOW DID THEY ENTER? */}
        <div className="surface" style={{ padding: '20px 22px', borderTop: '3px solid var(--amber)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Bug size={18} color="var(--amber)" />
            <span style={{ fontSize: '0.76rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)' }}>
              2. Security Flaw (CVE)
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--amber)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
            {cves.length > 0 ? cves[0].id : 'Zero-Day / Phishing'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: '1.4', marginBottom: '10px' }}>
            Severity: <strong style={{ color: 'var(--red)' }}>{cves.length > 0 ? `CVSS ${cves[0].cvss || '9.8'} Critical` : 'High'}</strong>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: 0, lineHeight: '1.45' }}>
            {cves.length > 0
              ? (cves[0].description || 'Vulnerability in public-facing software allowed attackers remote access.')
              : 'Initial entry gained via compromised credentials without Multi-Factor Authentication.'}
          </p>
        </div>

        {/* Card 3: HOW TO STOP THEM? */}
        <div className="surface" style={{ padding: '20px 22px', borderTop: '3px solid var(--green)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={18} color="var(--green)" />
            <span style={{ fontSize: '0.76rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)' }}>
              3. Defense Action
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--green)', marginBottom: '6px' }}>
            {iocs.length} Indicators to Block
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: '1.4', marginBottom: '10px' }}>
            Firewall Scripts & SIEM Rules
          </div>
          <button
            className="btn-primary"
            onClick={() => onSwitchTab('defense')}
            style={{ width: '100%', justifyContent: 'center', padding: '7px 12px', fontSize: '0.78rem' }}
          >
            <span>View Defense Scripts</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </div>

      {/* 4. Plain English or Tamil Summary Box */}
      <div className="surface" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-0)', margin: 0 }}>
            {languageMode === 'ta' ? 'அச்சுறுத்தல் எளிய விளக்கம் (Tamil Plain Translation)' : 'What Happened? (Plain English Summary)'}
          </h3>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>
            {languageMode === 'ta' ? 'எளிமையான தமிழில்' : 'Everyday Language'}
          </span>
        </div>

        {languageMode === 'ta' ? (
          getTamilExplanation()
        ) : (
          <p style={{ fontSize: '0.88rem', lineHeight: '1.7', color: 'var(--text-1)', margin: 0 }}>
            {executive_summary || threatData.summary || 'Attackers exploited security loopholes to breach network environments, steal credentials, and compromise sensitive databases.'}
          </p>
        )}
      </div>

      {/* 5. Interactive "Are We Vulnerable?" Risk Calculator */}
      <div className="surface" style={{ padding: '24px 28px', borderTop: `3px solid ${riskColor}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Calculator size={18} color="var(--cyan)" />
          <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-0)', margin: 0 }}>
            Are We Vulnerable? (Interactive Exposure Check)
          </h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', margin: '0 0 16px 0' }}>
          Tick the boxes that match your organization's setup to compute your live vulnerability exposure:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' }}>
          {[
            {
              checked: usesSoftware,
              toggle: () => setUsesSoftware(!usesSoftware),
              label: '1. We use this affected software or vendor',
              sub: 'Running on premises or on cloud virtual machines'
            },
            {
              checked: isPublicExposed,
              toggle: () => setIsPublicExposed(!isPublicExposed),
              label: '2. Port is open to the public internet',
              sub: 'Directly accessible without VPN boundary'
            },
            {
              checked: noMfa,
              toggle: () => setNoMfa(!noMfa),
              label: '3. Admin accounts lack MFA',
              sub: 'Logins only require single password'
            }
          ].map((item, i) => (
            <div
              key={i}
              onClick={item.toggle}
              style={{
                padding: '12px 14px', borderRadius: '8px', cursor: 'pointer',
                background: item.checked ? 'rgba(252,129,129,0.08)' : 'var(--bg-2)',
                border: `1px solid ${item.checked ? 'var(--red)' : 'var(--border)'}`,
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <input type="checkbox" checked={item.checked} onChange={item.toggle} style={{ cursor: 'pointer' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: item.checked ? 'var(--red)' : 'var(--text-1)' }}>
                  {item.label}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', paddingLeft: '20px' }}>
                {item.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Computed Exposure Banner */}
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          background: 'var(--bg-2)', border: `1px solid ${riskColor}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>
              Assessed Exposure Status
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: riskColor, marginTop: '2px' }}>
              {riskLevel}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', marginTop: '4px' }}>
              {riskAdvice}
            </div>
          </div>
          <button
            className="btn-ghost"
            onClick={() => onSwitchTab('defense')}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <span>Execute Containment Plan</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 6. Attack Flow Steps */}
      {attack_flow_steps.length > 0 && (
        <div className="surface" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Clock size={17} color="var(--cyan)" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-0)', margin: 0 }}>
              How the Attack Unfolded (Step-by-Step Flow)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {attack_flow_steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex', gap: '14px', alignItems: 'flex-start',
                  padding: '12px 16px', background: 'var(--bg-2)', borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'rgba(99,179,237,0.15)', color: 'var(--cyan)',
                  fontSize: '0.76rem', fontWeight: '700', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: '600', color: 'var(--text-0)', marginBottom: '3px' }}>
                    {step.title || `Stage ${idx + 1}: ${step.tactic || 'Intrusion Step'}`}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: '1.5' }}>
                    {step.description || step.details || step}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Action Items Checklist */}
      <div className="surface" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-0)', margin: 0 }}>
              Immediate Security Action Items (Interactive Checklist)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: '4px 0 0 0' }}>
              Tick off each step as your IT or security team implements it:
            </p>
          </div>
          <button
            className="btn-ghost"
            onClick={() => onSwitchTab('defense')}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <span>View Firewall & SIEM Rules</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(blue_team_actions.length > 0 ? blue_team_actions : [
            'Block all malicious C2 IP addresses and suspicious domains on perimeter firewall and DNS.',
            'Apply emergency security patches for exploited software versions immediately.',
            'Enforce Multi-Factor Authentication (MFA) on all remote desktop, VPN, and email accounts.',
            'Scan endpoint servers with provided YARA signatures for unauthorized webshells or malware payloads.',
            'Isolate any systems exhibiting abnormal outbound traffic or high-volume data transfers.'
          ]).map((action, i) => {
            const isDone = !!checkedSteps[i];
            const text = typeof action === 'string' ? action : (action.action || action.title || '');
            return (
              <div
                key={i}
                onClick={() => toggleCheck(i)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '10px 14px', borderRadius: '6px',
                  background: isDone ? 'rgba(104,211,145,0.06)' : 'var(--bg-2)',
                  border: `1px solid ${isDone ? 'rgba(104,211,145,0.3)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '18px', height: '18px', borderRadius: '4px',
                  border: `1.5px solid ${isDone ? 'var(--green)' : 'var(--text-3)'}`,
                  background: isDone ? 'var(--green)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: '1px', flexShrink: 0
                }}>
                  {isDone && <Check size={12} color="#000" strokeWidth={3} />}
                </div>
                <div style={{
                  fontSize: '0.82rem',
                  color: isDone ? 'var(--text-3)' : 'var(--text-1)',
                  textDecoration: isDone ? 'line-through' : 'none',
                  lineHeight: '1.4'
                }}>
                  {text}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
