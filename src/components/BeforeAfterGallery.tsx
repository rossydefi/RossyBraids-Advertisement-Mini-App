import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Film, Image as ImageIcon, Play, Search, Sparkles, X } from 'lucide-react';
import { api, type GalleryItem } from '../api/client';
import { BEFORE_AFTER_DATA } from '../data/flyerData';
import { useModalA11y } from '../hooks/useModalA11y';
import { searchGallery } from '../utils/gallerySearch';

interface BeforeAfterGalleryProps {
  onBookTransformation: (serviceId: string) => void;
}

/** Sample styles that ship with the app; shown until the owner uploads her own work. */
const SAMPLES: GalleryItem[] = BEFORE_AFTER_DATA.map((t) => ({
  id: t.id,
  title: t.title,
  category: t.category === 'Wig Transformation' ? 'Wigs & Revamping' : t.category,
  tags: t.resultHighlights,
  description: t.description,
  mediaType: 'image',
  mediaUrl: t.afterImage,
  beforeUrl: t.beforeImage,
  serviceId: t.serviceId,
  featured: false,
  createdAt: '',
}));

const SUGGESTIONS = ['Boho braids', 'Locs', 'Bone-straight wig', 'Long & curly', 'Wedding', 'Natural twists'];

const BeforeAfter: React.FC<{ item: GalleryItem }> = ({ item }) => {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative h-full w-full select-none">
      <img src={item.mediaUrl} alt={`${item.title} - after`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={item.beforeUrl} alt={`${item.title} - before`} loading="lazy" className="absolute inset-0 h-full w-full max-w-none object-cover" style={{ width: '100%', minWidth: '100%' }} />
      </div>
      <div className="pointer-events-none absolute bottom-0 top-0 w-0.5 bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)]" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#2D1B11] text-xs font-bold text-[#D4AF37]">⇄</div>
      </div>
      <span className="pointer-events-none absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Before</span>
      <span className="pointer-events-none absolute right-2 top-2 rounded bg-[#D4AF37] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2A1810]">After</span>
      <input
        type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))}
        className="absolute inset-0 z-10 h-full w-full cursor-ew-resize opacity-0" aria-label={`Drag to compare before and after: ${item.title}`}
      />
    </div>
  );
};

