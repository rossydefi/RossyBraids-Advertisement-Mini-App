import React, { useCallback, useEffect, useState } from 'react';
import { adminRequest, downloadCsv, errorMessage, type ServerOrder } from './adminApi';
import { btn, Card, cx, Empty, Field, formatDate, inputClass, Loading, naira, StatusBadge, useFeedback, waLink } from './ui';

const ORDER_STATUSES: ServerOrder['status'][] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

const OrderCard: React.FC<{ order: ServerOrder; onChanged: (o: ServerOrder) => void }> = ({ order: o, onChanged }) => {
  const fb = useFeedback();
  const [busy, setBusy] = useState(false);

  const setStatus = async (status: string) => {
    if (status === 'cancelled' && !window.confirm(`Cancel order ${o.id}? Stock and any discount code will be released.`)) return;
    setBusy(true);
    fb.clear();
    try {
      onChanged(await adminRequest<ServerOrder>('PATCH', `/orders/${o.id}`, { status }));
      fb.ok('Order updated');
    } catch (err) {
      fb.fail(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-[#FAF6F0]">{o.customerName} <span className="font-normal text-[#DFCEBC]/70">· {o.id}</span></p>
          <p className="text-xs text-[#DFCEBC]">{o.customerPhone} · {formatDate(o.createdAt.slice(0, 10))}</p>
          {o.deliveryAddress && <p className="text-xs text-[#DFCEBC]">Deliver to: {o.deliveryAddress}</p>}
        </div>
        <div className="flex items-center gap-1.5">
          <StatusBadge status={o.status} />
          <StatusBadge status={o.paymentStatus} />
        </div>
      </div>
      <ul className="space-y-0.5 text-xs text-[#DFCEBC]">
        {o.items.map((i) => (
          <li key={i.productId} className="flex justify-between gap-3">
            <span>{i.quantity} × {i.productName}</span>
            <span className="shrink-0">{naira(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-white/10 pt-2 text-xs text-[#DFCEBC]">
        {o.discount > 0 && <p>Discount ({o.discountCode}): −{naira(o.discount)}</p>}
        <p className="text-sm font-semibold text-[#F5E6A3]">Total {naira(o.total)}</p>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Status">
          {(id) => (
            <select id={id} value={o.status} disabled={busy} onChange={(e) => setStatus(e.target.value)} className={cx(inputClass, 'w-auto')}>
              {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          )}
        </Field>
        <a
          href={waLink(o.customerPhone, `Hi ${o.customerName}, this is RossyBraids about your order ${o.id} (${naira(o.total)}).`)}
          target="_blank" rel="noopener noreferrer" className={cx(btn.base, btn.whatsapp)}
        >
          WhatsApp
        </a>
      </div>
      {fb.node}
    </Card>
  );
};

export const OrdersPanel: React.FC = () => {
  const [rows, setRows] = useState<ServerOrder[] | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const fb = useFeedback();

  const load = useCallback(async () => {
    try {
      setRows(await adminRequest<ServerOrder[]>('GET', `/orders${status ? `?status=${status}` : ''}`));
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-end gap-3">
        <Field label="Status">
          {(id) => (
            <select id={id} value={status} onChange={(e) => setStatus(e.target.value)} className={cx(inputClass, 'w-auto')}>
              <option value="">All</option>
              {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          )}
        </Field>
        <button onClick={() => downloadCsv('orders').catch(fb.fail)} className={cx(btn.base, btn.ghost)}>Export CSV</button>
        <button onClick={load} className={cx(btn.base, btn.ghost)}>Refresh</button>
        {fb.node}
      </Card>
      {error ? <Empty>{error}</Empty> : !rows ? <Loading /> : rows.length === 0 ? <Empty>No orders yet.</Empty> : (
        <div className="space-y-3">
          {rows.map((o) => (
            <OrderCard key={o.id} order={o} onChanged={(no) => setRows((cur) => cur?.map((x) => (x.id === no.id ? no : x)) ?? null)} />
          ))}
        </div>
      )}
    </div>
  );
};
