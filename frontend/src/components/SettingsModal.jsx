import React, { useState } from 'react';
import { X, ExternalLink, Check, AlertCircle, ShieldCheck, Cpu } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, apiKey, setApiKey, selectedModel, setSelectedModel, onSave }) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [tempModel, setTempModel] = useState(selectedModel || 'gemini-2.5-flash');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const test = async () => {
    if (!tempKey.trim()) {
      setTestResult({ ok: false, msg: 'Enter an API key first.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const r = await fetch('http://localhost:8000/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: tempKey.trim(), model: tempModel })
      });
      const d = await r.json();
      setTestResult({ ok: d.success, msg: d.success ? 'Gemini API key verified successfully!' : (d.error || 'Validation failed.') });
    } catch {
      setTestResult({ ok: false, msg: 'Cannot reach backend on port 8000.' });
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
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: '480px', width: '100%',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '28px', boxShadow: '0 24px 64px rgba(0,0,0,0.7)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="var(--accent)" />
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                AI Engine & Model Settings
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Configure your Google Gemini API key and active intelligence model.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '22px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Gemini API Key
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={e => setTempKey(e.target.value)}
              placeholder="AIzaSy…"
              style={{
                width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '10px 14px', color: 'var(--text-primary)',
                fontSize: '13px', fontFamily: 'var(--font-mono)', outline: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Leave blank to use built-in heuristic engine.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}
              >
                Get API key <ExternalLink size={10} />
              </a>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Gemini Model Selection
            </label>
            <select
              value={tempModel}
              onChange={e => setTempModel(e.target.value)}
              style={{
                width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '10px 14px', color: 'var(--text-primary)',
                fontSize: '13px', outline: 'none'
              }}
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fastest & High Precision)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Multimodal Reasoning)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Lightweight & High Throughput)</option>
            </select>
          </div>

          <button
            className="btn-ghost"
            onClick={test}
            disabled={testing}
            style={{ width: '100%', justifyContent: 'center', padding: '9px', fontSize: '12px' }}
          >
            <ShieldCheck size={14} color="var(--accent)" />
            <span>{testing ? 'Validating Key…' : 'Validate API Key'}</span>
          </button>

          {testResult && (
            <div style={{
              background: testResult.ok ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
              border: `1px solid ${testResult.ok ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
              borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '12px', color: testResult.ok ? 'var(--green)' : 'var(--red)'
            }}>
              {testResult.ok ? <Check size={15} /> : <AlertCircle size={15} />}
              <span>{testResult.msg}</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '8px 16px', fontSize: '12px' }}>
            Cancel
          </button>
          <button className="btn-primary" onClick={save} style={{ padding: '8px 20px', fontSize: '12px' }}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
