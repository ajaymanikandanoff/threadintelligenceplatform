import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Loader, Zap } from 'lucide-react';

const QUICK_PROMPTS = [
  { icon: '🧠', text: 'Explain this attack in plain language.' },
  { icon: '⚡', text: 'What must our IT team do in the next 1 hour?' },
  { icon: '🚫', text: 'List all IPs to block on our firewall.' },
  { icon: '🩹', text: 'Which software needs emergency patching?' },
];

export default function ThreatCopilot({ messages, onSendMessage, isLoading, threatActor, externalQuery, onClearExternalQuery }) {
  const [input, setInput] = useState('');
  const endRef = React.useRef(null);

  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);
  React.useEffect(() => {
    if (externalQuery) { setInput(externalQuery); onClearExternalQuery?.(); }
  }, [externalQuery]);

  const submit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', gap: '12px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={15} color="#fff" />
            </div>
            <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>AI Security Copilot</span>
            {threatActor && <span className="badge badge-red">{threatActor}</span>}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '4px 0 0 36px' }}>
            Context-aware assistant · Powered by Gemini 2.5 Flash
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-tertiary)', background: 'var(--bg-overlay)', padding: '5px 10px', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <span className="status-dot" style={{ background: 'var(--green)' }}></span>
          <span>Connected</span>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px',
        background: 'var(--bg-overlay)', borderRadius: '12px', border: '1px solid var(--border)',
        padding: '18px'
      }}>
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '10px',
                flexDirection: isUser ? 'row-reverse' : 'row',
                alignItems: 'flex-start'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                background: isUser ? 'var(--purple-dim)' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                border: `1px solid ${isUser ? 'rgba(167,139,250,0.3)' : 'transparent'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {isUser ? <User size={13} color="var(--purple)" /> : <Bot size={13} color="#fff" />}
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: '75%',
                background: isUser ? 'var(--bg-active)' : 'var(--bg-elevated)',
                border: `1px solid ${isUser ? 'var(--border-accent)' : 'var(--border)'}`,
                borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                padding: '10px 14px',
                fontSize: '13px',
                lineHeight: '1.6',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {msg.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Loader size={13} color="#fff" className="spin" />
            </div>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
              <span style={{ display: 'inline-flex', gap: '3px' }}>
                Analyzing threat context
                <span style={{ animation: 'pulse-dot 1s infinite' }}>.</span>
                <span style={{ animation: 'pulse-dot 1s infinite 0.3s' }}>.</span>
                <span style={{ animation: 'pulse-dot 1s infinite 0.6s' }}>.</span>
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick Prompt Pills */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {QUICK_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => !isLoading && onSendMessage(p.text)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px', borderRadius: '20px', fontSize: '12px',
              background: 'var(--bg-overlay)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer',
              transition: 'all 0.15s ease', fontFamily: 'var(--font-sans)'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <span>{p.icon}</span><span>{p.text}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={submit} style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything — threat actors, malware, containment steps, firewall rules…"
            style={{ paddingRight: '40px', fontSize: '13px' }}
            onFocus={e => e.target.style.borderColor = 'var(--border-accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading || !input.trim()}
          style={{ padding: '9px 14px', flexShrink: 0 }}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
