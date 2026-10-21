import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "List all critical IoCs for perimeter firewall blocking",
  "Explain step-by-step how the adversary achieved initial access",
  "What registry or PowerShell mitigations prevent this attack on Windows?",
  "Draft an Executive Briefing paragraph for the Chief Information Security Officer (CISO)"
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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (externalQuery) {
      setInput(externalQuery);
      onClearExternalQuery?.();
    }
  }, [externalQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handlePromptClick = (promptText) => {
    if (isLoading) return;
    onSendMessage(promptText);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '680px', gap: '16px' }}>
      {/* Top Banner */}
      <div className="cyber-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(0, 240, 255, 0.15)',
            border: '1px solid var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={18} color="var(--accent-cyan)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
              AI Threat Hunter Copilot
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Grounded in active threat knowledge graph for <strong>{threatActor || 'Adversary Campaign'}</strong>
            </p>
          </div>
        </div>

        <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
          <span className="pulse-dot" style={{ background: 'var(--accent-cyan)' }}></span>
          CONTEXT GROUNDED
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="cyber-card" style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: 'rgba(6, 10, 22, 0.8)'
      }}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {!isUser && (
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'rgba(0, 240, 255, 0.15)',
                  border: '1px solid var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <Bot size={16} color="var(--accent-cyan)" />
                </div>
              )}

              <div style={{
                background: isUser ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 153, 255, 0.2))' : 'rgba(15, 23, 42, 0.75)',
                border: `1px solid ${isUser ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                borderRadius: '12px',
                padding: '14px 18px',
                color: '#fff',
                fontSize: '0.88rem',
                lineHeight: '1.55',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </div>

              {isUser && (
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'rgba(168, 85, 247, 0.2)',
                  border: '1px solid var(--accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <User size={16} color="var(--accent-purple)" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <RefreshCw size={14} color="var(--accent-cyan)" className="pulse-dot" />
            </div>
            <div style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '12px 18px',
              color: 'var(--text-muted)',
              fontSize: '0.84rem'
            }}>
              Analyzing threat graph & formulating response...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {SUGGESTED_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handlePromptClick(p)}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
              padding: '6px 12px',
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              e.currentTarget.style.color = 'var(--accent-cyan)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <Sparkles size={12} />
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Copilot about IoCs, attack paths, MITRE techniques, or remediation steps..."
          style={{
            flex: 1,
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#fff',
            fontSize: '0.88rem',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent-cyan)'}
          onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
        />
        <button
          type="submit"
          className="cyber-btn-primary"
          disabled={isLoading || !input.trim()}
          style={{ opacity: isLoading || !input.trim() ? 0.6 : 1 }}
        >
          <Send size={15} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