const Lightbox: React.FC<{ item: GalleryItem; onClose: () => void; onBook: (serviceId: string) => void }> = ({ item, onClose, onBook }) => {
  const ref = useModalA11y<HTMLDivElement>(true, onClose);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-3 sm:p-6" onClick={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={item.title} className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-[#140D08] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex min-h-0 flex-1 items-center justify-center bg-black">
          {item.mediaType === 'video' ? (
            <video src={item.mediaUrl} controls autoPlay playsInline className="max-h-[70vh] w-full" />
          ) : item.beforeUrl ? (
            <div className="aspect-[4/3] max-h-[70vh] w-full"><BeforeAfter item={item} /></div>
          ) : (
            <img src={item.mediaUrl} alt={item.title} className="max-h-[70vh] w-full object-contain" />
          )}
        </div>
        <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">{item.category}</p>
            <h2 className="font-serif-luxury text-xl font-bold text-[#FAF6F0]">{item.title}</h2>
            {item.description && <p className="mt-1 text-sm text-[#DFCEBC]">{item.description}</p>}
          </div>
          {item.serviceId && (
            <button type="button" onClick={() => { onClose(); onBook(item.serviceId!); }} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-[#2A1810] hover:bg-[#E5C158] cursor-pointer">
              Book this look <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const StyleCard: React.FC<{ item: GalleryItem; onOpen: (i: GalleryItem) => void; onBook: (serviceId: string) => void }> = ({ item, onOpen, onBook }) => (
  <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#DFCEBC] bg-white shadow-sm transition hover:shadow-xl">
    <button type="button" onClick={() => onOpen(item)} className="relative block aspect-[4/5] w-full overflow-hidden bg-[#1C130D] text-left cursor-pointer" aria-label={`${item.mediaType === 'video' ? 'Watch' : 'View'} ${item.title}`}>
      {item.mediaType === 'video' ? (
        <>
          <video src={`${item.mediaUrl}#t=0.1`} preload="metadata" muted playsInline className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37] text-[#2A1810] shadow-lg"><Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden="true" /></span>
          </span>
        </>
      ) : (
        <img src={item.mediaUrl} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      )}
      <span className="absolute left-2 top-2 flex gap-1">
        {item.featured && <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 text-[10px] font-bold uppercase text-[#2A1810]">★ Featured</span>}
        {item.mediaType === 'video' && <span className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-white"><Film className="h-3 w-3" aria-hidden="true" /> Video</span>}
        {item.beforeUrl && <span className="rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-white">Before / After</span>}
      </span>
    </button>
    <div className="flex flex-1 flex-col gap-2 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8F6A1E]">{item.category}</p>
      <h3 className="font-serif-luxury text-lg font-bold leading-snug text-[#2D1B11]">{item.title}</h3>
      {item.description && <p className="line-clamp-2 text-xs leading-relaxed text-[#553823]">{item.description}</p>}
      {item.serviceId && (
        <button type="button" onClick={() => onBook(item.serviceId!)} className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full bg-[#2D1B11] px-3.5 py-1.5 text-xs font-semibold text-[#F9E498] hover:bg-[#442718] active:scale-95 transition cursor-pointer">
          Book this look <ArrowRight className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
        </button>
      )}
    </div>
  </article>
);

export const BeforeAfterGallery: React.FC<BeforeAfterGalleryProps> = ({ onBookTransformation }) => {
  const [uploaded, setUploaded] = useState<GalleryItem[] | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [kind, setKind] = useState<'all' | 'image' | 'video'>('all');
  const [open, setOpen] = useState<GalleryItem | null>(null);

  useEffect(() => {
    let alive = true;
    api.gallery().then((rows) => alive && setUploaded(rows)).catch(() => alive && setUploaded([]));
    return () => {
      alive = false;
    };
  }, []);

  const items = uploaded === null ? null : uploaded.length > 0 ? uploaded : SAMPLES;

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    (items ?? []).forEach((i) => counts.set(i.category, (counts.get(i.category) ?? 0) + 1));
    return [...counts.entries()];
  }, [items]);

  const results = useMemo(() => {
    if (!items) return [];
    const base = items.filter((i) => (category === 'All' || i.category === category) && (kind === 'all' || i.mediaType === kind));
    return query.trim() ? searchGallery(base, query).map((r) => r.item) : base;
  }, [items, category, kind, query]);

  const browsing = !query.trim() && category === 'All' && kind === 'all';
  const sections = useMemo(() => {
    if (!browsing || !items) return [];
    const featured = items.filter((i) => i.featured);
    const byCat = categories.map(([name]) => ({ title: name, rows: items.filter((i) => i.category === name && !i.featured) }));
    return [...(featured.length ? [{ title: '★ Featured', rows: featured }] : []), ...byCat].filter((s) => s.rows.length);
  }, [browsing, items, categories]);

  const grid = (rows: GalleryItem[]) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((i) => <StyleCard key={i.id} item={i} onOpen={setOpen} onBook={onBookTransformation} />)}
    </div>
  );

  const chip = (active: boolean) =>
    `shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${active ? 'bg-[#2D1B11] text-[#D4AF37] shadow-sm' : 'border border-[#DFCEBC] bg-white text-[#6C4A32] hover:border-[#D4AF37]'}`;

  return (
    <div className="mx-auto w-full max-w-6xl animate-fade-in space-y-6 rounded-3xl bg-[#FAF7F2] p-4 text-[#2D1B11] sm:p-8">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#8F6A1E]">
          <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" /> Our work
        </div>
        <h1 className="font-serif-luxury text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Style Gallery</h1>
        <p className="mx-auto max-w-2xl text-sm text-[#6C4A32] sm:text-base">
          Real hair styled by Rose Iyaji. Browse by style, watch the videos, or describe the look you want and we’ll find it.
        </p>
      </div>

      <div className="sticky top-[68px] z-30 space-y-3 rounded-xl border border-[#DFCEBC] bg-white/95 p-3 shadow-sm backdrop-blur-sm sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F6A1E]" aria-hidden="true" />
          <label htmlFor="gallery-search" className="sr-only">Search styles</label>
          <input
            id="gallery-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or describe a style…"
            className="w-full rounded-full border border-[#DFCEBC] bg-[#FAF7F2] py-2.5 pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden text-sm text-[#2D1B11] placeholder:text-[#8C6D53]/70 focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#6C4A32] hover:bg-black/5 cursor-pointer">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter by category">
          <button type="button" onClick={() => setCategory('All')} aria-pressed={category === 'All'} className={chip(category === 'All')}>All</button>
          {categories.map(([name, n]) => (
            <button key={name} type="button" onClick={() => setCategory(name)} aria-pressed={category === name} className={chip(category === name)}>
              {name} <span className="opacity-60">{n}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5" role="group" aria-label="Filter by type">
            {([['all', 'All', null], ['image', 'Photos', ImageIcon], ['video', 'Videos', Film]] as const).map(([id, label, Icon]) => (
              <button key={id} type="button" onClick={() => setKind(id)} aria-pressed={kind === id} className={`${chip(kind === id)} inline-flex items-center gap-1`}>
                {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}{label}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#6C4A32]" aria-live="polite">
            {items ? `${results.length} ${results.length === 1 ? 'style' : 'styles'}${query.trim() ? ` for “${query.trim()}”` : ''}` : 'Loading…'}
          </p>
        </div>
      </div>

      {!items ? (
        <p className="py-16 text-center text-sm text-[#6C4A32]">Loading the gallery…</p>
      ) : results.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-dashed border-[#DFCEBC] bg-white/70 px-4 py-12 text-center">
          <p className="font-serif-luxury text-xl font-bold">No styles match that yet</p>
          <p className="text-sm text-[#6C4A32]">Try fewer words, or one of these:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => <button key={s} type="button" onClick={() => { setQuery(s); setCategory('All'); setKind('all'); }} className={chip(false)}>{s}</button>)}
          </div>
          <button type="button" onClick={() => { setQuery(''); setCategory('All'); setKind('all'); }} className="text-xs font-semibold text-[#8F6A1E] underline cursor-pointer">Show everything</button>
        </div>
      ) : browsing ? (
        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.title} aria-labelledby={`g-${s.title}`} className="space-y-4">
              <h2 id={`g-${s.title}`} className="flex items-center gap-3 font-cinzel text-lg font-bold uppercase tracking-wider text-[#2D1B11]">
                {s.title}<span className="h-px flex-1 bg-gradient-to-r from-[#D4AF37]/50 to-transparent" />
              </h2>
              {grid(s.rows)}
            </section>
          ))}
        </div>
      ) : (
        grid(results)
      )}

      {open && <Lightbox item={open} onClose={() => setOpen(null)} onBook={onBookTransformation} />}
    </div>
  );
};
