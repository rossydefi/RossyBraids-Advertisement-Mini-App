import React, { useCallback, useState } from 'react';
import { errorMessage } from './adminApi';

export const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

/** Mirrors the server's Nigerian phone normalisation so wa.me links work. */
export function waDigits(phone: string): string {
  let d = phone.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (/^0\d{10}$/.test(d)) d = '234' + d.slice(1);
  return d;
}
export const waLink = (phone: string, text: string) => `https://wa.me/${waDigits(phone)}?text=${encodeURIComponent(text)}`;

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

export const btn = {
  base: 'inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-sans-modern font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]',
  gold: 'bg-[#D4AF37] text-[#2A1810] hover:bg-[#E5C158]',
  ghost: 'border border-[#D4AF37]/40 text-[#F5E6A3] hover:bg-[#D4AF37]/10',
  danger: 'border border-red-400/50 text-red-300 hover:bg-red-500/10',
  whatsapp: 'bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/25',
};
export const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

export const inputClass =
  'w-full rounded-lg bg-black/40 border border-[#D4AF37]/25 px-3 py-2 text-sm text-[#FAF6F0] placeholder:text-[#DFCEBC]/40 focus-visible:outline-2 focus-visible:outline-[#D4AF37]';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cx('rounded-xl bg-[#1E110A] border border-[#D4AF37]/20 p-4', className)}>{children}</div>
);

export const Field: React.FC<{ label: string; hint?: string; children: (id: string) => React.ReactNode }> = ({ label, hint, children }) => {
  const id = React.useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-semibold text-[#DFCEBC]">
        {label}
      </label>
      {children(id)}
      {hint && <p className="text-[11px] text-[#DFCEBC]/60">{hint}</p>}
    </div>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const color: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-300',
    confirmed: 'bg-sky-500/20 text-sky-300',
    completed: 'bg-emerald-500/20 text-emerald-300',
    paid: 'bg-emerald-500/20 text-emerald-300',
    shipped: 'bg-sky-500/20 text-sky-300',
    delivered: 'bg-emerald-500/20 text-emerald-300',
    approved: 'bg-emerald-500/20 text-emerald-300',
    cancelled: 'bg-red-500/20 text-red-300',
    rejected: 'bg-red-500/20 text-red-300',
    unpaid: 'bg-white/10 text-[#DFCEBC]',
  };
  return <span className={cx('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', color[status] ?? 'bg-white/10 text-[#DFCEBC]')}>{status}</span>;
};

/** Success/error feedback, announced to screen readers. */
export function useFeedback() {
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const ok = useCallback((text: string) => setMsg({ kind: 'ok', text }), []);
  const fail = useCallback((err: unknown) => setMsg({ kind: 'error', text: errorMessage(err) }), []);
  const clear = useCallback(() => setMsg(null), []);
  const node = (
    <div aria-live="polite" role="status" className="min-h-5">
      {msg && <p className={cx('text-xs font-semibold', msg.kind === 'ok' ? 'text-emerald-300' : 'text-red-300')}>{msg.text}</p>}
    </div>
  );
  return { ok, fail, clear, node };
}

export const Loading: React.FC = () => <p className="text-sm text-[#DFCEBC]/70 py-6 text-center">Loading…</p>;
export const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="text-sm text-[#DFCEBC]/70 py-6 text-center">{children}</p>;
