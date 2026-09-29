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
    <main className="min-h-screen bg-[#f5f7fa] px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center justify-center sm:min-h-[calc(100vh-5rem)]">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_-28px_rgba(15,23,42,0.28)] lg:grid-cols-[0.9fr_1.1fr]">

          {/* Brand panel */}
          <section className="relative hidden min-h-[680px] overflow-hidden bg-[#0b1324] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full border border-blue-400/30" />
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-blue-400/20" />
              <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full border border-slate-400/10" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563eb] shadow-lg shadow-blue-950/30">
                  <span className="text-xl font-black text-white">A</span>
                </div>
                <span className="text-[25px] font-extrabold tracking-[-0.04em] text-white">accqudo</span>
              </div>

              <div className="mt-24 max-w-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300">
                  Assessment &amp; Examination Engine
                </p>
                <h1 className="mt-5 text-[42px] font-extrabold leading-[1.08] tracking-[-0.04em] text-white">
                  Your preparation.
                  <br />
                  Your performance.
                </h1>
              </div>
            </div>

            <div className="relative z-10">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111b30] p-5">
                <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    <span className="h-2 w-2 rounded-full bg-slate-600" />
                    <span className="h-2 w-2 rounded-full bg-slate-700" />
                  </div>
                  <span className="h-2 w-16 rounded-full bg-slate-700" />
                </div>

                <div className="space-y-3">
                  <div className="h-2.5 w-3/4 rounded-full bg-slate-600" />
                  <div className="h-2 w-1/2 rounded-full bg-slate-700" />

                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="h-14 rounded-xl border border-white/10 bg-[#182338]" />
                    <div className="h-14 rounded-xl border border-blue-500/30 bg-blue-500/10" />
                    <div className="h-14 rounded-xl border border-white/10 bg-[#182338]" />
                    <div className="h-14 rounded-xl border border-slate-600 bg-[#182338]" />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-700" />
                    <div className="h-1.5 w-14 rounded-full bg-blue-500" />
                  </div>
                </div>
              </div>

              <p className="mt-8 text-[11px] font-medium text-slate-500">accqudo</p>
            </div>
          </section>

          {/* Authentication panel */}
          <section className="flex min-h-[680px] items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
            <div className="w-full max-w-[410px]">

              {/* Mobile brand */}
              <div className="mb-9 text-center lg:hidden">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563eb]">
                  <span className="text-xl font-black text-white">A</span>
                </div>
                <span className="text-2xl font-extrabold tracking-[-0.04em] text-[#0b1324]">accqudo</span>
                <p className="mt-1 text-[11px] font-medium text-slate-500">Assessment &amp; Examination Engine</p>
              </div>

              {/* Header */}
              <div className="text-center">
                <span className="text-[29px] font-extrabold tracking-[-0.05em] text-[#0b1324]">accqudo</span>
                <p className="mt-1 text-xs font-medium text-slate-500">Assessment &amp; Examination Engine</p>
              </div>

              {/* Tab Selection */}
              <div className="mt-8 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setStep('form'); setMessage(null); }}
                  className={`rounded-lg py-2.5 text-xs font-bold transition-all ${
                    mode === 'login'
                      ? 'bg-white text-[#1d4ed8] shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setStep('form'); setMessage(null); }}
                  className={`rounded-lg py-2.5 text-xs font-bold transition-all ${
                    mode === 'register'
                      ? 'bg-white text-[#1d4ed8] shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Notification Banner */}
              {message && (
                <div
                  className={`mt-5 rounded-xl border px-4 py-3 text-xs font-medium ${
                    message.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* --- SIGN IN FORM --- */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="mt-7 space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@accqudo.internal"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setStep('form'); setMessage(null); }}
                        className="text-[11px] font-semibold text-[#2563eb] transition hover:text-[#1d4ed8] hover:underline"
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
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#1d4ed8] py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md shadow-blue-100 transition hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? 'Authenticating...' : 'Sign In to Portal'}
                  </button>
                </form>
              )}

              {/* --- REGISTRATION FORM (STEP 1) --- */}
              {mode === 'register' && step === 'form' && (
                <form onSubmit={handleRegisterSendOtp} className="mt-7 space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Candidate Full Name"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@accqudo.internal"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Set Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#1d4ed8] py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md shadow-blue-100 transition hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? 'Sending Code...' : 'Get Email OTP Code'}
                  </button>
                </form>
              )}

              {/* --- REGISTRATION / FORGOT OTP VERIFICATION (STEP 2) --- */}
              {step === 'otp' && (
                <form
                  onSubmit={mode === 'register' ? handleRegisterVerifyOtp : handleForgotVerifyOtp}
                  className="mt-7 space-y-5"
                >
                  <p className="text-center text-xs font-medium leading-5 text-slate-500">
                    Enter the 6-digit code dispatched to <b className="text-slate-900">{email}</b>
                  </p>

                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full rounded-xl border border-slate-200 bg-white py-4 text-center font-mono text-2xl font-bold tracking-[10px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-300 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50"
                  />

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full rounded-xl bg-[#047857] py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md shadow-emerald-100 transition hover:bg-[#065f46] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : mode === 'register' ? 'Verify & Create Account' : 'Verify Reset Code'}
                  </button>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                    <button
                      type="button"
                      onClick={() => setStep('form')}
                      className="font-semibold text-slate-500 transition hover:text-slate-900"
                    >
                      Change Email
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || resending}
                      className={`font-semibold transition ${
                        countdown > 0
                          ? 'cursor-not-allowed text-slate-300'
                          : 'text-[#2563eb] hover:text-[#1d4ed8] hover:underline'
                      }`}
                    >
                      {resending ? 'Sending...' : countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}

              {/* --- FORGOT PASSWORD (STEP 1) --- */}
              {mode === 'forgot' && step === 'form' && (
                <form onSubmit={handleForgotSendOtp} className="mt-7 space-y-5">
                  <p className="text-xs font-medium leading-5 text-slate-500">
                    Enter your email to receive a password reset verification code.
                  </p>
                  <div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@accqudo.internal"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#1d4ed8] py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md shadow-blue-100 transition hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </form>
              )}

              {/* --- FORGOT PASSWORD (STEP 3: NEW PASSWORD) --- */}
              {mode === 'forgot' && step === 'new_password' && (
                <form onSubmit={handleResetPasswordFinal} className="mt-7 space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Set New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#047857] py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md shadow-emerald-100 transition hover:bg-[#065f46] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Password & Return'}
                  </button>
                </form>
              )}

              {/* Social Authentication */}
              <div className="relative my-7">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <span className="bg-white px-3">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43-.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Google Firebase Account
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
