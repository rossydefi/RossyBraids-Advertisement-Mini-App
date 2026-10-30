import React, { useState } from 'react';
import { adminRequest, errorMessage, setAdminToken } from './adminApi';
import { btn, cx, Field, inputClass } from './ui';

export const Login: React.FC<{ onSignedIn: () => void; notice?: string }> = ({ onSignedIn, notice }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token } = await adminRequest<{ token: string }>('POST', '/login', { password });
      setAdminToken(token);
      onSignedIn();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-16 w-full max-w-sm space-y-4 rounded-xl border border-[#D4AF37]/30 bg-[#1E110A] p-6">
      <h1 className="font-cinzel text-xl font-bold tracking-wider text-[#F5E6A3]">Owner sign-in</h1>
      {notice && <p className="text-xs text-amber-300">{notice}</p>}
      <Field label="Admin password">
        {(id) => (
          <input id={id} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        )}
      </Field>
      <div aria-live="polite" role="alert" className="min-h-4 text-xs font-semibold text-red-300">
        {error}
      </div>
      <button type="submit" disabled={busy || !password} className={cx(btn.base, btn.gold, 'w-full py-2.5 text-sm')}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
};
