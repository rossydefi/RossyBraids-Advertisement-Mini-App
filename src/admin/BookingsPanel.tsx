import React, { useCallback, useEffect, useState } from 'react';
import { STYLISTS, TIME_SLOTS } from '../data/flyerData';
import { adminRequest, downloadCsv, errorMessage, type ServerBooking } from './adminApi';
import { btn, Card, cx, Empty, Field, formatDate, inputClass, Loading, naira, StatusBadge, useFeedback, waLink } from './ui';

const STATUSES = ['', 'pending', 'confirmed', 'completed', 'cancelled'] as const;

const BookingCard: React.FC<{ booking: ServerBooking; onChanged: (b: ServerBooking) => void }> = ({ booking: b, onChanged }) => {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(b.date);
  const [slot, setSlot] = useState(b.timeSlot);
  const [stylist, setStylist] = useState(b.stylist);
  const [note, setNote] = useState(b.adminNote ?? '');
  const fb = useFeedback();

  const patch = async (body: Record<string, unknown>, success: string) => {
    setBusy(true);
    fb.clear();
    try {
      onChanged(await adminRequest<ServerBooking>('PATCH', `/bookings/${b.id}`, body));
      fb.ok(success);
      return true;
    } catch (err) {
      fb.fail(err); // includes the 409 "slot already booked" message
      return false;
    } finally {
      setBusy(false);
    }
  };

  const home = b.homeServiceDetails;
  const style = [b.selectedSubtype, b.selectedSize, b.selectedLength].filter(Boolean).join(' · ');
  const waText = `Hi ${b.clientName}, this is RossyBraids about your booking ${b.id} (${b.serviceName}) on ${formatDate(b.date)}, ${b.timeSlot}.`;

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-[#FAF6F0]">
            {b.clientName} <span className="font-normal text-[#DFCEBC]/70">· {b.id}</span>
          </p>
          <p className="text-xs text-[#DFCEBC]">{b.clientPhone}{b.clientEmail ? ` · ${b.clientEmail}` : ''}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusBadge status={b.status} />
          <StatusBadge status={b.paymentStatus ?? 'unpaid'} />
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-[#DFCEBC] sm:grid-cols-2">
        <div><dt className="inline text-[#DFCEBC]/60">Service: </dt><dd className="inline">{b.serviceName}</dd></div>
        {style && <div><dt className="inline text-[#DFCEBC]/60">Style: </dt><dd className="inline">{style}</dd></div>}
        <div><dt className="inline text-[#DFCEBC]/60">When: </dt><dd className="inline">{formatDate(b.date)}, {b.timeSlot}</dd></div>
        <div><dt className="inline text-[#DFCEBC]/60">Stylist: </dt><dd className="inline">{b.stylist}</dd></div>
        <div><dt className="inline text-[#DFCEBC]/60">Total: </dt><dd className="inline font-semibold text-[#F5E6A3]">{naira(b.totalPrice)}</dd>
          {!!b.depositAmount && <span> (deposit {naira(b.depositAmount)})</span>}</div>
        {b.addOns.length > 0 && <div><dt className="inline text-[#DFCEBC]/60">Add-ons: </dt><dd className="inline">{b.addOns.join(', ')}</dd></div>}
        {b.notes && <div className="sm:col-span-2"><dt className="inline text-[#DFCEBC]/60">Client notes: </dt><dd className="inline">{b.notes}</dd></div>}
      </dl>

      {home && (
        <div className="rounded-lg border border-white/10 bg-black/30 p-2.5 text-xs text-[#DFCEBC]">
          <p className="font-semibold text-[#F5E6A3]">Home service · {home.areaZone} (+{naira(home.estimatedHomeFee)})</p>
          <p>{home.address}{home.landmark ? ` — ${home.landmark}` : ''} ({home.residenceType})</p>
          <p>Social: {home.socialHandle}{home.alternateContactName ? ` · Alt contact: ${home.alternateContactName} ${home.alternateContactPhone}` : ''}</p>
        </div>
      )}

      {b.customInspoMedia && (
        <div className="space-y-1">
          <p className="text-xs text-[#DFCEBC]/60">Inspiration ({b.customInspoMedia.fileName})</p>
          {b.customInspoMedia.type === 'video' ? (
            <video src={b.customInspoMedia.dataUrl} controls className="max-h-48 rounded-lg" />
          ) : (
            <a href={b.customInspoMedia.dataUrl} target="_blank" rel="noopener noreferrer">
              <img src={b.customInspoMedia.dataUrl} alt={`Inspiration from ${b.clientName}`} loading="lazy" className="max-h-48 rounded-lg" />
            </a>
          )}
          {b.customInspoMedia.notes && <p className="text-xs text-[#DFCEBC]">{b.customInspoMedia.notes}</p>}
          {b.customInspoMedia.externalLink && (
            <a href={b.customInspoMedia.externalLink} target="_blank" rel="noopener noreferrer" className="text-xs text-[#D4AF37] underline">Inspiration link</a>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {b.status === 'pending' && (
          <button disabled={busy} onClick={() => patch({ status: 'confirmed' }, 'Booking confirmed')} className={cx(btn.base, btn.gold)}>Confirm</button>
        )}
        {(b.status === 'pending' || b.status === 'confirmed') && (
          <button disabled={busy} onClick={() => patch({ status: 'completed' }, 'Marked completed')} className={cx(btn.base, btn.ghost)}>Mark completed</button>
        )}
        {b.status !== 'cancelled' && (
          <button
            disabled={busy}
            onClick={() => window.confirm(`Cancel booking ${b.id}?`) && patch({ status: 'cancelled' }, 'Booking cancelled')}
            className={cx(btn.base, btn.danger)}
          >
            Cancel
          </button>
        )}
        <button onClick={() => setEditing((v) => !v)} aria-expanded={editing} className={cx(btn.base, btn.ghost)}>
          {editing ? 'Close' : 'Reschedule / note'}
        </button>
        <a href={waLink(b.clientPhone, waText)} target="_blank" rel="noopener noreferrer" className={cx(btn.base, btn.whatsapp)}>WhatsApp</a>
      </div>

      {editing && (
        <form
          className="grid grid-cols-1 gap-3 rounded-lg border border-[#D4AF37]/20 bg-black/30 p-3 sm:grid-cols-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await patch({ date, timeSlot: slot, stylist, adminNote: note }, 'Booking updated')) setEditing(false);
          }}
        >
          <Field label="Date">{(id) => <input id={id} type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />}</Field>
          <Field label="Time slot">
            {(id) => (
              <select id={id} value={slot} onChange={(e) => setSlot(e.target.value)} className={inputClass}>
                {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
              </select>
            )}
          </Field>
          <Field label="Stylist">
            {(id) => (
              <select id={id} value={stylist} onChange={(e) => setStylist(e.target.value)} className={inputClass}>
                {STYLISTS.map((s) => <option key={s.id}>{s.name}</option>)}
              </select>
            )}
          </Field>
          <div className="sm:col-span-3">
            <Field label="Private note (only you see this)">
              {(id) => <textarea id={id} rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />}
            </Field>
          </div>
          <div className="sm:col-span-3">
            <button type="submit" disabled={busy} className={cx(btn.base, btn.gold)}>Save changes</button>
          </div>
        </form>
      )}
      {!editing && b.adminNote && <p className="text-xs italic text-[#DFCEBC]/80">Note: {b.adminNote}</p>}
      {fb.node}
    </Card>
  );
};

export const BookingsPanel: React.FC = () => {
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<ServerBooking[] | null>(null);
  const [error, setError] = useState('');
  const fb = useFeedback();

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (q.trim()) params.set('q', q.trim());
    try {
      setRows(await adminRequest<ServerBooking[]>('GET', `/bookings?${params}`));
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [status, from, to, q]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce the search box
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-4">
      <Card className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Field label="Status">
          {(id) => (
            <select id={id} value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              {STATUSES.map((s) => <option key={s} value={s}>{s || 'All'}</option>)}
            </select>
          )}
        </Field>
        <Field label="From">{(id) => <input id={id} type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />}</Field>
        <Field label="To">{(id) => <input id={id} type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />}</Field>
        <div className="col-span-2">
          <Field label="Search name, phone or ID">
            {(id) => <input id={id} type="search" value={q} onChange={(e) => setQ(e.target.value)} className={inputClass} />}
          </Field>
        </div>
        <div className="col-span-2 flex items-end gap-2 md:col-span-5">
          <button onClick={() => downloadCsv('bookings').catch(fb.fail)} className={cx(btn.base, btn.ghost)}>Export CSV</button>
          <button onClick={load} className={cx(btn.base, btn.ghost)}>Refresh</button>
          {fb.node}
        </div>
      </Card>

      {error ? <Empty>{error}</Empty> : !rows ? <Loading /> : rows.length === 0 ? <Empty>No bookings match these filters.</Empty> : (
        <div className="space-y-3">
          {rows.map((b) => (
            <BookingCard key={b.id} booking={b} onChanged={(nb) => setRows((cur) => cur?.map((x) => (x.id === nb.id ? nb : x)) ?? null)} />
          ))}
        </div>
      )}
    </div>
  );
};
