'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { forgotPassword } from '@/lib/api';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');
  const [forgotErrorMsg, setForgotErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your email address and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email address or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotErrorMsg('Please enter your email address.');
      return;
    }

    setForgotLoading(true);
    setForgotErrorMsg('');
    setForgotSuccessMsg('');

    try {
      const res = await forgotPassword(forgotEmail.trim());
      setForgotSuccessMsg(res.message || 'If an account with this email exists, a password reset link has been sent.');
    } catch (err: any) {
      setForgotErrorMsg(err.message || 'Failed to send password reset request.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4 selection:bg-[#145A32] selection:text-white">
      {/* Decorative Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-[#145A32]/10 rounded-full blur-3xl -top-40 -left-40 absolute" />
        <div className="w-[450px] h-[450px] bg-[#D4AF37]/10 rounded-full blur-3xl -bottom-32 -right-32 absolute" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-2xl overflow-hidden animate-fadeIn">
          {/* Header Banner */}
          <div className="bg-[#145A32] text-white p-6 sm:p-8 text-center relative">
            <div className="w-16 h-16 bg-white rounded-2xl p-2 mx-auto mb-3 shadow-lg flex items-center justify-center border border-white/20">
              <img
                src="/images/logo.png"
                alt="Jamia Usmania Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Building2 className="w-8 h-8 text-[#145A32] absolute fallback-icon" style={{ display: 'none' }} />
            </div>

            <span className="inline-block px-3 py-1 bg-[#FDF6E3] text-[#145A32] text-[11px] font-bold rounded-full font-serif mb-2 shadow-xs">
              جامعہ عثمانیہ ٹرسٹ کراچی
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-wide text-[#FDF6E3]">
              Jamia Usmania Trust
            </h1>
            <p className="text-xs text-[#FDF6E3]/80 mt-1 font-medium">
              Official Madrasa & Trust Management Platform
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 font-serif flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#145A32]" />
                <span>Account Login</span>
              </h2>
              <p className="text-xs text-gray-500">
                Sign in with your registered trust credentials to access your portal.
              </p>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Email Address (ای میل ایڈریس)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usmaniatrust@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Password (پاس ورڈ)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotSuccessMsg('');
                      setForgotErrorMsg('');
                    }}
                    className="text-xs font-semibold text-[#145A32] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#145A32] hover:bg-[#0E4124] text-[#FDF6E3] font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#FDF6E3] border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#145A32]" />
              <span>Role-Based Access Control (RBAC) Enabled</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} Jamia Usmania Trust. All rights reserved.
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-[#145A32] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#FDF6E3]" />
                <h3 className="font-bold text-sm sm:text-base font-serif">Reset Your Password</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                Enter your registered email address below. We will send a secure password reset link to your inbox (valid for 30 minutes).
              </p>

              {forgotSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{forgotSuccessMsg}</span>
                </div>
              )}

              {forgotErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{forgotErrorMsg}</span>
                </div>
              )}

              {!forgotSuccessMsg && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. user@jamiausmania.edu.pk"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="px-5 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {forgotLoading ? 'Sending link...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}

              {forgotSuccessMsg && (
                <div className="pt-2 text-right">
                  <button
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 bg-[#145A32] text-white text-xs font-bold rounded-lg hover:bg-[#0E4124]"
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
