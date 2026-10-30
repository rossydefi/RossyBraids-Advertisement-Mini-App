import React, { useState } from 'react';
import { LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { api, ApiError } from '../api/client';
import { useSite } from '../api/SiteProvider';

/** Phone + SMS code sign-in so a client's history follows them across devices. */
export const ClientSignIn: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { sessionPhone, signIn, signOut } = useSite();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');

  if (sessionPhone) {
    return (
      <div className={`flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-sans-modern text-emerald-900 ${className}`}>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          Signed in as +{sessionPhone}. Your appointments from any device are shown below.
        </span>
        <button type="button" onClick={signOut} className="flex items-center gap-1 font-semibold hover:underline cursor-pointer">
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" /> Sign out
        </button>
      </div>
    );
  }

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const requestCode = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const res = await api.requestOtp(phone);
      setDevCode(res.devCode ?? '');
      setStep('code');
    });
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const res = await api.verifyOtp(phone, code.trim());
      signIn(res.token, res.phone);
    });
  };

  const inputClass =
    'flex-1 min-w-[10rem] px-3 py-2 rounded-lg border border-[#DFCEBC] bg-white text-[#2D1B11] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]';
  const buttonClass =
    'px-4 py-2 rounded-lg bg-[#2D1B11] text-[#F9E498] text-xs font-bold hover:bg-[#3D2517] disabled:opacity-60 cursor-pointer flex items-center gap-1.5';

  return (
    <div className={`p-4 rounded-xl bg-white/95 border border-[#DFCEBC] space-y-2 text-xs font-sans-modern text-[#6C4A32] ${className}`}>
      <p className="font-semibold text-[#2D1B11] flex items-center gap-1.5">
        <LogIn className="w-4 h-4 text-[#D4AF37]" aria-hidden="true" />
        Sign in to see your appointments on any device
      </p>
      {step === 'phone' ? (
        <form onSubmit={requestCode} className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="signin-phone">Phone number</label>
          <input id="signin-phone" type="tel" inputMode="tel" autoComplete="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number you booked with" className={inputClass} />
          <button type="submit" disabled={busy} className={buttonClass}>{busy ? 'Sending…' : 'Send code'}</button>
        </form>
      ) : (
        <form onSubmit={verify} className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="signin-code">6-digit code</label>
          <input id="signin-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" className={inputClass} />
          <button type="submit" disabled={busy} className={buttonClass}>{busy ? 'Checking…' : 'Verify'}</button>
          <button type="button" onClick={() => { setStep('phone'); setCode(''); }} className="px-2 text-xs underline cursor-pointer">Change number</button>
          {devCode && <p className="w-full text-[11px]">Development mode: no SMS provider is configured, your code is <strong>{devCode}</strong>.</p>}
        </form>
      )}
      <p aria-live="polite" className="text-red-700 min-h-[1em]">{error}</p>
    </div>
  );
};
