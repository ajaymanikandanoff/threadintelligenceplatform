import React, { useState } from 'react';
import { X, ExternalLink, Check, AlertCircle, ShieldCheck, Cpu } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function SettingsModal({ isOpen, onClose, apiKey, setApiKey, selectedModel, setSelectedModel, onSave }) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [tempModel, setTempModel] = useState(selectedModel || 'gemini-2.5-flash');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const test = async () => {
    if (!tempKey.trim()) {
      setTestResult({ ok: false, msg: 'Enter an API key first to validate.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const r = await fetch(`${API_BASE}/api/test-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: tempKey.trim(), model: tempModel })
      });
      const d = await r.json();
      setTestResult({ ok: d.success, msg: d.success ? 'Gemini API key verified successfully!' : (d.error || 'Validation failed.') });
    } catch {
      setTestResult({ ok: false, msg: `Cannot reach backend at ${API_BASE}.` });
    } finally {
      setTesting(false);
    }
  };

  const save = () => {
    setApiKey(tempKey.trim());
    setSelectedModel(tempModel);
    localStorage.setItem('GEMINI_API_KEY', tempKey.trim());
    localStorage.setItem('GEMINI_MODEL', tempModel);
    onSave?.();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: '500px', padding: '28px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(56,189,248,0.12)', border: '1px solid var(--border-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Cpu size={16} color="var(--accent)" />
              </div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                AI Engine & Key Settings
              </h2>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Configure your Google Gemini API credentials and active LLM reasoning model.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '6px', border: 'none', background: 'transparent' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={e => setTempKey(e.target.value)}
              placeholder="Enter Gemini API key..."
              className="input"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12.5px',
                padding: '10px 14px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Leave blank to use server environment key or heuristic fallback.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '700' }}
              >
                Get Key <ExternalLink size={10} />
              </a>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Active Intelligence Model
            </label>
            <select
              value={tempModel}
              onChange={e => setTempModel(e.target.value)}
              className="input"
              style={{
                fontSize: '12.5px',
                padding: '10px 14px',
                cursor: 'pointer'
              }}
            >
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Recommended — Fastest & Active Quota)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (High Throughput & Low Latency)</option>
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (Deep Multimodal Reasoning)</option>
            </select>
          </div>

          <button
            className="btn-ghost"
            onClick={test}
            disabled={testing}
            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '12.5px' }}
          >
            <ShieldCheck size={15} color="var(--accent)" />
            <span>{testing ? 'Testing Key Connectivity…' : 'Validate Gemini API Key'}</span>
          </button>

          {testResult && (
            <div style={{
              background: testResult.ok ? 'var(--green-dim)' : 'var(--red-dim)',
              border: `1px solid ${testResult.ok ? 'rgba(16,185,129,0.35)' : 'rgba(244,63,94,0.35)'}`,
              borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '12px', color: testResult.ok ? 'var(--green)' : 'var(--red)'
            }}>
              {testResult.ok ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{testResult.msg}</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '8px 16px', fontSize: '12.5px' }}>
            Cancel
          </button>
          <button className="btn-primary" onClick={save} style={{ padding: '8px 20px', fontSize: '12.5px' }}>
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
