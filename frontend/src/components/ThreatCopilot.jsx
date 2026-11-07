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
  onClearExternalQuery,
  apiKey,
  onNavigateTab
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
    <div className="fade-in copilot-container">

      {/* Copilot Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: '6px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '5px',
            background: 'var(--accent-dim)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Bot size={16} color="var(--accent)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                AI Threat Intelligence Copilot
              </span>
              {threatActor && (
                <span style={{
                  background: 'rgba(248, 81, 73, 0.1)',
                  color: 'var(--red)',
                  border: '1px solid rgba(248, 81, 73, 0.25)',
                  padding: '1px 7px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {threatActor}
                </span>
              )}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
              Context-grounded autonomous security assistant · Enterprise SOC Engine
            </div>
          </div>
        </div>
      </div>

      {/* Messages Canvas */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px',
        background: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border)',
        padding: '16px'
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
                width: '28px', height: '28px', borderRadius: '5px', flexShrink: 0,
                background: isUser ? 'var(--bg-raised)' : 'var(--bg-overlay)',
                border: `1px solid ${isUser ? 'var(--border-strong)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {isUser ? <User size={14} color="var(--text-secondary)" /> : <Bot size={14} color="var(--accent)" />}
              </div>

              {/* Message Bubble */}
              <div style={{
                maxWidth: '78%',
                background: isUser ? 'var(--bg-raised)' : 'var(--bg-overlay)',
                border: `1px solid ${isUser ? 'var(--border-strong)' : 'var(--border)'}`,
                borderRadius: '6px',
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
            <div style={{
              width: '28px', height: '28px', borderRadius: '5px',
              background: 'var(--bg-overlay)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Loader size={14} color="var(--accent)" className="spin" />
            </div>
            <div style={{
              background: 'var(--bg-overlay)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '10px 14px',
              fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span>Correlating threat advisory telemetry</span>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)' }} />
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
              padding: '5px 10px', borderRadius: '5px', fontSize: '11px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer',
              transition: 'all 0.12s ease', fontFamily: 'var(--font-sans)',
              fontWeight: '500'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--text-primary)';
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
      <form onSubmit={submit} style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask AI Copilot — query threat attribution, malware behaviors, firewall rules, containment procedures…"
            style={{
              padding: '10px 14px',
              fontSize: '12.5px',
              borderRadius: '6px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              width: '100%'
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            padding: '0 18px',
            borderRadius: '6px',
            height: '38px',
            flexShrink: 0,
            background: 'var(--accent)',
            border: 'none',
            color: '#ffffff',
            fontSize: '12.5px',
            fontWeight: '600',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !input.trim() ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'opacity 0.12s ease'
          }}
          onMouseEnter={e => { if (!isLoading && input.trim()) e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          <Send size={14} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
