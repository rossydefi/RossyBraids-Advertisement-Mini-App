import React, { useCallback, useEffect, useState } from 'react';
import { BookingsPanel } from './BookingsPanel';
import { Login } from './Login';
import { Overview } from './Overview';
import { OrdersPanel } from './OrdersPanel';
import { RemindersPanel } from './RemindersPanel';
import { ReviewsPanel } from './ReviewsPanel';
import { SettingsPanel } from './SettingsPanel';
import { getAdminToken, setAdminToken, setUnauthorizedHandler, type Summary } from './adminApi';
import { btn, cx } from './ui';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'orders', label: 'Orders' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'reminders', label: 'Reminders' },
  { id: 'settings', label: 'Settings' },
] as const;
type TabId = (typeof TABS)[number]['id'];

export default function AdminApp() {
  const [signedIn, setSignedIn] = useState(() => !!getAdminToken());
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState<TabId>('overview');
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    document.title = 'RossyBraids Admin';
    setUnauthorizedHandler(() => {
      setNotice('Your session expired. Please sign in again.');
      setSignedIn(false);
    });
  }, []);

  const handleSummary = useCallback((s: Summary) => setSummary(s), []);

  const signOut = () => {
    setAdminToken(null);
    setNotice('');
    setSummary(null);
    setSignedIn(false);
  };

  return (
    <div className="min-h-screen bg-[#140D08] text-[#FAF6F0] font-sans-modern">
      <header className="sticky top-0 z-30 border-b border-[#D4AF37]/20 bg-[#1E110A]/95 px-3 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <h1 className="font-cinzel text-base font-bold uppercase tracking-[0.18em] text-[#F5E6A3] sm:text-lg">RossyBraids Admin</h1>
          <div className="flex items-center gap-2">
            <a href="/" className={cx(btn.base, btn.ghost)}>← Back to site</a>
            {signedIn && <button onClick={signOut} className={cx(btn.base, btn.ghost)}>Sign out</button>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-5 sm:px-6">
        {!signedIn ? (
          <Login notice={notice} onSignedIn={() => { setNotice(''); setSignedIn(true); }} />
        ) : (
          <div className="space-y-5">
            {summary?.usingDefaultPassword && (
              <div role="alert" className="rounded-lg border border-amber-400/50 bg-amber-500/10 p-3 text-xs text-amber-200">
                You’re still using the default admin password. Set <code className="font-semibold">ADMIN_PASSWORD</code> in your server’s <code>.env</code> and restart.
              </div>
            )}
            <nav aria-label="Admin sections" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
              {TABS.map((t) => {
                const badge =
                  t.id === 'bookings' ? summary?.pendingBookings : t.id === 'orders' ? summary?.pendingOrders : t.id === 'reviews' ? summary?.pendingReviews : 0;
                return (
                  <button
                    key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}
                    className={cx(btn.base, 'shrink-0 px-4 py-2 text-sm', tab === t.id ? btn.gold : btn.ghost)}
                  >
                    {t.label}
                    {!!badge && <span className="ml-1 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-black">{badge}</span>}
                  </button>
                );
              })}
            </nav>
            {tab === 'overview' && <Overview onSummary={handleSummary} />}
            {tab === 'bookings' && <BookingsPanel />}
            {tab === 'orders' && <OrdersPanel />}
            {tab === 'reviews' && <ReviewsPanel />}
            {tab === 'reminders' && <RemindersPanel />}
            {tab === 'settings' && <SettingsPanel />}
          </div>
        )}
      </main>
    </div>
  );
}
