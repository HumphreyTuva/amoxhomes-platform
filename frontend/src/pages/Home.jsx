import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Acc from '../components/Acc.jsx';
import { HouseCard, Loading, PostCard, ReviewBody } from '../components/Cards.jsx';
import { Icon } from '../components/Icons.jsx';
import Reveal from '../components/Reveal.jsx';
import { getBoot, useApi, useMeta } from '../lib/api.js';

export default function Home() {
  const b = getBoot();
  const nav = useNavigate();
  const { data } = useApi('/api/site/home/');
  const [s, setS] = useState(b.institutions[0]?.slug || '');
  useMeta('AMOXHomes | Houses & Settlement Support in Malindi');
  if (!data) return <Loading />;
  const { featured, reviews, posts, ticker, ticker_secs: secs, services } = data;

  return (
    <>
      <section className="relative isolate overflow-hidden text-white min-h-[880px] md:min-h-[600px] flex items-start md:items-center">
        <picture>
          <source media="(min-width:768px)" srcSet={b.assets.hero_desktop} />
          <img src={b.assets.hero_mobile} alt="A student with her books looking over the Malindi coastline" width="720" height="1298" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover md:object-[50%_30%] kb" />
        </picture>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/90 via-navy/40 to-transparent md:bg-gradient-to-r md:from-navy/90 md:via-navy/50 md:to-transparent"></div>
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-20 pb-28 w-full">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-2xl rise" style={{ '--d': 0 }}>Are you relocating? <span className="gradtext">We've got you.</span></h1>
          <p className="mt-3 md:mt-4 text-sm md:text-lg max-w-xl text-blue-50 rise" style={{ '--d': 1 }}>Whether you're moving for university, college, attachment, internship, work or business, AMOXHomes finds you a home and arranges the essentials to settle in.</p>
          <div className="flex flex-wrap gap-3 mt-6 rise" style={{ '--d': 2 }}>
            <Link to="/houses/" className="shine hover:scale-105 transition bg-coral text-slate-900 font-semibold rounded-full px-6 py-3">Find a House</Link>
            <Link to="/services/" className="border-2 border-white rounded-full px-6 py-3 font-semibold hover:bg-white/15 transition">Settle-in Services</Link>
          </div>
        </div>
        <div className="hidden md:flex absolute right-4 top-24 gap-2 flex-col items-end" aria-hidden="true"><span className="bob bg-white/90 text-navy font-semibold text-sm rounded-full px-4 py-2 shadow-lg">✓ AMOX Verified</span></div>
        <div className="hidden md:block absolute right-10 bottom-28" aria-hidden="true"><span className="bob bg-white/90 text-navy font-semibold text-sm rounded-full px-4 py-2 shadow-lg" style={{ '--d': '-2s' }}>📶 Wi-Fi ready</span></div>
        <svg className="absolute bottom-0 left-0 w-full h-10 md:h-14 text-white" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="M0 30c240 40 480 40 720 10s480-30 720 5v15H0z" /></svg>
      </section>

      {b.institutions.length > 0 && (
        <div className="relative z-10 -mt-16 max-w-6xl mx-auto px-4">
          <form onSubmit={(e) => { e.preventDefault(); nav(`/houses/near/${s}/`); }} className="bg-white rounded-2xl p-4 grid gap-3 md:grid-cols-[1fr_auto] items-end shadow-xl max-w-2xl">
            <label className="text-sm font-bold text-navy">I'm moving to
              <select value={s} onChange={(e) => setS(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 font-normal">
                {b.institutions.map((i) => <option key={i.slug} value={i.slug}>{i.name}</option>)}
              </select>
            </label>
            <button className="bg-brand text-white font-semibold rounded-full px-6 py-3">Show Homes Nearby</button>
          </form>
        </div>
      )}

      {ticker.length > 0 && (
        <div className="mt-12 bg-mist py-3 overflow-hidden text-navy font-semibold" role="region" aria-label="Announcements">
          <div className="marquee whitespace-nowrap" style={{ animationDuration: `${secs}s` }}>
            {[0, 1].map((c) => (
              <div key={c} className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={c ? 'true' : undefined}>
                {ticker.map((a, i) => (
                  <span key={i} className="contents">
                    {a.link
                      ? <a href={a.link} className="hover:underline" {...(a.link.slice(0, 4) === 'http' ? { target: '_blank', rel: 'noopener' } : {})}>{a.text}</a>
                      : <span>{a.text}</span>}
                    <span className="text-sky" aria-hidden="true">•</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="max-w-6xl mx-auto px-4 mt-14">
        <h2 className="text-3xl font-extrabold text-navy">Make your new place feel like home</h2>
        <p className="text-slate-600">Internet, gas, furniture and movers, arranged for you in one place.</p>
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          {services.map((x, i) => (
            <Reveal as={Link} key={x.key} to={`/request/${x.key}/`} d={i} className="lift zoom flex items-center gap-4 bg-white border rounded-2xl p-4">
              <span className="block shrink-0 overflow-hidden rounded-xl"><img src={x.img} alt="" width="144" height="112" loading="lazy" className="h-24 w-28 sm:h-28 sm:w-36 object-cover" /></span>
              <span><h3 className="font-bold text-navy leading-snug">{x.title}</h3><p className="text-sm text-slate-600 mt-1">{x.text}</p></span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-mist mt-14 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-navy">Featured houses</h2>
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            {featured.length
              ? featured.map((p, i) => <Reveal key={p.slug} className="min-w-0" d={i}><HouseCard p={p} /></Reveal>)
              : <p className="text-slate-600">New listings are coming soon. <Link className="text-brand underline" to="/request/house/">Ask us to find one for you</Link>.</p>}
          </div>
          <Link to="/houses/" className="inline-block mt-6 border-2 border-navy text-navy font-semibold rounded-full px-6 py-2">See all houses</Link>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mt-14">
          <div className="flex items-end justify-between gap-3"><h2 className="text-3xl font-extrabold text-navy">What our clients say</h2><Link className="whitespace-nowrap text-sm font-semibold text-brand" to="/reviews/">All reviews →</Link></div>
          <div className="-mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {reviews.map((r, i) => (
              <Reveal as="figure" key={i} d={i} className="w-[85%] shrink-0 snap-start break-words rounded-2xl border bg-white p-5 sm:w-80 md:w-auto"><ReviewBody r={r} clamp /></Reveal>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mt-14">
          <div className="flex items-end justify-between gap-3"><h2 className="text-3xl font-extrabold text-navy">From the blog</h2><Link className="whitespace-nowrap text-sm font-semibold text-brand" to="/blog/">All articles →</Link></div>
          <div className="-mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {posts.map((p, i) => <Reveal key={p.slug} d={i} className="w-[85%] shrink-0 snap-start sm:w-80 md:w-auto"><PostCard p={p} /></Reveal>)}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 mt-10">
        <Acc className="rounded-2xl border bg-white px-5 py-4 shadow-sm" summaryClassName="flex items-center justify-between text-xl font-extrabold text-navy" summary={<>How it works<Icon n="chev" className="chev h-5 w-5 text-brand" /></>}>
          <ol className="grid gap-3 md:grid-cols-3 mt-4 list-decimal list-inside marker:font-bold marker:text-brand">
            <li className="bg-mist rounded-xl p-4"><b className="text-navy">Tell us what you need</b><p className="text-slate-600 text-sm mt-1">Search by institution, budget and house type, or send us your requirements.</p></li>
            <li className="bg-mist rounded-xl p-4"><b className="text-navy">Request a connection</b><p className="text-slate-600 text-sm mt-1">See the house and its surroundings, then ask us to connect you to the landlord.</p></li>
            <li className="bg-mist rounded-xl p-4"><b className="text-navy">Move in and settle</b><p className="text-slate-600 text-sm mt-1">Add internet, gas, a mattress and movers in the same conversation.</p></li>
          </ol>
        </Acc>
      </section>

      <section className="max-w-6xl mx-auto px-4 mt-6">
        <Reveal className="lift md:flex items-center justify-between gap-4 bg-sand border border-coral/40 rounded-2xl p-6">
          <div><h2 className="text-2xl font-extrabold text-navy">Are you a property manager?</h2><p className="mt-1 text-slate-700">List your houses with AMOXHomes and reach students and professionals looking for a place.</p></div>
          <Link to="/landlords/list/" className="inline-block mt-4 md:mt-0 shrink-0 bg-coral text-slate-900 font-semibold rounded-full px-5 py-2">List Your Property</Link>
        </Reveal>
      </section>
    </>
  );
}
