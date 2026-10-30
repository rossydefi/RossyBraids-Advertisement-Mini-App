import React, { useEffect, useState } from 'react';
import { adminRequest, errorMessage, type AdminSettings, type SettingsResponse } from './adminApi';
import { btn, Card, cx, Field, formatDate, inputClass, Loading, naira, useFeedback } from './ui';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ProductRow: React.FC<{
  product: SettingsResponse['products'][number];
  override: AdminSettings['productOverrides'][string] | undefined;
  onSaved: (o: AdminSettings['productOverrides'][string] | undefined) => void;
}> = ({ product, override, onSaved }) => {
  const [price, setPrice] = useState(override?.price?.toString() ?? '');
  const [stock, setStock] = useState(override?.stock?.toString() ?? '');
  const [inStock, setInStock] = useState(override?.inStock !== false);
  const fb = useFeedback();

  const save = async (reset = false) => {
    fb.clear();
    // "" -> null clears the override; the server treats undefined as "leave alone".
    const body = reset
      ? { price: null, stock: null, inStock: true }
      : { price: price === '' ? null : Number(price), stock: stock === '' ? null : Number(stock), inStock };
    try {
      const saved = await adminRequest<NonNullable<AdminSettings['productOverrides'][string]>>('PUT', `/products/${product.id}`, body);
      const next = Object.keys(saved).length ? saved : undefined;
      onSaved(next);
      setPrice(next?.price?.toString() ?? '');
      setStock(next?.stock?.toString() ?? '');
      setInStock(next?.inStock !== false);
      fb.ok(reset ? 'Reset to defaults' : 'Saved');
    } catch (err) {
      fb.fail(err);
    }
  };

  return (
    <Card className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-[#FAF6F0]">{product.name}</p>
        <p className="text-xs text-[#DFCEBC]/70">{product.category} · catalog price {naira(product.basePrice)}</p>
      </div>
      <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-4">
        <Field label="Price override (₦)" hint="Empty = catalog price">
          {(id) => <input id={id} type="number" min={0} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />}
        </Field>
        <Field label="Tracked stock" hint="Empty = not tracked">
          {(id) => <input id={id} type="number" min={0} inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} className={inputClass} />}
        </Field>
        <label className="flex items-center gap-2 pb-2 text-xs text-[#DFCEBC]">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="h-4 w-4 accent-[#D4AF37]" />
          In stock
        </label>
        <div className="flex gap-2 pb-0.5">
          <button onClick={() => save()} className={cx(btn.base, btn.gold)}>Save</button>
          <button onClick={() => save(true)} className={cx(btn.base, btn.ghost)}>Reset</button>
        </div>
      </div>
      {fb.node}
    </Card>
  );
};

