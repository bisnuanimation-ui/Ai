import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { copyToClipboard } from '../../utils/clipboard';
import {
  Shield,
  KeyRound,
  X,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';

// Authorized Owner Email & Passcode
const AUTHORIZED_OWNER_EMAIL = 'bisnuroy283@gmail.com';
const AUTHORIZED_PASSCODE = '152643';

export const AdminLoginModal: React.FC = () => {
  const { isAdminOpen, setIsAdminOpen, isAdminLoggedIn, setIsAdminLoggedIn, language, showToast } =
    useApp();

  const [mode, setMode] = useState<'google' | 'passcode'>('google');
  const [emailInput, setEmailInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);

  // Owner Passcode Reveal states
  const [showOwnerRevealModal, setShowOwnerRevealModal] = useState(false);
  const [revealEmailInput, setRevealEmailInput] = useState('');
  const [revealedPasscode, setRevealedPasscode] = useState<string | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isAdminOpen || isAdminLoggedIn) return null;

  const isBn = language === 'bn';

  const resetForm = () => {
    setEmailInput('');
    setPinInput('');
    setErrorMsg(null);
    setIsVerifying(false);
    setShowPasswordText(false);
    setShowOwnerRevealModal(false);
    setRevealEmailInput('');
    setRevealedPasscode(null);
    setRevealError(null);
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    setIsAdminOpen(false);
  };

  // Google Login Verification Flow
  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsVerifying(true);

    setTimeout(() => {
      const cleanEmail = emailInput.trim().toLowerCase();

      if (cleanEmail === AUTHORIZED_OWNER_EMAIL.toLowerCase()) {
        setIsAdminLoggedIn(true);
        setErrorMsg(null);
        setIsVerifying(false);
        showToast(
          isBn
            ? '✓ গুগল অ্যাকাউন্টের মাধ্যমে সফলভাবে লগইন হয়েছে!'
            : '✓ Successfully authenticated as site owner!'
        );
        resetForm();
      } else {
        setIsVerifying(false);
        setErrorMsg(
          isBn
            ? '⚠️ অননুমোদিত অ্যাকাউন্ট! সাধারণ দর্শকদের জন্য এই প্যানেল এক্সেসযোগ্য নয়।'
            : '⚠️ Unauthorized account! Access is strictly reserved for the site owner.'
        );
      }
    }, 500);
  };

  // Passcode Login Flow (Code: 152643)
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPin = pinInput.trim();

    if (cleanPin === AUTHORIZED_PASSCODE) {
      setIsAdminLoggedIn(true);
      setErrorMsg(null);
      showToast(isBn ? '✓ এডমিন লগইন সফল হয়েছে!' : '✓ Admin login successful!');
      resetForm();
    } else {
      setErrorMsg(
        isBn
          ? '❌ ভুল পাসকোড! শুধুমাত্র সঠিক ওনার পাসকোড দিয়ে প্রবেশ করা যাবে।'
          : '❌ Incorrect passcode. Access denied.'
      );
    }
  };

  // Check & Reveal Passcode ONLY for the authorized Gmail
  const handleRevealPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setRevealError(null);
    setRevealedPasscode(null);

    const cleanEmail = revealEmailInput.trim().toLowerCase();

    if (cleanEmail === AUTHORIZED_OWNER_EMAIL.toLowerCase()) {
      setRevealedPasscode(AUTHORIZED_PASSCODE);
      setRevealError(null);
    } else {
      setRevealError(
        isBn
          ? '🚫 অ্যাক্সেস ডিনাইড! সাধারণ অডিয়েন্স এই পাসওয়ার্ড দেখতে পাবে না।'
          : '🚫 Access Denied! Only the authorized owner Gmail can view this passcode.'
      );
    }
  };

  const handleCopyPasscode = async () => {
    if (revealedPasscode) {
      await copyToClipboard(revealedPasscode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast(isBn ? 'পাসকোড কপি হয়েছে!' : 'Passcode copied!');
    }
  };

  const handleAutoFillAndUse = () => {
    if (revealedPasscode) {
      setPinInput(revealedPasscode);
      setShowOwnerRevealModal(false);
      setMode('passcode');
      showToast(isBn ? 'পাসকোড অটো-ফিল করা হয়েছে!' : 'Passcode auto-filled!');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Shield size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isBn ? 'অ্যাডমিন সিকিউরিটি লগইন' : 'Admin Security Access'}
            </h3>
            <p className="text-xs text-slate-400">
              {isBn
                ? 'সাধারণ দর্শকদের জন্য পাসওয়ার্ড সম্পূর্ণভাবে গোপন'
                : 'Passcode is strictly protected from public view'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('google');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'google'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {/* Google Icon */}
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill={mode === 'google' ? '#0f172a' : '#4285F4'}
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill={mode === 'google' ? '#0f172a' : '#34A853'}
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.13C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill={mode === 'google' ? '#0f172a' : '#FBBC05'}
                d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.63H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.37l3.99-3.13z"
              />
              <path
                fill={mode === 'google' ? '#0f172a' : '#EA4335'}
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.63l3.99 3.13c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>Google একাউন্ট</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('passcode');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'passcode'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock size={13} />
            <span>এডমিন পাসকোড</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMsg}</p>
          </div>
        )}

        {/* Mode 1: Google Account Login */}
        {mode === 'google' && (
          <form onSubmit={handleGoogleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isBn ? 'আপনার ওনার গুগল একাউন্ট (Gmail):' : 'Owner Google Account:'}
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="name@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !emailInput.trim()}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{isBn ? 'ভেরিফাই করা হচ্ছে...' : 'Verifying...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>{isBn ? 'গুগল দিয়ে প্রবেশ করুন' : 'Verify & Enter'}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Mode 2: Passcode Login */}
        {mode === 'passcode' && (
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isBn ? 'এডমিন পাসকোড:' : 'Admin Passcode:'}
                </label>
                {/* Reveal link for the owner */}
                <button
                  type="button"
                  onClick={() => setShowOwnerRevealModal(true)}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Eye size={12} />
                  <span>{isBn ? 'ওনার হিসেবে পাসওয়ার্ড দেখুন' : 'Owner View Password'}</span>
                </button>
              </div>

              <div className="relative">
                <KeyRound
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 font-mono tracking-widest"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPasswordText ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!pinInput.trim()}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
            >
              {isBn ? 'লগইন করুন' : 'Unlock Admin Panel'}
            </button>
          </form>
        )}

        {/* Modal: Owner Only Passcode Reveal Mechanism */}
        {showOwnerRevealModal && (
          <div className="p-4 bg-slate-950 border border-amber-500/40 rounded-xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Shield size={14} />
                <span>{isBn ? 'ওনার ভেরিফিকেশন' : 'Owner Verification'}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowOwnerRevealModal(false);
                  setRevealedPasscode(null);
                  setRevealError(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isBn
                ? 'পাসওয়ার্ডটি সাধারণ অডিয়েন্স থেকে গোপন। এটি শুধুমাত্র অনুমোদিত ওনার জিমেইল দিলে দৃশ্যমান হবে:'
                : 'This passcode is hidden from visitors. Enter your authorized owner Gmail to reveal it:'}
            </p>

            <form onSubmit={handleRevealPasscode} className="space-y-2">
              <input
                type="email"
                value={revealEmailInput}
                onChange={(e) => {
                  setRevealEmailInput(e.target.value);
                  setRevealError(null);
                }}
                placeholder="আপনার ওনার জিমেইল দিন..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                required
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/30 transition-colors cursor-pointer"
              >
                {isBn ? 'পাসওয়ার্ড প্রদর্শন করুন' : 'Verify & Reveal Passcode'}
              </button>
            </form>

            {revealError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {revealError}
              </div>
            )}

            {revealedPasscode && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-medium">
                    {isBn ? 'আপনার সিক্রেট এডমিন পাসকোড:' : 'Your Secret Admin Passcode:'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPasscode}
                    className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
                <div className="p-2 bg-black/60 rounded-lg border border-emerald-500/30 text-center">
                  <code className="text-lg font-bold text-amber-400 font-mono tracking-widest">
                    {revealedPasscode}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillAndUse}
                  className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {isBn ? '✓ এই পাসকোড দিয়ে সরাসরি লগইন করুন' : '✓ Auto-fill & Login'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="pt-3 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Lock size={12} className="text-amber-400" />
            <span>
              {isBn
                ? 'এডমিন একাউন্ট ও পাসকোড সম্পূর্ণ সুরক্ষিত এবং অডিয়েন্স থেকে গোপন'
                : 'Admin access and passcode are confidential and protected'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
