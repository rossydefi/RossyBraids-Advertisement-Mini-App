import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SERVICES_DATA } from '../data/flyerData';
import type { GalleryItem } from '../api/client';
import { adminRequest, errorMessage, getAdminToken } from './adminApi';
import { btn, Card, cx, Empty, Field, inputClass, Loading, useFeedback } from './ui';

export const GALLERY_CATEGORIES = [
  'Wigs & Revamping',
  'Boho Braids',
  'Dreadlocks',
  'Natural Hairstyling',
  'African Hairstyles',
  'Braids & Plaits',
  'Hair Care',
  'Other',
];

export async function uploadMedia(file: File): Promise<string> {
  const res = await fetch('/api/admin/gallery/media', {
    method: 'POST',
    headers: { 'Content-Type': file.type, Authorization: `Bearer ${getAdminToken()}` },
    body: file,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
  return data.url as string;
}

const Thumb: React.FC<{ item: Pick<GalleryItem, 'mediaType' | 'mediaUrl' | 'title'>; className?: string }> = ({ item, className }) =>
  item.mediaType === 'video' ? (
    <video src={`${item.mediaUrl}#t=0.1`} preload="metadata" muted playsInline className={className} aria-label={item.title} />
  ) : (
    <img src={item.mediaUrl} alt={item.title} className={className} />
  );

const emptyForm = { title: '', category: GALLERY_CATEGORIES[0], tags: '', description: '', serviceId: '', featured: false };

export const GalleryPanel: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [edit, setEdit] = useState(emptyForm);
  const fileRef = useRef<HTMLInputElement>(null);
  const beforeRef = useRef<HTMLInputElement>(null);
  const fb = useFeedback();

  const load = useCallback(async () => {
    try {
      setItems(await adminRequest<GalleryItem[]>('GET', '/gallery'));
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
    if (!file) return fb.fail(new Error('Choose a photo or video to upload'));
    setBusy(true);
    try {
      const mediaUrl = await uploadMedia(file);
      const beforeUrl = beforeFile ? await uploadMedia(beforeFile) : undefined;
      await adminRequest('POST', '/gallery', { ...form, mediaUrl, beforeUrl });
      fb.ok('Added to the gallery');
      setForm(emptyForm);
      setFile(null);
      setBeforeFile(null);
      if (fileRef.current) fileRef.current.value = '';
      if (beforeRef.current) beforeRef.current.value = '';
      await load();
    } catch (err) {
      fb.fail(err);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (it: GalleryItem) => {
    setEditing(it.id);
    setEdit({ title: it.title, category: it.category, tags: it.tags.join(', '), description: it.description, serviceId: it.serviceId ?? '', featured: it.featured });
  };

  const saveEdit = async (id: string) => {
    fb.clear();
    try {
      await adminRequest('PATCH', `/gallery/${id}`, edit);
      fb.ok('Saved');
      setEditing(null);
      await load();
    } catch (err) {
      fb.fail(err);
    }
  };

  const remove = async (it: GalleryItem) => {
    if (!window.confirm(`Delete “${it.title}” from the gallery? This cannot be undone.`)) return;
    fb.clear();
    try {
      await adminRequest('DELETE', `/gallery/${it.id}`);
      fb.ok('Deleted');
      await load();
    } catch (err) {
      fb.fail(err);
    }
  };

  const fields = (f: typeof emptyForm, set: (v: typeof emptyForm) => void) => (
    <>
      <Field label="Title">{(id) => <input id={id} className={inputClass} value={f.title} maxLength={100} onChange={(e) => set({ ...f, title: e.target.value })} placeholder="e.g. Knee-length boho braids with curls" required />}</Field>
      <Field label="Category">
        {(id) => (
          <>
            <input id={id} list="gallery-cats" className={inputClass} value={f.category} maxLength={50} onChange={(e) => set({ ...f, category: e.target.value })} />
            <datalist id="gallery-cats">{GALLERY_CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
          </>
        )}
      </Field>
      <Field label="Search keywords" hint="Comma separated. Words clients might type: knotless, long, wedding, curly, bob…">
        {(id) => <input id={id} className={inputClass} value={f.tags} onChange={(e) => set({ ...f, tags: e.target.value })} placeholder="knotless, long, curly, wedding" />}
      </Field>
      <Field label="Description">{(id) => <textarea id={id} className={inputClass} rows={3} maxLength={1000} value={f.description} onChange={(e) => set({ ...f, description: e.target.value })} placeholder="What was done, how long it took, hair used…" />}</Field>
      <Field label="Linked service" hint="Powers the “Book this look” button.">
        {(id) => (
          <select id={id} className={inputClass} value={f.serviceId} onChange={(e) => set({ ...f, serviceId: e.target.value })}>
            <option value="">None</option>
            {SERVICES_DATA.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </Field>
      <label className="flex items-center gap-2 text-xs text-[#DFCEBC]">
        <input type="checkbox" checked={f.featured} onChange={(e) => set({ ...f, featured: e.target.checked })} /> Feature at the top of the gallery
      </label>
    </>
  );

  return (
    <div className="space-y-5">
      <Card>
        <form onSubmit={submit} className="space-y-3">
          <h2 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#F5E6A3]">Add a style</h2>
          <Field label="Photo or video" hint="JPG, PNG, WebP, GIF, MP4, WebM or MOV. Videos up to 150 MB.">
            {(id) => <input id={id} ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" className={inputClass} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />}
          </Field>
          <Field label="“Before” photo (optional)" hint="Adds a before/after slider on the style card.">
            {(id) => <input id={id} ref={beforeRef} type="file" accept="image/jpeg,image/png,image/webp" className={inputClass} onChange={(e) => setBeforeFile(e.target.files?.[0] ?? null)} />}
          </Field>
          {fields(form, setForm)}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={busy} className={cx(btn.base, btn.gold, 'px-5 py-2 text-sm')}>{busy ? 'Uploading…' : 'Add to gallery'}</button>
            {fb.node}
          </div>
        </form>
      </Card>

      {error ? <Empty>{error}</Empty> : !items ? <Loading /> : items.length === 0 ? <Empty>Nothing uploaded yet. Clients currently see the sample styles that come with the app until you add your own.</Empty> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((it) => (
            <Card key={it.id} className="space-y-3">
              <div className="flex gap-3">
                <Thumb item={it} className="h-24 w-24 shrink-0 rounded-lg bg-black object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#FAF6F0]">{it.title}</p>
                  <p className="text-xs text-[#DFCEBC]/70">{it.category} · {it.mediaType}{it.beforeUrl ? ' · before/after' : ''}{it.featured ? ' · ★ featured' : ''}</p>
                  {it.tags.length > 0 && <p className="mt-1 truncate text-[11px] text-[#DFCEBC]/60">{it.tags.join(', ')}</p>}
                </div>
              </div>
              {editing === it.id ? (
                <div className="space-y-3">
                  {fields(edit, setEdit)}
                  <div className="flex gap-2">
                    <button className={cx(btn.base, btn.gold)} onClick={() => saveEdit(it.id)}>Save</button>
                    <button className={cx(btn.base, btn.ghost)} onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button className={cx(btn.base, btn.ghost)} onClick={() => startEdit(it)}>Edit</button>
                  <button className={cx(btn.base, btn.danger)} onClick={() => remove(it)}>Delete</button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
