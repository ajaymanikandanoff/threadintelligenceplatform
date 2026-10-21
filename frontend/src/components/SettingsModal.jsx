import React, { useState } from 'react';
import { X, Key, Cpu, Check, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  apiKey, 
  setApiKey, 
  selectedModel, 
  setSelectedModel,
  onSave 
}) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [tempModel, setTempModel] = useState(selectedModel || 'gemini-2.5-flash');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!tempKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API Key first.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('http://localhost:8000/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: tempKey.trim(), model: tempModel })
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: 'Google Gemini API key verified successfully!' });
      } else {
        setTestResult({ success: false, message: data.error || 'API Key validation failed.' });
      }
    } catch (err) {
      setTestResult({ success: false, message: 'Could not connect to backend server on port 8000.' });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveSettings = () => {
    setApiKey(tempKey.trim());
    setSelectedModel(tempModel);
    localStorage.setItem('GEMINI_API_KEY', tempKey.trim());
    localStorage.setItem('GEMINI_MODEL', tempModel);
    onSave?.();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 8, 17, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }} onClick={onClose}>
      <div 
        className="cyber-card" 
        style={{ 
          maxWidth: '540px', 
          width: '100%', 
          padding: '26px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.85)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Key size={20} color="var(--accent-green)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>
                AI Engine & Gemini Settings
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Configure your Google Gemini API Key and model preferences.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '6px' }}>
              Gemini API Key
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="AIzaSy..."
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Leave blank to use the high-precision built-in local CTI engine.
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Get Free Key</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '6px' }}>
              Model Selection
            </label>
            <select
              value={tempModel}
              onChange={(e) => setTempModel(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-dark)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fastest & High Precision)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Multi-hop Reasoning)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Standard Speed)</option>
            </select>
          </div>

          {/* Test connection button */}
          <div>
            <button
              className="cyber-btn-secondary"
              onClick={handleTestKey}
              disabled={testing}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <ShieldCheck size={14} />
              <span>{testing ? 'Testing Key...' : 'Validate Key with Google AI Studio'}</span>
            </button>
          </div>

          {/* Test feedback */}
          {testResult && (
            <div style={{
              background: testResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 51, 102, 0.1)',
              border: `1px solid ${testResult.success ? 'var(--accent-green)' : 'var(--accent-red)'}`,
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              color: testResult.success ? '#86efac' : '#fca5a5'
            }}>
              {testResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <button className="cyber-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="cyber-btn-primary" onClick={handleSaveSettings}>
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
