import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loading, ReviewBody } from '../components/Cards.jsx';
import Reveal from '../components/Reveal.jsx';
import { apiPost, getBoot, useApi, useMeta } from '../lib/api.js';

const box = 'mt-1 w-full rounded-xl border px-3 py-2.5 font-normal';

export default function Reviews() {
  const b = getBoot();
  const { data } = useApi('/api/site/reviews/');
  const [f, setF] = useState({ rating: '', name: '', role: '', service: b.service_choices[0][0], text: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  useMeta('Reviews | AMOXHomes', 'What students, professionals and landlords say about AMOXHomes.');
  if (!data) return <Loading />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(false);
    const fd = new FormData();
    fd.append('website', '');
    for (const [k, v] of Object.entries(f)) fd.append(k, v);
    try {
      const r = await apiPost('/api/site/reviews/send/', fd);
      if (r.ok) { setSent(true); setF({ ...f, rating: '', name: '', role: '', text: '' }); setTimeout(() => document.querySelector('#write')?.scrollIntoView(), 0); }
      else setError(true);
    } catch { setError(true); }
    setBusy(false);
  };

  return (
    <>
      <section className="bg-mist py-10"><div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold text-navy">Reviews</h1><p className="mt-1 max-w-2xl text-slate-600">What students, professionals and landlords say about AMOXHomes.</p>
        {data.n > 0 && <p className="mt-4 inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm"><b className="text-2xl text-navy">{data.avg}</b><span className="text-amber-400 text-lg leading-none">★</span><span className="text-sm text-slate-500">from {data.n} review{data.n === 1 ? '' : 's'}</span></p>}
        <a href="#write" className="ml-2 inline-block text-sm font-semibold text-brand underline">Write a review</a>
      </div></section>
      {sent && <div className="max-w-6xl mx-auto px-4 mt-6"><p className="rounded-2xl bg-green-100 px-5 py-4 font-semibold text-green-800" role="status">Thank you! Your review was received and will appear once we have checked it.</p></div>}
      <div className="max-w-6xl mx-auto px-4 mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.rows.length
          ? data.rows.map((r, i) => <Reveal as="figure" key={i} d={i} className="min-w-0 break-words bg-white border rounded-2xl p-5"><ReviewBody r={r} showMeta /></Reveal>)
          : <p className="md:col-span-2 lg:col-span-3 rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center text-slate-500">No reviews yet. Be the first to share your experience below.</p>}
      </div>
      <section id="write" className="max-w-xl mx-auto px-4 mt-12 scroll-mt-24">
        <form onSubmit={submit} className="bg-white border rounded-2xl p-5 grid gap-4 shadow-sm">
          <h2 className="text-xl font-extrabold text-navy">Share your experience</h2>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">Please add your name, choose a rating and write at least 10 characters.</p>}
          <div><span className="block text-sm font-semibold text-slate-700">Your rating *</span>
            <div className="stars mt-1">
              {['5', '4', '3', '2', '1'].map((v) => (
                <Fragment key={v}>
                  <input type="radio" name="rating" id={`r${v}`} value={v} checked={f.rating === v} onChange={set('rating')} required />
                  <label htmlFor={`r${v}`} title={`${v} star${v === '1' ? '' : 's'}`}>★</label>
                </Fragment>
              ))}
            </div>
          </div>
          <label className="block text-sm font-semibold text-slate-700">Your name *<input name="name" maxLength="60" required value={f.name} onChange={set('name')} autoComplete="name" className={box} /></label>
          <label className="block text-sm font-semibold text-slate-700">Who are you? <span className="font-normal text-slate-400">(optional)</span><input name="role" maxLength="80" value={f.role} onChange={set('role')} placeholder="e.g. MKU student, Teacher, Landlord" className={box} /></label>
          <label className="block text-sm font-semibold text-slate-700">What did we help you with?<select name="service" value={f.service} onChange={set('service')} className={box}>{b.service_choices.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label className="block text-sm font-semibold text-slate-700">Your review *<textarea name="text" rows="4" minLength="10" maxLength="500" required value={f.text} onChange={set('text')} placeholder="Tell others what it was like" className={box}></textarea></label>
          <p className="text-xs text-slate-500">We check every review before it is shown. By sending this you agree to our <Link className="underline" to="/privacy/">Privacy Policy</Link>.</p>
          <button disabled={busy} className="rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-navy disabled:opacity-60">Send review</button>
        </form>
      </section>
    </>
  );
}
