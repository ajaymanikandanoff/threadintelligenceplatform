import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';

const QUICK_PROMPTS = [
  { icon: '🛡️', text: 'Summarize attack vector and impacted assets.' },
  { icon: '⚡', text: 'What must our IT team execute in the next 1 hour?' },
  { icon: '🚫', text: 'List all IPs to block on perimeter firewalls.' },
  { icon: '🩹', text: 'Which software versions need emergency patching?' },
];

export default function ThreatCopilot({
  messages,
  onSendMessage,
  isLoading,
  threatActor,
  externalQuery,
  onClearExternalQuery
}) {
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (externalQuery) {
      setInput(externalQuery);
      onClearExternalQuery?.();
    }
  }, [externalQuery, onClearExternalQuery]);

  const submit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: '14px' }}>

      {/* Copilot Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px', background: 'var(--bg-elevated)', borderRadius: '12px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(129,140,248,0.2) 100%)',
            border: '1px solid rgba(56,189,248,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Bot size={17} color="var(--accent)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
                AI Threat Intelligence Copilot
              </span>
              {threatActor && (
                <span className="badge badge-red">{threatActor}</span>
              )}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
              Context-grounded autonomous security assistant · Powered by Gemini 2.5 Flash
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px',
          color: 'var(--text-tertiary)', background: 'var(--bg-overlay)',
          padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)'
        }}>
          <span className="status-dot" style={{ background: 'var(--green)', width: '6px', height: '6px' }} />
          <span>CONNECTED & SYNCED</span>
        </div>
      </div>

      {/* Messages Canvas */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px',
        background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border)',
        padding: '20px'
      }}>
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '12px',
                flexDirection: isUser ? 'row-reverse' : 'row',
                alignItems: 'flex-start'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                background: isUser ? 'var(--purple-dim)' : 'var(--bg-overlay)',
                border: `1px solid ${isUser ? 'rgba(129,140,248,0.3)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {isUser ? <User size={15} color="var(--purple)" /> : <Bot size={15} color="var(--accent)" />}
              </div>

              {/* Message Bubble */}
              <div style={{
                maxWidth: '78%',
                background: isUser ? 'linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(56,189,248,0.05) 100%)' : 'var(--bg-overlay)',
                border: `1px solid ${isUser ? 'rgba(56,189,248,0.35)' : 'var(--border)'}`,
                borderRadius: isUser ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
                padding: '12px 16px',
                fontSize: '13px',
                lineHeight: '1.65',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {msg.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px',
              background: 'var(--bg-overlay)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Loader size={15} color="var(--accent)" className="spin" />
            </div>
            <div style={{
              background: 'var(--bg-overlay)', border: '1px solid var(--border)',
              borderRadius: '2px 12px 12px 12px', padding: '12px 16px',
              fontSize: '13px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span>Correlating threat advisory telemetry</span>
              <span className="status-dot status-dot-pulse" style={{ background: 'var(--accent)', width: '6px', height: '6px' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {QUICK_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => !isLoading && onSendMessage(p.text)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '20px', fontSize: '11.5px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer',
              transition: 'all 0.15s ease', fontFamily: 'var(--font-sans)',
              fontWeight: '500'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-accent)';
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.background = 'var(--bg-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
            }}
          >
            <span>{p.icon}</span>
            <span>{p.text}</span>
          </button>
        ))}
      </div>

      {/* Query Input Bar */}
      <form onSubmit={submit} style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask AI Copilot — query threat attribution, malware behaviors, firewall rules, containment procedures…"
            style={{ padding: '11px 16px', fontSize: '13px', borderRadius: '10px' }}
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading || !input.trim()}
          style={{ padding: '0 20px', borderRadius: '10px', height: '42px', flexShrink: 0 }}
        >
          <Send size={15} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
