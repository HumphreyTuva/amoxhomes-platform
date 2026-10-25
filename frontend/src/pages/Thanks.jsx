import { Link, Navigate } from 'react-router-dom';
import { Loading } from '../components/Cards.jsx';
import { getBoot, useApi, useMeta } from '../lib/api.js';

export default function Thanks() {
  const b = getBoot();
  const { data, error } = useApi('/api/site/thanks/');
  useMeta('Thank you | AMOXHomes');
  if (error) return <Navigate to="/" replace />;      // nothing was just submitted
  if (!data) return <Loading />;
  const more = data.kind === 'lead' || data.kind === 'listed';
  const links = [['internet', 'Internet', 'internet'], ['gas', 'Gas cylinder', 'gas'], ['items', 'Mattress & items', 'items'], ['moving', 'Moving help', 'moving']];
  return (
    <section className="max-w-xl mx-auto px-4 py-16 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100 text-green-700"><svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
      {data.kind === 'lead' && <><h1 className="text-3xl font-extrabold text-navy mt-3">Request received</h1><p className="mt-2 text-slate-600">Your reference is <b>#{data.ref}</b>. We have your details and will get back to you on the number you gave.</p></>}
      {data.kind === 'listed' && <><h1 className="text-3xl font-extrabold text-navy mt-3">Listing submitted</h1><p className="mt-2 text-slate-600">"{data.title}" will go live after our team reviews it.</p></>}
      {data.kind === 'provider' && <><h1 className="text-3xl font-extrabold text-navy mt-3">Registration received</h1><p className="mt-2 text-slate-600">We will contact you once your business is approved.</p></>}
      {more && (
        <div className="mt-10 text-left"><h2 className="font-bold text-navy">Settling in? We can help with that too</h2>
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm font-semibold text-navy">
            {links.map(([k, label]) => (
              <Link key={k} className="flex items-center gap-3 border rounded-xl p-2 transition hover:bg-mist" to={`/request/${k}/`}>
                <img src={b.assets[k]} alt="" width="40" height="40" className="h-10 w-10 shrink-0 rounded-lg object-cover" /><span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <p className="mt-6"><Link className="text-brand underline" to="/">Back to home</Link></p>
    </section>
  );
}
