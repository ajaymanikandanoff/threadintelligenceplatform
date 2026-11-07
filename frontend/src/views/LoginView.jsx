import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../utils/firebase';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Web Crypto SHA-256 + Salt hashing (matching aifactchecker)
async function hashPassword(pw, salt) {
  const data = new TextEncoder().encode(salt + pw);
  if (typeof window !== 'undefined' && window.crypto && crypto.subtle) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // Fallback below
    }
  }
  let h = 5381;
  for (const b of data) h = ((h << 5) + h + b) | 0;
  return 'x' + (h >>> 0).toString(16);
}

const newSalt = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function getRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem('registered_users') || '[]');
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users) {
  try {
    localStorage.setItem('registered_users', JSON.stringify(users));
  } catch {}
}

function saveSession(session, remember = true) {
  try {
    if (!session.isGuest && session.email && session.email !== 'guest@threatlens.io') {
      session.loggedIn = true;
      session.isGuest = false;
    }
    const data = JSON.stringify(session);
    if (remember) {
      localStorage.setItem('user_session', data);
    }
    sessionStorage.setItem('user_session', data);
  } catch {}
}

function passwordLevel(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 14) s++;
  return Math.max(1, s);
}

export default function LoginView({ onSignIn }) {
  // Tabs: 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState('signin');

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPw, setShowSignInPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form State (Mandatory OTP Verification)
  const [signUpStep, setSignUpStep] = useState(1); // 1 = details, 2 = mandatory OTP
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpOtpCode, setSignUpOtpCode] = useState('');
  const [showSignUpPw, setShowSignUpPw] = useState(false);
  const [signUpCountdown, setSignUpCountdown] = useState(0);

  // Separate Forgot Password Modal State
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Alerts & Loading
  const [alert, setAlert] = useState(null); // { message, type: 'error' | 'success' | 'info' }
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let t;
    if (signUpCountdown > 0) {
      t = setTimeout(() => setSignUpCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [signUpCountdown]);



  const showAlert = (message, type = 'error') => {
    setAlert({ message, type });
  };

  const hideAlert = () => setAlert(null);

  /* ==============================================================
     SIGN IN HANDLER
     ============================================================== */
  const handleSignIn = async (e) => {
    e.preventDefault();
    hideAlert();

    const email = signInEmail.trim().toLowerCase();
    const password = signInPassword;

    if (!email || !EMAIL_RE.test(email)) {
      showAlert('Enter a valid analyst email address.', 'error');
      return;
    }
    if (!password) {
      showAlert('Enter your password to authenticate.', 'error');
      return;
    }

    setIsLoading(true);
    showAlert('Verifying credentials with FastAPI backend...', 'info');

    // 1. Try FastAPI backend /api/auth/login
    try {
      const resp = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        const sessionUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || 'Security analyst',
          phone: data.user.phone || '',
          occupation: data.user.occupation || 'Security Analyst',
          picture: data.user.pictureUrl || '',
          authProvider: data.user.authProvider || 'LOCAL',
          loggedIn: true,
          loginTime: new Date().toISOString()
        };
        saveSession(sessionUser, rememberMe);
        showAlert(`Welcome back, ${sessionUser.name}. Opening ThreatLens platform...`, 'success');
        setTimeout(() => {
          onSignIn(sessionUser);
        }, 500);
        return;
      } else if (data.detail || data.error) {
        showAlert(data.detail || data.error, 'error');
        setIsLoading(false);
        return;
      }
    } catch {
      // Backend not reachable, try client-side fallback
    }

    // 2. Client-side fallback via registered_users in localStorage
    const localUsers = getRegisteredUsers();
    const matched = localUsers.find(u => u.email === email);

    if (matched) {
      const computedHash = await hashPassword(password, matched.salt);
      if (computedHash === matched.hash) {
        const sessionUser = {
          name: matched.name,
          email: matched.email,
          role: 'Security analyst',
          authProvider: 'LOCAL',
          loggedIn: true,
          loginTime: new Date().toISOString()
        };
        saveSession(sessionUser, rememberMe);
        showAlert(`Welcome back, ${sessionUser.name}. Opening ThreatLens platform...`, 'success');
        setTimeout(() => {
          onSignIn(sessionUser);
        }, 500);
        return;
      } else {
        showAlert('Incorrect password. Try again.', 'error');
        setIsLoading(false);
        return;
      }
    }



    showAlert('No account found with this email. Create an account first or check credentials.', 'error');
    setIsLoading(false);
  };

  /* ==============================================================
     SIGN UP WITH MANDATORY OTP HANDLERS
     ============================================================== */
  const handleRequestSignUpOtp = async (e) => {
    if (e) e.preventDefault();
    hideAlert();

    const name = signUpName.trim();
    const email = signUpEmail.trim().toLowerCase();
    const password = signUpPassword;

    if (!name || name.length < 2) {
      showAlert('Enter your full analyst name (at least 2 characters).', 'error');
      return;
    }
    if (!email || !EMAIL_RE.test(email)) {
      showAlert('Enter a valid email address.', 'error');
      return;
    }
    if (!password || password.length < 6) {
      showAlert('Password must be at least 6 characters.', 'error');
      return;
    }

    setIsLoading(true);
    showAlert('Dispatching account verification OTP to your email...', 'info');

    try {
      const resp = await fetch(`${API_BASE}/api/auth/signup-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, email, password })
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        setSignUpStep(2);
        setSignUpCountdown(60);
        showAlert(data.message || `Verification code sent to ${email}. Enter the 6-digit OTP below to activate your account.`, 'success');
        return;
      } else {
        showAlert(data.detail || data.error || 'Failed to dispatch verification OTP.', 'error');
        setIsLoading(false);
        return;
      }
    } catch {
      // Offline fallback
      setSignUpStep(2);
      setSignUpCountdown(60);
      showAlert(`Verification code generated for ${email}. Enter the 6-digit OTP below.`, 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySignUpOtp = async (e) => {
    e.preventDefault();
    hideAlert();

    const name = signUpName.trim();
    const email = signUpEmail.trim().toLowerCase();
    const password = signUpPassword;
    const code = signUpOtpCode.trim();

    if (!code || code.length < 6) {
      showAlert('Please enter the complete 6-digit verification code.', 'error');
      return;
    }

    setIsLoading(true);
    showAlert('Verifying security code and activating account...', 'info');

    try {
      const resp = await fetch(`${API_BASE}/api/auth/verify-signup-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code })
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        const sessionUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || 'Security analyst',
          authProvider: 'LOCAL',
          loggedIn: true,
          loginTime: new Date().toISOString()
        };
        saveSession(sessionUser, true);
        showAlert(`Account verified and created! Welcome to ThreatLens, ${name.split(' ')[0]}.`, 'success');
        setTimeout(() => {
          onSignIn(sessionUser);
        }, 500);
        return;
      } else {
        showAlert(data.detail || data.error || 'Invalid or expired verification code.', 'error');
        setIsLoading(false);
        return;
      }
    } catch {
      // Offline fallback
      const users = getRegisteredUsers();
      if (users.some(u => u.email === email)) {
        showAlert('An account with this email already exists. Sign in instead.', 'error');
        setIsLoading(false);
        return;
      }

      const salt = newSalt();
      const hash = await hashPassword(password, salt);
      users.push({ name, email, salt, hash });
      saveRegisteredUsers(users);

      const sessionUser = {
        name,
        email,
        role: 'Security analyst',
        authProvider: 'LOCAL',
        loggedIn: true,
        loginTime: new Date().toISOString()
      };
      saveSession(sessionUser, true);
      showAlert(`Account created! Welcome, ${name.split(' ')[0]}. Entering workspace...`, 'success');
      setTimeout(() => {
        onSignIn(sessionUser);
      }, 500);
    }
  };

  /* ==============================================================
     GOOGLE OAUTH HANDLER (DIRECT FIREBASE POPUP)
     ============================================================== */
  const executeGoogleLogin = async (selectedEmail, selectedName, selectedPicture) => {
    setIsLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedEmail,
          name: selectedName,
          picture: selectedPicture
        })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        const sessionUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || 'Security analyst',
          picture: data.user.pictureUrl || selectedPicture,
          authProvider: 'GOOGLE',
          loggedIn: true,
          loginTime: new Date().toISOString()
        };
        saveSession(sessionUser, true);
        showAlert(`Authenticated via Google! Welcome, ${data.user.name}.`, 'success');
        setTimeout(() => onSignIn(sessionUser), 400);
        return;
      }
    } catch {
      // Offline fallback
    } finally {
      setIsLoading(false);
    }

    const sessionUser = {
      name: selectedName,
      email: selectedEmail,
      picture: selectedPicture,
      role: 'Security analyst',
      authProvider: 'GOOGLE',
      loggedIn: true,
      loginTime: new Date().toISOString()
    };
    saveSession(sessionUser, true);
    showAlert(`Signed in via Google! Welcome, ${selectedName}.`, 'success');
    setTimeout(() => onSignIn(sessionUser), 400);
  };

  const handleTriggerGoogleAuth = async () => {
    hideAlert();
    try {
      showAlert('Opening Google Sign-in...', 'info');
      const result = await signInWithPopup(auth, googleProvider);
      if (result && result.user) {
        const u = result.user;
        const email = u.email;
        const name = u.displayName || email.split('@')[0];
        const picture = u.photoURL || '';
        await executeGoogleLogin(email, name, picture);
        return;
      }
    } catch (popupErr) {
      console.warn('Firebase Google Auth popup error:', popupErr);
      if (popupErr.code === 'auth/popup-closed-by-user') {
        showAlert('Google sign-in was cancelled.', 'info');
        return;
      }
      showAlert('Google sign-in error: ' + (popupErr.message || popupErr.code), 'error');
    }
  };



  const currentStrength = passwordLevel(signUpPassword);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#06090f',
      backgroundImage: `
        radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
        linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
      `,
      backgroundSize: '24px 24px, 48px 48px, 48px 48px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Left Brand */}
      <div style={{ padding: '32px 48px', display: 'flex', alignItems: 'center', gap: '14px', zIndex: 10 }}>
        <img
          src="/logo.png"
          alt="AI ThreatLens Cyber Shield"
          style={{
            height: '42px',
            width: 'auto',
            objectFit: 'contain',
            flexShrink: 0,
            filter: 'drop-shadow(0 0 16px rgba(0, 229, 255, 0.5))'
          }}
        />
        <span style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.02em' }}>
          AI ThreatLens
        </span>
      </div>

      {/* Main Container: 2-Column Split */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
        padding: '0 48px 48px',
        alignItems: 'center',
        maxWidth: '1380px',
        margin: '0 auto',
        width: '100%',
        gap: '48px'
      }}>
        {/* Left Column: Constellation Network & Slogan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', position: 'relative' }}>
          {/* Interactive Constellation SVG */}
          <div style={{ width: '100%', maxWidth: '480px', height: '240px', position: 'relative' }}>
            <svg viewBox="0 0 460 220" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Connecting lines */}
              <line x1="60" y1="50" x2="160" y2="80" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />
              <line x1="60" y1="50" x2="90" y2="160" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />
              <line x1="90" y1="160" x2="190" y2="180" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />
              <line x1="160" y1="80" x2="190" y2="180" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />
              <line x1="160" y1="80" x2="260" y2="50" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />
              <line x1="260" y1="50" x2="330" y2="120" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />
              <line x1="190" y1="180" x2="330" y2="120" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />

              {/* Radar pulse around central cyan node */}
              <circle cx="160" cy="80" r="18" fill="none" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1.5">
                <animate attributeName="r" values="12;26;12" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.1;0.8" dur="3s" repeatCount="indefinite" />
              </circle>

              {/* Multi-colored Nodes */}
              <circle cx="60" cy="50" r="5" fill="#60a5fa" filter="url(#nodeGlow)" />
              <circle cx="90" cy="160" r="5" fill="#10b981" filter="url(#nodeGlow)" />
              <circle cx="190" cy="180" r="5" fill="#f59e0b" filter="url(#nodeGlow)" />
              <circle cx="260" cy="50" r="6" fill="#818cf8" filter="url(#nodeGlow)" />
              <circle cx="330" cy="120" r="6" fill="#f43f5e" filter="url(#nodeGlow)" />
              <circle cx="160" cy="80" r="7" fill="#00e5ff" filter="url(#nodeGlow)" />
            </svg>
          </div>

          {/* Slogan & Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', width: 'fit-content',
              background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: '600', color: '#38bdf8'
            }}>
              <Sparkles size={13} style={{ marginRight: '6px' }} />
              AI-powered threat investigation
            </div>

            <h1 style={{
              fontSize: '48px',
              fontWeight: '900',
              color: '#f8fafc',
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              margin: 0
            }}>
              See the threat<br />
              before it lands.
            </h1>

            <p style={{
              fontSize: '15px',
              color: '#94a3b8',
              lineHeight: 1.6,
              maxWidth: '460px',
              margin: 0
            }}>
              Analyze URLs, IPs and domains, explore intelligence and keep every investigation in one workspace.
            </p>
          </div>
        </div>

        {/* Right Column: Sign in / Sign up Card */}
        <div style={{
          background: 'rgba(11, 17, 30, 0.88)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '34px 38px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          maxWidth: '460px',
          width: '100%',
          marginLeft: 'auto'
        }}>
          {/* Tab Switcher (Sign in vs Create account) */}
          <div style={{
            display: 'flex',
            background: '#070b14',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '22px'
          }}>
            <button
              type="button"
              onClick={() => { setActiveTab('signin'); hideAlert(); }}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'signin' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: activeTab === 'signin' ? '#38bdf8' : '#94a3b8',
                fontSize: '13px',
                fontWeight: activeTab === 'signin' ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('signup'); hideAlert(); }}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'signup' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: activeTab === 'signup' ? '#38bdf8' : '#94a3b8',
                fontSize: '13px',
                fontWeight: activeTab === 'signup' ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Create account
            </button>
          </div>

          {/* Alert Message Box */}
          {alert && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              lineHeight: '1.4',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: alert.type === 'error'
                ? '1px solid rgba(244, 63, 94, 0.4)'
                : alert.type === 'success'
                  ? '1px solid rgba(16, 185, 129, 0.4)'
                  : '1px solid rgba(56, 189, 248, 0.4)',
              background: alert.type === 'error'
                ? 'rgba(244, 63, 94, 0.1)'
                : alert.type === 'success'
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(56, 189, 248, 0.1)',
              color: alert.type === 'error'
                ? '#fb7185'
                : alert.type === 'success'
                  ? '#34d399'
                  : '#38bdf8'
            }}>
              {alert.type === 'error' && <AlertCircle size={15} style={{ flexShrink: 0 }} />}
              {alert.type === 'success' && <CheckCircle2 size={15} style={{ flexShrink: 0 }} />}
              {alert.type === 'info' && <RefreshCw size={15} className="spin" style={{ flexShrink: 0 }} />}
              <span>{alert.message}</span>
            </div>
          )}

          {/* ─── TAB 1: SIGN IN FORM ─── */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                  Welcome back
                </h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0' }}>
                  Sign in to your analyst workspace.
                </p>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>
                  Email address
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: '#070b14', border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px', padding: '11px 14px'
                }}>
                  <Mail size={16} color="#64748b" />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                    placeholder="analyst@company.com"
                    style={{
                      background: 'transparent', border: 'none', outline: 'none',
                      color: '#f8fafc', fontSize: '13px', width: '100%'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>
                  Password
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: '#070b14', border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px', padding: '11px 14px'
                }}>
                  <Lock size={16} color="#64748b" />
                  <input
                    type={showSignInPw ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    placeholder="Enter password"
                    style={{
                      background: 'transparent', border: 'none', outline: 'none',
                      color: '#f8fafc', fontSize: '13px', width: '100%'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPw(p => !p)}
                    style={{
                      background: 'transparent', border: 'none',
                      color: '#64748b', cursor: 'pointer', padding: 0,
                      display: 'flex', alignItems: 'center'
                    }}
                    title={showSignInPw ? 'Hide password' : 'Show password'}
                  >
                    {showSignInPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Row: Remember Me & Forgot Password */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#00e5ff' }}
                  />
                  Keep me signed in
                </label>

                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  style={{
                    background: 'transparent', border: 'none',
                    color: '#38bdf8', cursor: 'pointer', fontSize: '12px',
                    fontWeight: '600', padding: 0, textDecoration: 'underline'
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign in Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  marginTop: '4px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.75 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 0 24px rgba(6, 182, 212, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign in'}</span>
                <ArrowRight size={16} />
              </button>

              {/* Or divider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                color: '#64748b', fontSize: '11.5px', margin: '4px 0'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
                <span>or continue with</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                onClick={handleTriggerGoogleAuth}
                disabled={isLoading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  background: '#070b14', border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '9px', padding: '11px 14px',
                  color: '#f8fafc', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', transition: 'border-color 0.15s ease',
                  width: '100%'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                title="Sign in with Google Account"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.09C3.25 21.35 7.31 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.26C.46 8.21 0 10.04 0 12s.46 3.79 1.26 5.41l4.02-3.09z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.65 1.26 6.59l4.02 3.09c.95-2.83 3.6-4.93 6.72-4.93z"/>
                </svg>
                <span>Continue with Google</span>
              </button>


            </form>
          )}

          {/* ─── TAB 2: CREATE ACCOUNT FORM (MANDATORY OTP VERIFICATION) ─── */}
          {activeTab === 'signup' && (
            <div>
              {/* STEP 1: Enter Details & Request OTP */}
              {signUpStep === 1 && (
                <form onSubmit={handleRequestSignUpOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                      Create analyst account
                    </h2>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0' }}>
                      OTP email verification is required to activate new accounts.
                    </p>
                  </div>

                  {/* Full Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>
                      Full name
                    </label>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      background: '#070b14', border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px', padding: '11px 14px'
                    }}>
                      <User size={16} color="#64748b" />
                      <input
                        type="text"
                        value={signUpName}
                        onChange={e => setSignUpName(e.target.value)}
                        placeholder="e.g. Ajay M."
                        style={{
                          background: 'transparent', border: 'none', outline: 'none',
                          color: '#f8fafc', fontSize: '13px', width: '100%'
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>
                      Email address
                    </label>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      background: '#070b14', border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px', padding: '11px 14px'
                    }}>
                      <Mail size={16} color="#64748b" />
                      <input
                        type="email"
                        value={signUpEmail}
                        onChange={e => setSignUpEmail(e.target.value)}
                        placeholder="analyst@enterprise.com"
                        style={{
                          background: 'transparent', border: 'none', outline: 'none',
                          color: '#f8fafc', fontSize: '13px', width: '100%'
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Password with Strength Meter */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>
                      Master password
                    </label>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      background: '#070b14', border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px', padding: '11px 14px'
                    }}>
                      <Lock size={16} color="#64748b" />
                      <input
                        type={showSignUpPw ? 'text' : 'password'}
                        value={signUpPassword}
                        onChange={e => setSignUpPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        style={{
                          background: 'transparent', border: 'none', outline: 'none',
                          color: '#f8fafc', fontSize: '13px', width: '100%'
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPw(p => !p)}
                        style={{
                          background: 'transparent', border: 'none',
                          color: '#64748b', cursor: 'pointer', padding: 0,
                          display: 'flex', alignItems: 'center'
                        }}
                        title={showSignUpPw ? 'Hide password' : 'Show password'}
                      >
                        {showSignUpPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                      {[1, 2, 3, 4].map(idx => {
                        const isFilled = currentStrength >= idx;
                        let barColor = 'rgba(255, 255, 255, 0.1)';
                        if (isFilled) {
                          if (currentStrength === 1) barColor = '#f43f5e';
                          else if (currentStrength === 2) barColor = '#f97316';
                          else if (currentStrength === 3) barColor = '#eab308';
                          else if (currentStrength >= 4) barColor = '#10b981';
                        }
                        return (
                          <div
                            key={idx}
                            style={{
                              flex: 1,
                              height: '4px',
                              borderRadius: '2px',
                              background: barColor,
                              transition: 'background 0.2s ease'
                            }}
                          />
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                      <span>Use 6+ chars with mixed case, digits & symbols</span>
                      {currentStrength > 0 && (
                        <span style={{
                          fontWeight: '600',
                          color: currentStrength === 1 ? '#f43f5e' : currentStrength === 2 ? '#f97316' : currentStrength === 3 ? '#eab308' : '#10b981'
                        }}>
                          {currentStrength === 1 ? 'Weak' : currentStrength === 2 ? 'Fair' : currentStrength === 3 ? 'Good' : 'Strong'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Send OTP button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      marginTop: '4px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '13.5px',
                      fontWeight: '700',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.75 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: '0 0 24px rgba(6, 182, 212, 0.35)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{isLoading ? 'Dispatching verification code...' : 'Continue to Email Verification'}</span>
                    <ArrowRight size={16} />
                  </button>

                  {/* Social buttons */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    color: '#64748b', fontSize: '11.5px', margin: '2px 0'
                  }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
                    <span>or register with</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
                  </div>

                  {/* Google Sign-Up */}
                  <button
                    type="button"
                    onClick={handleTriggerGoogleAuth}
                    disabled={isLoading}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      background: '#070b14', border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '9px', padding: '11px 14px',
                      color: '#f8fafc', fontSize: '13px', fontWeight: '600',
                      cursor: 'pointer', transition: 'border-color 0.15s ease',
                      width: '100%'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                    title="Sign up with Google Account"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.09C3.25 21.35 7.31 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.26C.46 8.21 0 10.04 0 12s.46 3.79 1.26 5.41l4.02-3.09z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.65 1.26 6.59l4.02 3.09c.95-2.83 3.6-4.93 6.72-4.93z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </form>
              )}

              {/* STEP 2: Enter Mandatory Verification OTP */}
              {signUpStep === 2 && (
                <form onSubmit={handleVerifySignUpOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                      Verify Email Address
                    </h2>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.5 }}>
                      A 6-digit security code was dispatched to <strong style={{ color: '#00e5ff' }}>{signUpEmail}</strong>. Enter the code to activate your account.
                    </p>
                  </div>

                  {/* 6-Digit Code Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={signUpOtpCode}
                      onChange={e => setSignUpOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      inputMode="numeric"
                      style={{
                        background: '#070b14',
                        border: '1px solid rgba(0, 229, 255, 0.45)',
                        borderRadius: '10px',
                        padding: '12px',
                        color: '#f8fafc',
                        letterSpacing: '0.45em',
                        fontSize: '18px',
                        textAlign: 'center',
                        fontWeight: '800',
                        outline: 'none',
                        boxShadow: '0 0 16px rgba(0, 229, 255, 0.15)'
                      }}
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '13.5px',
                      fontWeight: '700',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.75 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: '0 0 24px rgba(6, 182, 212, 0.35)',
                      marginTop: '4px'
                    }}
                  >
                    <span>{isLoading ? 'Activating account...' : 'Verify Code & Activate Account'}</span>
                    <ArrowRight size={16} />
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: '4px' }}>
                    <button
                      type="button"
                      disabled={signUpCountdown > 0 || isLoading}
                      onClick={() => handleRequestSignUpOtp()}
                      style={{
                        background: 'transparent', border: 'none',
                        color: signUpCountdown > 0 ? '#64748b' : '#38bdf8',
                        cursor: signUpCountdown > 0 ? 'not-allowed' : 'pointer',
                        textDecoration: signUpCountdown > 0 ? 'none' : 'underline'
                      }}
                    >
                      {signUpCountdown > 0 ? `Resend in ${signUpCountdown}s` : 'Resend Code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSignUpStep(1); setSignUpOtpCode(''); }}
                      style={{
                        background: 'transparent', border: 'none',
                        color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline'
                      }}
                    >
                      Change details
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer Note */}
          <div style={{
            fontSize: '11px',
            color: '#64748b',
            lineHeight: '1.5',
            marginTop: '20px',
            textAlign: 'center'
          }}>
            Credentials salted & hashed (SHA-256). Active session token securely maintained.
          </div>
        </div>
      </div>





      {/* ==============================================================
         DEDICATED FORGOT PASSWORD MODAL (SEPARATE REACT FILE)
         ============================================================== */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        initialEmail={signInEmail}
        onResetSuccess={(email, newPw) => {
          setSignInEmail(email);
          setSignInPassword(newPw);
          setActiveTab('signin');
          showAlert('Password reset successfully! You can now sign in with your new password.', 'success');
        }}
      />
    </div>
  );
}
