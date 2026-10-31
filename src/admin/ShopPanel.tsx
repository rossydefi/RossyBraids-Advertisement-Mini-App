import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ProductShopItem } from '../types';
import { adminRequest, errorMessage } from './adminApi';
import { uploadMedia } from './GalleryPanel';
import { btn, Card, cx, Empty, Field, inputClass, Loading, naira, useFeedback } from './ui';

type Product = ProductShopItem & { stock: number | null; inStockFlag: boolean };

const CATEGORIES = ['Luxury Ready-to-Wear Wigs', 'Wash & Cleansing', 'Conditioners & Masks', 'Serums & Oils', 'Accessories & Silk'];

const blank = { name: '', category: CATEGORIES[0], price: '', stock: '', volume: '', description: '', benefits: '', featured: false, inStock: true };
type Form = typeof blank;

const toBody = (f: Form) => ({
  name: f.name,
  category: f.category,
  price: f.price === '' ? NaN : Number(f.price),
  stock: f.stock === '' ? null : Number(f.stock),
  volume: f.volume,
  description: f.description,
  benefits: f.benefits.split('\n'),
  featured: f.featured,
  inStock: f.inStock,
});

export const ShopPanel: React.FC = () => {
  const [items, setItems] = useState<Product[] | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Form>(blank);
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [edit, setEdit] = useState<Form>(blank);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const fb = useFeedback();

  const load = useCallback(async () => {
    try {
      setItems(await adminRequest<Product[]>('GET', '/shop'));
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    fb.clear();
    if (!photo) return fb.fail(new Error('Choose a product photo'));
    setBusy(true);
    try {
      const imageUrl = await uploadMedia(photo);
      await adminRequest('POST', '/shop', { ...toBody(form), imageUrl });
      fb.ok('Product added. Clients can now order it.');
      setForm(blank);
      setPhoto(null);
      if (photoRef.current) photoRef.current.value = '';
      await load();
    } catch (err) {
      fb.fail(err);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (p: Product) => {
    setEditing(p.id);
    setNewPhoto(null);
    setEdit({
      name: p.name, category: p.category, price: String(p.price), stock: p.stock === null ? '' : String(p.stock),
      volume: p.volume, description: p.description, benefits: p.benefits.join('\n'), featured: !!p.featured, inStock: p.inStockFlag,
    });
  };

  const saveEdit = async (id: string) => {
    fb.clear();
    try {
      const imageUrl = newPhoto ? await uploadMedia(newPhoto) : undefined;
      await adminRequest('PATCH', `/shop/${id}`, { ...toBody(edit), ...(imageUrl ? { imageUrl } : {}) });
      fb.ok('Saved');
      setEditing(null);
      await load();
    } catch (err) {
      fb.fail(err);
    }
  };

  const remove = async (p: Product) => {
    if (!window.confirm(`Delete “${p.name}” from the shop? Past orders keep their record.`)) return;
    fb.clear();
    try {
      await adminRequest('DELETE', `/shop/${p.id}`);
      fb.ok('Deleted');
      await load();
    } catch (err) {
      fb.fail(err);
    }
  };

  const fields = (f: Form, set: (v: Form) => void) => (
    <>
      <Field label="Product name">{(id) => <input id={id} className={inputClass} value={f.name} maxLength={120} onChange={(e) => set({ ...f, name: e.target.value })} required />}</Field>
      <Field label="Category">
        {(id) => <select id={id} className={inputClass} value={f.category} onChange={(e) => set({ ...f, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>}
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price (₦)">{(id) => <input id={id} type="number" min={0} inputMode="numeric" className={inputClass} value={f.price} onChange={(e) => set({ ...f, price: e.target.value })} required />}</Field>
        <Field label="Stock" hint="Blank = don’t track">{(id) => <input id={id} type="number" min={0} inputMode="numeric" className={inputClass} value={f.stock} onChange={(e) => set({ ...f, stock: e.target.value })} />}</Field>
      </div>
      <Field label="Size / details" hint="e.g. 250ml, 26 inches, 13x4 lace">{(id) => <input id={id} className={inputClass} value={f.volume} maxLength={80} onChange={(e) => set({ ...f, volume: e.target.value })} />}</Field>
      <Field label="Description">{(id) => <textarea id={id} rows={3} className={inputClass} maxLength={1500} value={f.description} onChange={(e) => set({ ...f, description: e.target.value })} />}</Field>
      <Field label="Highlights" hint="One per line (optional)">{(id) => <textarea id={id} rows={3} className={inputClass} value={f.benefits} onChange={(e) => set({ ...f, benefits: e.target.value })} />}</Field>
      <div className="flex flex-wrap gap-4 text-xs text-[#DFCEBC]">
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.inStock} onChange={(e) => set({ ...f, inStock: e.target.checked })} /> Available to order</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.featured} onChange={(e) => set({ ...f, featured: e.target.checked })} /> Feature at the top</label>
      </div>
    </>
  );

  return (
    <div className="space-y-5">
      <Card>
        <form onSubmit={submit} className="space-y-3">
          <h2 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#F5E6A3]">Add a product</h2>
          <Field label="Product photo" hint="JPG, PNG, WebP or GIF.">
            {(id) => <input id={id} ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className={inputClass} onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />}
          </Field>
          {fields(form, setForm)}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={busy} className={cx(btn.base, btn.gold, 'px-5 py-2 text-sm')}>{busy ? 'Uploading…' : 'Add to shop'}</button>
            {fb.node}
          </div>
        </form>
      </Card>

      {error ? <Empty>{error}</Empty> : !items ? <Loading /> : items.length === 0 ? (
        <Empty>No products of your own yet. Clients currently see the sample products that come with the app (you can change their prices under Settings). The samples are replaced as soon as you add your first product.</Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((p) => (
            <Card key={p.id} className="space-y-3">
              <div className="flex gap-3">
                <img src={p.image} alt={p.name} className="h-24 w-24 shrink-0 rounded-lg bg-black object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#FAF6F0]">{p.name}</p>
                  <p className="text-xs text-[#DFCEBC]/70">{p.category}</p>
                  <p className="mt-1 text-sm font-bold text-[#D4AF37]">{naira(p.price)}</p>
                  <p className="text-[11px] text-[#DFCEBC]/60">
                    {p.stock === null ? 'Stock not tracked' : `${p.stock} in stock`} · {p.inStock ? 'available' : 'unavailable'}{p.featured ? ' · ★ featured' : ''}
                  </p>
                </div>
              </div>
              {editing === p.id ? (
                <div className="space-y-3">
                  <Field label="Replace photo (optional)">{(id) => <input id={id} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className={inputClass} onChange={(e) => setNewPhoto(e.target.files?.[0] ?? null)} />}</Field>
                  {fields(edit, setEdit)}
                  <div className="flex gap-2">
                    <button className={cx(btn.base, btn.gold)} onClick={() => saveEdit(p.id)}>Save</button>
                    <button className={cx(btn.base, btn.ghost)} onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button className={cx(btn.base, btn.ghost)} onClick={() => startEdit(p)}>Edit</button>
                  <button className={cx(btn.base, btn.danger)} onClick={() => remove(p)}>Delete</button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
