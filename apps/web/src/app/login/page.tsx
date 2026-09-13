'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogleToken } from '@/lib/firebase';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.accqudo.com/api/v1';

export default function AuthPage() {
  const router = useRouter();

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    const token = localStorage.getItem('accqudo_token');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  // 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [step, setStep] = useState<'form' | 'otp' | 'new_password'>('form');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 30-second Resend countdown
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const saveTokenAndRedirect = (data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accqudo_token', data.access_token);
      if (data.user) {
        localStorage.setItem('accqudo_user', JSON.stringify(data.user));
      }
    }
    window.location.href = '/dashboard';
  };

  // 1. Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed.');
      saveTokenAndRedirect(data);
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 2. Register: Step 1 Send OTP
  const handleRegisterSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/register/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send OTP.');
      setMessage({ text: 'Verification code dispatched to your email!', type: 'success' });
      setStep('otp');
      setCountdown(30);
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 3. Register: Step 2 Verify OTP
  const handleRegisterVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/register/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Verification failed.');
      saveTokenAndRedirect(data);
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 4. Resend OTP Handler
  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          purpose: mode === 'register' ? 'registration' : 'reset',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to resend code.');
      setMessage({ text: 'A fresh verification code has been dispatched!', type: 'success' });
      setCountdown(30);
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setResending(false);
    }
  };

  // 5. Forgot Password: Step 1 Send OTP
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send reset code.');
      setMessage({ text: 'Reset code dispatched to your email!', type: 'success' });
      setStep('otp');
      setCountdown(30);
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 6. Forgot Password: Step 2 Verify OTP
  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Code invalid or expired.');
      setMessage({ text: 'Code verified! Enter your new password.', type: 'success' });
      setStep('new_password');
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 7. Forgot Password: Step 3 Commit New Password
  const handleResetPasswordFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Reset failed.');
      setMessage({ text: 'Password reset successfully! Please sign in.', type: 'success' });
      setMode('login');
      setStep('form');
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 8. Google Sign-In
  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const idToken = await signInWithGoogleToken();
      const res = await fetch(`${API_BASE}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Google sign-in failed.');
      saveTokenAndRedirect(data);
    } catch (err: any) {
      setMessage({ text: err.message || 'Google Auth Error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center">
          <span className="text-2xl font-black tracking-tight text-white">accqudo</span>
          <p className="mt-1 text-xs text-slate-400">Assessment &amp; Examination Engine</p>
        </div>

        {/* Tab Selection */}
        <div className="mt-6 flex rounded-xl bg-slate-950 p-1 text-xs font-semibold text-slate-400">
          <button
            type="button"
            onClick={() => { setMode('login'); setStep('form'); setMessage(null); }}
            className={`flex-1 rounded-lg py-2 transition ${mode === 'login' ? 'bg-indigo-600 text-white shadow' : 'hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setStep('form'); setMessage(null); }}
            className={`flex-1 rounded-lg py-2 transition ${mode === 'register' ? 'bg-indigo-600 text-white shadow' : 'hover:text-white'}`}
          >
            Register
          </button>
        </div>

        {/* Notification Banner */}
        {message && (
          <div className={`mt-4 rounded-lg p-3 text-xs ${message.type === 'success' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border border-rose-800 text-rose-300'}`}>
            {message.text}
          </div>
        )}

        {/* --- SIGN IN FORM --- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@accqudo.internal"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setStep('form'); setMessage(null); }}
                  className="text-[11px] text-indigo-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 disabled:opacity-50 transition"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>
        )}

        {/* --- REGISTRATION FORM (STEP 1) --- */}
        {mode === 'register' && step === 'form' && (
          <form onSubmit={handleRegisterSendOtp} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Candidate Full Name"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@accqudo.internal"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300">Set Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 disabled:opacity-50 transition"
            >
              {loading ? 'Sending Code...' : 'Get Email OTP Code'}
            </button>
          </form>
        )}

        {/* --- REGISTRATION / FORGOT OTP VERIFICATION (STEP 2) --- */}
        {step === 'otp' && (
          <form
            onSubmit={mode === 'register' ? handleRegisterVerifyOtp : handleForgotVerifyOtp}
            className="mt-6 space-y-4"
          >
            <p className="text-xs text-slate-400 text-center">
              Enter the 6-digit code dispatched to <b className="text-white">{email}</b>
            </p>

            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full text-center tracking-[8px] font-mono text-xl rounded-lg border border-slate-800 bg-slate-950 py-3 text-white focus:border-indigo-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-500 disabled:opacity-50 transition"
            >
              {loading ? 'Verifying...' : mode === 'register' ? 'Verify & Create Account' : 'Verify Reset Code'}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-slate-400 hover:text-white"
              >
                Change Email
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || resending}
                className={`font-medium ${countdown > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-indigo-400 hover:underline'}`}
              >
                {resending ? 'Sending...' : countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* --- FORGOT PASSWORD (STEP 1) --- */}
        {mode === 'forgot' && step === 'form' && (
          <form onSubmit={handleForgotSendOtp} className="mt-6 space-y-4">
            <p className="text-xs text-slate-400">Enter your email to receive a password reset verification code.</p>
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@accqudo.internal"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 disabled:opacity-50 transition"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD (STEP 3: NEW PASSWORD) --- */}
        {mode === 'forgot' && step === 'new_password' && (
          <form onSubmit={handleResetPasswordFinal} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300">Set New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-500 disabled:opacity-50 transition"
            >
              {loading ? 'Updating...' : 'Update Password & Return'}
            </button>
          </form>
        )}

        {/* Social Authentication */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
          <div className="relative flex justify-center text-[10px] uppercase text-slate-500">
            <span className="bg-slate-900 px-2">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-950 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Google Firebase Account
        </button>
      </div>
    </div>
  );
}