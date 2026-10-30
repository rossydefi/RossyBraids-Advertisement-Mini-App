import React, { useCallback, useEffect, useState } from 'react';
import { adminRequest, errorMessage, type RemindersResponse } from './adminApi';
import { btn, Card, cx, Empty, formatDate, Loading, naira, useFeedback, waLink } from './ui';

export const RemindersPanel: React.FC = () => {
  const [data, setData] = useState<RemindersResponse | null>(null);
  const [error, setError] = useState('');
  const fb = useFeedback();

  const load = useCallback(async () => {
    try {
      setData(await adminRequest<RemindersResponse>('GET', '/reminders'));
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sendSms = async (id: string) => {
    fb.clear();
    try {
      const { sent } = await adminRequest<{ sent: boolean }>('POST', `/reminders/${id}/send`);
      if (sent) fb.ok('SMS reminder sent');
      else fb.fail(new Error('The SMS provider did not accept the message'));
      await load();
    } catch (err) {
      fb.fail(err);
    }
  };

  if (error) return <Empty>{error}</Empty>;
  if (!data) return <Loading />;

  return (
    <div className="space-y-6">
      <section aria-labelledby="rem-tomorrow" className="space-y-3">
        <h2 id="rem-tomorrow" className="font-cinzel text-base font-bold tracking-wider text-[#F5E6A3]">
          Tomorrow’s appointments · {formatDate(data.tomorrow)}
        </h2>
        {!data.smsEnabled && <p className="text-xs text-[#DFCEBC]/70">SMS isn’t configured; use the WhatsApp buttons to remind clients.</p>}
        {fb.node}
        {data.upcoming.length === 0 ? <Empty>No appointments tomorrow.</Empty> : data.upcoming.map((b) => (
          <Card key={b.id} className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <p className="font-semibold text-[#FAF6F0]">{b.clientName} <span className="font-normal text-[#DFCEBC]/70">· {b.id}</span></p>
              <p className="text-xs text-[#DFCEBC]">{b.serviceName} · {b.timeSlot} · {b.stylist}</p>
              <p className="text-xs text-[#DFCEBC]/70">{b.clientPhone} · {naira(b.totalPrice)}</p>
              {b.remindedAt && (
                <span className="mt-1 inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  REMINDED {new Date(b.remindedAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <a
                href={waLink(b.clientPhone, `Hi ${b.clientName}! A friendly reminder of your RossyBraids appointment tomorrow, ${b.timeSlot}. Please reply to confirm. 💛`)}
                target="_blank" rel="noopener noreferrer" className={cx(btn.base, btn.whatsapp)}
              >
                WhatsApp reminder
              </a>
              <button disabled={!data.smsEnabled} onClick={() => sendSms(b.id)} className={cx(btn.base, btn.ghost)} title={data.smsEnabled ? '' : 'SMS is not configured'}>
                Send SMS
              </button>
            </div>
          </Card>
        ))}
      </section>

      <section aria-labelledby="rem-maint" className="space-y-3">
        <h2 id="rem-maint" className="font-cinzel text-base font-bold tracking-wider text-[#F5E6A3]">4-week refresh due</h2>
        {data.maintenanceDue.length === 0 ? <Empty>No clients are due for a refresh right now.</Empty> : data.maintenanceDue.map((m) => (
          <Card key={m.bookingId} className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <p className="font-semibold text-[#FAF6F0]">{m.clientName}</p>
              <p className="text-xs text-[#DFCEBC]">{m.serviceName} → {m.recommendedActionTitle}</p>
              <p className="text-xs text-[#DFCEBC]/70">
                Due {m.dueDate} ({m.daysUntilDue <= 0 ? `${Math.abs(m.daysUntilDue)} day(s) overdue` : `in ${m.daysUntilDue} day(s)`}) · {m.clientPhone}
              </p>
            </div>
            <a
              href={waLink(m.phone ?? m.clientPhone, `Hi ${m.clientName}! Your ${m.serviceName} is due for its 4-week refresh (${m.recommendedActionTitle}). Would you like to book a slot this week? 💛`)}
              target="_blank" rel="noopener noreferrer" className={cx(btn.base, btn.whatsapp)}
            >
              WhatsApp
            </a>
          </Card>
        ))}
      </section>
    </div>
  );
};
