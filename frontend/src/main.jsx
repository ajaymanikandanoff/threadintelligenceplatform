import React, { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CyberIntel UI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#080c14',
          color: '#f1f5f9',
          padding: '40px',
          fontFamily: 'Inter, system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px'
        }}>
          <div style={{
            background: '#0d1117',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: '12px',
            padding: '24px 32px',
            maxWidth: '650px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}>
            <h2 style={{ color: '#f87171', margin: '0 0 12px', fontSize: '18px' }}>
              ⚠️ Interface Rendering Exception
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 16px', lineHeight: '1.6' }}>
              An unexpected state was encountered. You can reload the page or clear local cache below.
            </p>
            <pre style={{
              background: '#080c14',
              padding: '12px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#f87171',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error?.toString()}
            </pre>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '8px 16px',
                  background: '#38bdf8',
                  color: '#080c14',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Reload App
              </button>
              <button
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Reset Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