export const SettingsPanel: React.FC = () => {
  const [data, setData] = useState<SettingsResponse | null>(null);
  const [s, setS] = useState<AdminSettings | null>(null);
  const [newDate, setNewDate] = useState('');
  const [error, setError] = useState('');
  const fb = useFeedback();

  useEffect(() => {
    adminRequest<SettingsResponse>('GET', '/settings')
      .then((r) => {
        setData(r);
        setS(r.settings);
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <p className="py-6 text-center text-sm text-red-300">{error}</p>;
  if (!data || !s) return <Loading />;

  const update = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => setS({ ...s, [key]: value });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    fb.clear();
    try {
      const { productOverrides: _ignored, ...general } = s;
      const saved = await adminRequest<AdminSettings>('PUT', '/settings', general);
      setS({ ...saved, productOverrides: s.productOverrides });
      fb.ok('Settings saved');
    } catch (err) {
      fb.fail(err);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-5">
        <Card className="space-y-3">
          <h2 className="font-cinzel text-base font-bold tracking-wider text-[#F5E6A3]">Availability</h2>
          <fieldset>
            <legend className="mb-1 text-xs font-semibold text-[#DFCEBC]">Days the salon is closed</legend>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {WEEKDAYS.map((d, i) => (
                <label key={d} className="flex items-center gap-1.5 text-xs text-[#DFCEBC]">
                  <input
                    type="checkbox" className="h-4 w-4 accent-[#D4AF37]" checked={s.closedWeekdays.includes(i)}
                    onChange={(e) => update('closedWeekdays', e.target.checked ? [...s.closedWeekdays, i] : s.closedWeekdays.filter((x) => x !== i))}
                  />
                  {d}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <p className="mb-1 text-xs font-semibold text-[#DFCEBC]">Blocked dates (holidays, time off)</p>
            <div className="flex flex-wrap gap-2">
              {s.blockedDates.length === 0 && <span className="text-xs text-[#DFCEBC]/60">None</span>}
              {s.blockedDates.map((d) => (
                <span key={d} className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs text-[#DFCEBC]">
                  {formatDate(d)}
                  <button type="button" aria-label={`Unblock ${d}`} onClick={() => update('blockedDates', s.blockedDates.filter((x) => x !== d))} className="cursor-pointer text-red-300 focus-visible:outline-2 focus-visible:outline-[#D4AF37]">✕</button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-end gap-2">
              <Field label="Add a blocked date">{(id) => <input id={id} type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className={inputClass} />}</Field>
              <button
                type="button" disabled={!newDate || s.blockedDates.includes(newDate)}
                onClick={() => { update('blockedDates', [...s.blockedDates, newDate].sort()); setNewDate(''); }}
                className={cx(btn.base, btn.ghost)}
              >
                Add
              </button>
            </div>
          </div>

          <div className="max-w-xs">
            <Field label="Max bookings per day" hint="A day shows as fully booked once this is reached.">
              {(id) => <input id={id} type="number" min={1} max={50} value={s.maxBookingsPerDay} onChange={(e) => update('maxBookingsPerDay', Number(e.target.value))} className={inputClass} />}
            </Field>
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="font-cinzel text-base font-bold tracking-wider text-[#F5E6A3]">Deposits</h2>
          <p className="text-xs text-[#DFCEBC]/70">Deposits are paid online through Paystack, so they only apply once <code className="text-[#F5E6A3]">PAYSTACK_SECRET_KEY</code> is configured. Until then bookings are free to request.</p>
          <div className="grid max-w-md grid-cols-2 items-end gap-3">
            <Field label="Deposit (% of total)">
              {(id) => <input id={id} type="number" min={5} max={100} value={s.depositPercent} onChange={(e) => update('depositPercent', Number(e.target.value))} className={inputClass} />}
            </Field>
            <label className="flex items-center gap-2 pb-2 text-xs text-[#DFCEBC]">
              <input type="checkbox" className="h-4 w-4 accent-[#D4AF37]" checked={s.requireDeposit} onChange={(e) => update('requireDeposit', e.target.checked)} />
              Require a deposit
            </label>
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="font-cinzel text-base font-bold tracking-wider text-[#F5E6A3]">Public information</h2>
          <Field label="Banner message" hint="Shown across the site, e.g. “Closed 24–26 Dec”. Leave empty for none.">
            {(id) => <input id={id} maxLength={200} value={s.banner} onChange={(e) => update('banner', e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Opening hours">{(id) => <input id={id} value={s.openingHours} onChange={(e) => update('openingHours', e.target.value)} className={inputClass} />}</Field>
          <Field label="Address">{(id) => <input id={id} value={s.address} onChange={(e) => update('address', e.target.value)} className={inputClass} />}</Field>
          <Field label="Map link" hint="A Google Maps share link.">
            {(id) => <input id={id} type="url" value={s.mapUrl} onChange={(e) => update('mapUrl', e.target.value)} className={inputClass} />}
          </Field>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={cx(btn.base, btn.gold, 'px-5 py-2 text-sm')}>Save settings</button>
          {fb.node}
        </div>
      </form>

      <section aria-labelledby="set-products" className="space-y-3">
        <h2 id="set-products" className="font-cinzel text-base font-bold tracking-wider text-[#F5E6A3]">Shop products</h2>
        {data.products.map((p) => (
          <ProductRow
            key={p.id} product={p} override={s.productOverrides[p.id]}
            onSaved={(o) => {
              const next = { ...s.productOverrides };
              if (o) next[p.id] = o;
              else delete next[p.id];
              setS((cur) => (cur ? { ...cur, productOverrides: next } : cur));
            }}
          />
        ))}
      </section>
    </div>
  );
};
