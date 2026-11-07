import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  initialEmail = '',
  onResetSuccess
}) {
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP and new password
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'error' | 'success' | 'info', message: '' }
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || '');
      setStep(1);
      setOtpCode('');
      setNewPassword('');
      setAlert(null);
      setCountdown(0);
    }
  }, [isOpen, initialEmail]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setAlert(null);
    const targetEmail = email.trim().toLowerCase();

    if (!targetEmail || !EMAIL_RE.test(targetEmail)) {
      setAlert({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setIsLoading(true);
    setAlert({ type: 'info', message: 'Dispatching 6-digit verification code...' });

    try {
      const resp = await fetch(`${API_BASE}/api/auth/forgot-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        setStep(2);
        setCountdown(60);
        setAlert({
          type: 'success',
          message: data.message || `6-digit OTP sent to ${targetEmail}. Please check your inbox.`
        });
      } else {
        setAlert({
          type: 'error',
          message: data.detail || data.error || 'Failed to send OTP code. Please retry.'
        });
      }
    } catch {
      setAlert({
        type: 'error',
        message: 'Could not connect to authentication service. Please check your network.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault();
    setAlert(null);
    const targetEmail = email.trim().toLowerCase();
    const cleanOtp = otpCode.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      setAlert({ type: 'error', message: 'Please enter the complete 6-digit OTP code.' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setAlert({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }

    setIsLoading(true);
    setAlert({ type: 'info', message: 'Validating code and updating master credentials...' });

    try {
      const resp = await fetch(`${API_BASE}/api/auth/reset-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          otp: cleanOtp,
          newPassword: newPassword
        })
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        setAlert({
          type: 'success',
          message: 'Password successfully updated! Redirecting to sign in...'
        });
        setTimeout(() => {
          if (onResetSuccess) {
            onResetSuccess(targetEmail, newPassword);
          }
          onClose();
        }, 1200);
      } else {
        setAlert({
          type: 'error',
          message: data.detail || data.error || 'Invalid or expired OTP code. Please retry.'
        });
        setIsLoading(false);
      }
    } catch {
      setAlert({
        type: 'error',
        message: 'Could not communicate with authentication server.'
      });
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(11, 17, 30, 0.96)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '18px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85)',
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#070b14'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <KeyRound size={17} color="#00e5ff" />
            </div>
            <div>
              <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#f8fafc', lineHeight: 1.1 }}>
                Reset Master Password
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Secure OTP Identity Verification
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '6px'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Status Alert Banner */}
          {alert && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              lineHeight: '1.4',
              marginBottom: '16px',
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
              color: alert.type === 'error' ? '#fb7185' : alert.type === 'success' ? '#34d399' : '#38bdf8'
            }}>
              {alert.type === 'error' && <AlertCircle size={15} style={{ flexShrink: 0 }} />}
              {alert.type === 'success' && <CheckCircle2 size={15} style={{ flexShrink: 0 }} />}
              {alert.type === 'info' && <RefreshCw size={15} className="spin" style={{ flexShrink: 0 }} />}
              <span>{alert.message}</span>
            </div>
          )}

          {/* STEP 1: Enter Registered Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>
                Enter your registered analyst email address. A 6-digit one-time verification code (OTP) will be sent to confirm your identity.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>
                  Registered Email Address
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: '#070b14', border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px', padding: '11px 14px'
                }}>
                  <Mail size={16} color="#64748b" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="analyst@enterprise.com"
                    style={{
                      background: 'transparent', border: 'none', outline: 'none',
                      color: '#f8fafc', fontSize: '13px', width: '100%'
                    }}
                    required
                    autoFocus
                  />
                </div>
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
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px'
                }}
              >
                <span>{isLoading ? 'Dispatching OTP...' : 'Send 6-Digit OTP'}</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* STEP 2: Enter 6-Digit OTP & New Master Password */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtpAndReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>
                Enter the 6-digit OTP code sent to <strong style={{ color: '#00e5ff' }}>{email}</strong> and set your new password.
              </p>

              {/* 6-Digit Code Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
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

              {/* New Password Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>
                  New Master Password
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: '#070b14', border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px', padding: '11px 14px'
                }}>
                  <Lock size={16} color="#64748b" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    style={{
                      background: 'transparent', border: 'none', outline: 'none',
                      color: '#f8fafc', fontSize: '13px', width: '100%'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{
                      background: 'transparent', border: 'none',
                      color: '#64748b', cursor: 'pointer', padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.35)',
                  marginTop: '4px'
                }}
              >
                {isLoading ? 'Verifying & Resetting...' : 'Verify OTP & Save Password'}
              </button>

              {/* Auxiliary Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: '2px' }}>
                <button
                  type="button"
                  disabled={countdown > 0 || isLoading}
                  onClick={() => handleSendOtp()}
                  style={{
                    background: 'transparent', border: 'none',
                    color: countdown > 0 ? '#64748b' : '#38bdf8',
                    cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                    textDecoration: countdown > 0 ? 'none' : 'underline'
                  }}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtpCode(''); }}
                  style={{
                    background: 'transparent', border: 'none',
                    color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline'
                  }}
                >
                  Change email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
