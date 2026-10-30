import React, { useEffect, useState } from 'react';
import { adminRequest, errorMessage, type Summary } from './adminApi';
import { Card, Empty, Loading, naira } from './ui';

const Stat: React.FC<{ label: string; value: string | number; sub?: string }> = ({ label, value, sub }) => (
  <Card>
    <p className="text-[11px] uppercase tracking-wider text-[#DFCEBC]/70">{label}</p>
    <p className="mt-1 font-cinzel text-2xl font-bold text-[#F5E6A3]">{value}</p>
    {sub && <p className="mt-0.5 text-[11px] text-[#DFCEBC]/60">{sub}</p>}
  </Card>
);

const Flag: React.FC<{ on: boolean; label: string }> = ({ on, label }) => (
  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${on ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-[#DFCEBC]/80'}`}>
    {label}: {on ? 'on' : 'off'}
  </span>
);

export const Overview: React.FC<{ onSummary?: (s: Summary) => void }> = ({ onSummary }) => {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminRequest<Summary>('GET', '/summary')
      .then((s) => {
        setData(s);
        onSummary?.(s);
      })
      .catch((e) => setError(errorMessage(e)));
  }, [onSummary]);

  if (error) return <Empty>{error}</Empty>;
  if (!data) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <Stat label="Awaiting confirmation" value={data.pendingBookings} sub="bookings" />
        <Stat label="Today" value={data.todayBookings} sub="appointments" />
        <Stat label="Upcoming" value={data.upcomingBookings} sub="pending or confirmed" />
        <Stat label="New orders" value={data.pendingOrders} sub="to process" />
        <Stat label="Reviews to approve" value={data.pendingReviews} />
        <Stat label="Revenue (30 days)" value={naira(data.revenue30d)} sub={`${naira(data.bookingRevenue30d)} services · ${naira(data.orderRevenue30d)} shop`} />
      </div>
      <Card className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-[#DFCEBC]">Integrations:</span>
        <Flag on={data.paymentsEnabled} label="Online payments (Paystack)" />
        <Flag on={data.smsEnabled} label="SMS (Termii)" />
      </Card>
      {!data.smsEnabled && (
        <p className="text-xs text-[#DFCEBC]/80">
          SMS isn’t configured, so clients aren’t texted automatically. Alerts to you appear here, and reminders can be sent with the WhatsApp buttons.
          Add <code className="text-[#F5E6A3]">TERMII_API_KEY</code> to enable SMS.
        </p>
      )}
    </div>
  );
};
