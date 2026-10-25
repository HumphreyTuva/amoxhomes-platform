import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loading } from '../components/Cards.jsx';
import DynamicForm from '../components/DynamicForm.jsx';
import NotFound from './NotFound.jsx';
import { ksh, useApi, useMeta } from '../lib/api.js';

function Photo({ url, alt, open }) {
  return (
    <button type="button" className="contents" onClick={() => open(url)} aria-label="View photo larger">
      <img src={url} alt={alt} width="400" height="160" loading="lazy" className="rounded-xl w-full h-40 object-cover" />
    </button>
  );
}

export default function HouseDetail() {
  const { slug } = useParams();
  const { data: p, error } = useApi(`/api/site/houses/${slug}/`);
  const [src, setSrc] = useState(null);
  useMeta(p ? `${p.title}, ${p.area} | AMOXHomes` : undefined, p ? `${p.title} in ${p.area}, KSh ${p.rent} per month.` : undefined);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') setSrc(null); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);
  if (error) return <NotFound />;
  if (!p) return <Loading />;

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 mt-6 grid gap-8 md:grid-cols-[1.6fr_1fr]">
        <div>
          {!p.is_available && <p className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 rounded p-3 mb-3" role="status"><b>This house is no longer available.</b> <Link className="underline" to="/houses/">See similar houses</Link> or <Link className="underline" to="/request/house/">ask us to find one</Link>.</p>}
          {p.verified
            ? <span className="text-xs font-bold bg-green-100 text-green-800 rounded px-2 py-0.5">✓ AMOX Verified{p.verified_on ? ` on ${p.verified_on}` : ''}</span>
            : <span className="text-xs font-bold bg-amber-100 text-amber-800 rounded px-2 py-0.5">{p.verification_label}</span>}
          <h1 className="text-3xl font-extrabold text-navy mt-2">{p.title}</h1>
          <p className="text-slate-500">📍 {p.area}{p.estate ? `, ${p.estate}` : ''} · {p.house_type}</p>

          <h2 className="text-xl font-bold text-navy mt-6">Inside the house</h2>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {p.inside.length ? p.inside.map((u) => <Photo key={u} url={u} alt={`Inside ${p.title}`} open={setSrc} />) : <p className="col-span-2 text-slate-500 text-sm">Photos coming soon.</p>}
          </div>

          <h2 className="text-xl font-bold text-navy mt-6">Around the house</h2>
          <p className="text-slate-600">{p.environment || 'Neighbourhood details coming soon.'}</p>
          {p.nearby.length > 0 && <ul className="mt-2 grid gap-1 text-sm">{p.nearby.map(([k, v]) => <li key={k}><b className="text-navy">{k}:</b> {v}</li>)}</ul>}
          <div className="grid grid-cols-2 gap-2 mt-2">{p.around.map((u) => <Photo key={u} url={u} alt={`Around ${p.title}`} open={setSrc} />)}</div>
          {p.videos.map((u) => <video key={u} controls preload="none" playsInline className="w-full rounded-xl mt-3" src={u}></video>)}

          <h2 className="text-xl font-bold text-navy mt-6">About this house</h2>
          <p className="text-slate-700 whitespace-pre-line">{p.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">{p.amenities.map((a) => <span key={a} className="bg-mist text-navy text-sm rounded px-2 py-1">{a}</span>)}</div>
          {p.distances.length > 0 && (
            <>
              <h2 className="text-xl font-bold text-navy mt-6">Distance from</h2>
              <ul className="divide-y mt-2">{p.distances.map((d) => <li key={d.slug} className="flex justify-between py-2"><Link className="text-brand" to={`/houses/near/${d.slug}/`}>{d.name}</Link><b>{d.km} km</b></li>)}</ul>
            </>
          )}
          <p className="text-sm text-slate-500 mt-4">Only the general area is shown. The exact location and landlord details are shared after you request a connection.</p>
        </div>

        <aside id="interested">
          <div className="bg-white border rounded-2xl p-5 md:sticky md:top-20">
            <p className="text-3xl font-extrabold text-brand">KSh {ksh(p.rent)}<span className="text-base font-normal text-slate-500"> /month</span></p>
            <p className="text-sm text-slate-600 mb-4">Deposit: KSh {ksh(p.deposit)} · {p.units_vacant} vacant</p>
            {p.is_available && <><h2 className="font-bold text-navy mb-2">I'm interested</h2><DynamicForm schema={p.form} postTo={`/api/site/houses/${p.slug}/inquiry/`} btn="Send inquiry" /></>}
            <a href={`https://wa.me/?text=${encodeURIComponent(p.share)}`} target="_blank" rel="noopener" className="block text-center text-sm font-semibold text-green-700 mt-3">Share this house on WhatsApp</a>
            <p className="text-xs text-slate-500 mt-3">Do not pay before viewing. <a className="underline" href={p.report_wa} target="_blank" rel="noopener">Report this listing</a></p>
          </div>
        </aside>

        {src && <div onClick={() => setSrc(null)} className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-3" role="dialog" aria-label="Photo"><img src={src} alt="" className="max-h-full max-w-full rounded-lg" /></div>}
      </div>
      {p.is_available && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t p-3 flex gap-2">
          <a href="#interested" className="flex-1 text-center bg-brand text-white font-semibold rounded-full py-3">I'm interested</a>
          <a href={p.wa} target="_blank" rel="noopener" className="bg-green-600 text-white font-semibold rounded-full px-5 py-3">WhatsApp</a>
        </div>
      )}
    </>
  );
}
