import { Link } from 'react-router-dom';
import { ksh } from '../lib/api.js';

export function HouseCard({ p }) {
  return (
    <Link to={`/houses/${p.slug}/`} className="lift zoom block bg-white rounded-2xl border overflow-hidden">
      {p.thumb
        ? <img src={p.thumb} alt={p.title} width="400" height="176" loading="lazy" className="h-44 w-full object-cover" />
        : <div className="h-44 grid place-items-center bg-gradient-to-br from-mist to-sky/40 text-5xl" aria-hidden="true">🏠</div>}
      <div className="p-4 space-y-1">
        <div className="flex flex-wrap gap-1">
          {p.verified
            ? <span className="text-xs font-bold bg-green-100 text-green-800 rounded px-2 py-0.5">✓ AMOX Verified</span>
            : <span className="text-xs font-bold bg-amber-100 text-amber-800 rounded px-2 py-0.5">{p.verification_label}</span>}
          {p.units_vacant ? <span className="text-xs font-bold bg-sky/15 text-navy rounded px-2 py-0.5">{p.units_vacant} vacant</span> : null}
        </div>
        <h3 className="font-bold text-navy text-lg">{p.title}</h3>
        <p className="text-slate-500 text-sm">📍 {p.area} · {p.house_type}{Number(p.km) > 0 ? ` · ${p.km} km away` : ''}</p>
        <p className="text-brand font-extrabold text-xl">KSh {ksh(p.rent)}<span className="text-sm font-normal text-slate-500"> /month</span></p>
        <div className="flex flex-wrap gap-1">{p.amenities.map((a) => <span key={a} className="text-xs bg-mist text-navy rounded px-2 py-0.5">{a}</span>)}</div>
        <span className="inline-block mt-2 text-sm font-semibold text-brand">View details</span>
      </div>
    </Link>
  );
}

export function PostCard({ p }) {
  return (
    <Link to={`/blog/${p.slug}/`} className="lift zoom block min-w-0 overflow-hidden rounded-2xl border bg-white">
      {p.cover
        ? <img src={p.cover} alt="" width="640" height="360" loading="lazy" className="aspect-[16/9] w-full object-cover" />
        : <div className="grid aspect-[16/9] w-full place-items-center bg-gradient-to-br from-sky to-brand text-5xl font-extrabold text-white/80" aria-hidden="true">{p.title.slice(0, 1)}</div>}
      <div className="p-4">
        <span className="rounded bg-mist px-2 py-0.5 text-xs font-bold text-navy">{p.category}</span>
        <h3 className="mt-2 font-bold leading-snug text-navy">{p.title}</h3>
        <p className="mt-1 line-clamp-3 text-sm text-slate-600">{p.summary}</p>
        <p className="mt-2 text-xs text-slate-400">{p.published} · {p.read_minutes} min read</p>
      </div>
    </Link>
  );
}

export const Stars = ({ rating }) => (
  <span className="inline-flex text-lg leading-none" role="img" aria-label={`${rating} out of 5 stars`}>
    {[0, 1, 2, 3, 4].map((i) => <span key={i} className={i < rating ? 'text-amber-400' : 'text-slate-300'}>★</span>)}
  </span>
);

export function ReviewBody({ r, clamp = false, showMeta = false }) {
  return (
    <>
      <Stars rating={r.rating} />
      <blockquote className={clamp ? 'mt-2 line-clamp-5 text-sm text-slate-700' : 'mt-2 text-slate-700'}>“{r.text}”</blockquote>
      <figcaption className="mt-3 text-sm"><b className="text-navy">{r.name}</b>{r.role ? <> · <span className="text-slate-500">{r.role}</span></> : null}
        {showMeta ? <span className="block text-xs text-slate-400">{r.service} · {r.date}</span> : null}
      </figcaption>
    </>
  );
}

export const Loading = () => <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500" role="status">Loading…</div>;
