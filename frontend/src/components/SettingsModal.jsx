import React, { useState } from 'react';
import { X, ExternalLink, Check, AlertCircle, ShieldCheck } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, apiKey, setApiKey, selectedModel, setSelectedModel, onSave }) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [tempModel, setTempModel] = useState(selectedModel || 'gemini-2.5-flash');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const test = async () => {
    if (!tempKey.trim()) { setTestResult({ ok: false, msg: 'Enter an API key first.' }); return; }
    setTesting(true); setTestResult(null);
    try {
      const r = await fetch('http://localhost:8000/api/test-key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ api_key: tempKey.trim(), model: tempModel }) });
      const d = await r.json();
      setTestResult({ ok: d.success, msg: d.success ? 'Gemini API key verified!' : (d.error || 'Validation failed.') });
    } catch { setTestResult({ ok: false, msg: 'Cannot reach backend on port 8000.' }); }
    finally { setTesting(false); }
  };

  const save = () => {
    setApiKey(tempKey.trim()); setSelectedModel(tempModel);
    localStorage.setItem('GEMINI_API_KEY', tempKey.trim());
    localStorage.setItem('GEMINI_MODEL', tempModel);
    onSave?.(); onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,9,15,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }} onClick={onClose}>
      <div className="surface" style={{ maxWidth: '460px', width: '100%', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-0)', marginBottom: '4px' }}>AI Engine Settings</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Configure your Google Gemini API key and model.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-1)', marginBottom: '6px' }}>API Key</label>
            <input type="password" value={tempKey} onChange={e => setTempKey(e.target.value)} placeholder="AIzaSy…"
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '7px', padding: '10px 14px', color: 'var(--text-0)', fontSize: '0.84rem', fontFamily: 'var(--font-mono)', outline: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Leave blank for built-in local engine.</span>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: 'var(--cyan)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>Get key <ExternalLink size={10} /></a>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-1)', marginBottom: '6px' }}>Model</label>
            <select value={tempModel} onChange={e => setTempModel(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '7px', padding: '10px 14px', color: 'var(--text-0)', fontSize: '0.84rem', outline: 'none' }}>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            </select>
          </div>

          <button className="btn-ghost" onClick={test} disabled={testing} style={{ width: '100%', justifyContent: 'center' }}>
            <ShieldCheck size={14} /><span>{testing ? 'Testing…' : 'Validate Key'}</span>
          </button>

          {testResult && (
            <div style={{
              background: testResult.ok ? 'rgba(104,211,145,0.08)' : 'rgba(252,129,129,0.08)',
              border: `1px solid ${testResult.ok ? 'rgba(104,211,145,0.3)' : 'rgba(252,129,129,0.3)'}`,
              borderRadius: '6px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '0.8rem', color: testResult.ok ? 'var(--green)' : 'var(--red)'
            }}>
              {testResult.ok ? <Check size={15} /> : <AlertCircle size={15} />}
              <span>{testResult.msg}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
