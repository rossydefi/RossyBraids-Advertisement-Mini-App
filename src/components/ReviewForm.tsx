import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { api, ApiError } from '../api/client';

export const ReviewForm: React.FC = () => {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await api.submitReview({ name, location, rating, text, phone: phone || undefined });
      setMessage({ ok: true, text: res.message });
      setName('');
      setLocation('');
      setPhone('');
      setText('');
    } catch (err) {
      setMessage({ ok: false, text: err instanceof ApiError ? err.message : 'Could not send your review. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const input =
    'w-full px-3 py-2 rounded-lg bg-black/30 border border-[#D4AF37]/30 text-sm text-[#FAF6F0] placeholder:text-[#DFCEBC]/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]';

  return (
    <form onSubmit={submit} className="space-y-3 text-left font-sans-modern">
      <fieldset>
        <legend className="text-xs text-[#DFCEBC] mb-1">Your rating</legend>
        <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              onClick={() => setRating(n)}
              className="p-0.5 cursor-pointer"
            >
              <Star className={`w-6 h-6 ${n <= rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#DFCEBC]/40'}`} />
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="rv-name" className="block text-xs text-[#DFCEBC] mb-1">Your name</label>
          <input id="rv-name" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="rv-loc" className="block text-xs text-[#DFCEBC] mb-1">Area (optional)</label>
          <input id="rv-loc" maxLength={80} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Lekki, Lagos" className={input} />
        </div>
      </div>
      <div>
        <label htmlFor="rv-text" className="block text-xs text-[#DFCEBC] mb-1">Your review</label>
        <textarea id="rv-text" required minLength={10} maxLength={1000} rows={3} value={text} onChange={(e) => setText(e.target.value)} className={input} />
      </div>
      <div>
        <label htmlFor="rv-phone" className="block text-xs text-[#DFCEBC] mb-1">Phone you booked with (optional, never shown, adds a “Verified client” badge)</label>
        <input id="rv-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
      </div>
      <button type="submit" disabled={busy} className="px-5 py-2 rounded-full bg-[#D4AF37] text-[#2A1810] text-sm font-bold hover:brightness-105 disabled:opacity-60 cursor-pointer">
        {busy ? 'Sending…' : 'Submit review'}
      </button>
      <p role="status" className={`text-xs min-h-[1em] ${message?.ok ? 'text-emerald-300' : 'text-red-300'}`}>{message?.text}</p>
    </form>
  );
};
