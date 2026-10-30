import React, { useCallback, useEffect, useState } from 'react';
import { adminRequest, errorMessage, type AdminReview } from './adminApi';
import { btn, Card, cx, Empty, Loading, useFeedback } from './ui';

const TABS = ['pending', 'approved', 'rejected'] as const;

export const ReviewsPanel: React.FC = () => {
  const [tab, setTab] = useState<(typeof TABS)[number]>('pending');
  const [rows, setRows] = useState<AdminReview[] | null>(null);
  const [error, setError] = useState('');
  const fb = useFeedback();

  const load = useCallback(async () => {
    setRows(null);
    try {
      setRows(await adminRequest<AdminReview[]>('GET', `/reviews?status=${tab}`));
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (fn: () => Promise<unknown>, success: string) => {
    fb.clear();
    try {
      await fn();
      fb.ok(success);
      await load();
    } catch (err) {
      fb.fail(err);
    }
  };

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Review status" className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={cx(btn.base, 'capitalize', tab === t ? btn.gold : btn.ghost)}
          >
            {t}
          </button>
        ))}
      </div>
      {fb.node}
      {error ? <Empty>{error}</Empty> : !rows ? <Loading /> : rows.length === 0 ? <Empty>No {tab} reviews.</Empty> : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.id} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-[#FAF6F0]">
                  {r.name}{r.location ? <span className="font-normal text-[#DFCEBC]/70"> · {r.location}</span> : null}
                  {r.verified ? <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">VERIFIED CLIENT</span> : null}
                </p>
                <p className="text-sm text-[#D4AF37]" aria-label={`${r.rating} out of 5 stars`}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
              </div>
              <p className="text-sm text-[#DFCEBC]">“{r.text}”</p>
              {r.service_name && <p className="text-xs text-[#DFCEBC]/60">Service: {r.service_name}</p>}
              <div className="flex flex-wrap gap-2">
                {tab !== 'approved' && (
                  <button className={cx(btn.base, btn.gold)} onClick={() => act(() => adminRequest('PATCH', `/reviews/${r.id}`, { status: 'approved' }), 'Review approved')}>Approve</button>
                )}
                {tab !== 'rejected' && (
                  <button className={cx(btn.base, btn.ghost)} onClick={() => act(() => adminRequest('PATCH', `/reviews/${r.id}`, { status: 'rejected' }), 'Review rejected')}>Reject</button>
                )}
                <button
                  className={cx(btn.base, btn.danger)}
                  onClick={() => window.confirm('Permanently delete this review?') && act(() => adminRequest('DELETE', `/reviews/${r.id}`), 'Review deleted')}
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
