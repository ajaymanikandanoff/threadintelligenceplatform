import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader } from 'lucide-react';

const PROMPTS = [
  "Explain this threat in simple, non-technical words.",
  "What should our IT team do right now in the next 1 hour?",
  "Which servers or software need emergency patching?",
  "List all malicious IPs to block on our firewall."
];


export default function ThreatCopilot({ messages, onSendMessage, isLoading, threatActor, externalQuery, onClearExternalQuery }) {
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);
  useEffect(() => { if (externalQuery) { setInput(externalQuery); onClearExternalQuery?.(); } }, [externalQuery]);

  const submit = (e) => { e.preventDefault(); if (!input.trim() || isLoading) return; onSendMessage(input.trim()); setInput(''); };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '660px', gap: '12px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bot size={18} color="var(--cyan)" />
          <span style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-0)' }}>Threat Copilot</span>
          {threatActor && <span className="tag tag-red" style={{ fontSize: '0.65rem' }}>{threatActor}</span>}
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
          <span className="status-dot" style={{ background: 'var(--cyan)' }}></span> Context-grounded
        </span>
      </div>

      {/* Messages */}
      <div className="surface" style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div key={i} style={{ display: 'flex', gap: '10px', alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              {!isUser && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={14} color="var(--cyan)" />
                </div>
              )}
              <div style={{
                background: isUser ? 'rgba(99,179,237,0.12)' : 'var(--bg-2)',
                border: `1px solid ${isUser ? 'rgba(99,179,237,0.25)' : 'var(--border)'}`,
                borderRadius: '10px', padding: '12px 16px',
                fontSize: '0.86rem', lineHeight: '1.55', color: 'var(--text-1)', whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </div>
              {isUser && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={14} color="var(--purple)" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader size={14} color="var(--cyan)" className="spin" />
            </div>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 16px', fontSize: '0.84rem', color: 'var(--text-3)' }}>
              Analyzing threat context…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggested prompts */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
        {PROMPTS.map((p, i) => (
          <button key={i} onClick={() => !isLoading && onSendMessage(p)} className="btn-ghost"
            style={{ whiteSpace: 'nowrap', padding: '5px 10px', fontSize: '0.72rem', borderRadius: '16px' }}>
            <Sparkles size={11} /><span>{p}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={submit} style={{ display: 'flex', gap: '8px' }}>
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Ask about IoCs, attack paths, mitigations…"
          style={{
            flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '7px',
            padding: '11px 14px', color: 'var(--text-0)', fontSize: '0.86rem', fontFamily: 'var(--font-sans)',
            outline: 'none', transition: 'border-color 0.15s'
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(99,179,237,0.4)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button type="submit" className="btn-primary" disabled={isLoading || !input.trim()}>
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
