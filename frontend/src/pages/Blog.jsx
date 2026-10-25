import { Link, useLocation, useParams } from 'react-router-dom';
import { Loading, PostCard } from '../components/Cards.jsx';
import NotFound from './NotFound.jsx';
import Reveal from '../components/Reveal.jsx';
import { getBoot, useApi, useMeta } from '../lib/api.js';

export function BlogList() {
  const b = getBoot();
  const loc = useLocation();
  const c = new URLSearchParams(loc.search).get('c') || '';
  const { data } = useApi(`/api/site/blog/${c ? `?${new URLSearchParams({ c })}` : ''}`, { keep: true });
  useMeta('Blog | AMOXHomes', 'Tips, guides and news about finding a home and settling into Malindi and Kilifi.');
  if (!data) return <Loading />;
  const pill = (on) => `whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold ${on ? 'bg-navy text-white' : 'bg-white text-slate-600 hover:bg-white/70'}`;
  return (
    <>
      <section className="bg-mist py-10"><div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold text-navy">Blog</h1><p className="mt-1 max-w-2xl text-slate-600">Tips, guides and news to help you find a home and settle in.</p>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <Link to="/blog/" className={pill(!data.cat)}>All</Link>
          {b.blog_categories.map(([k, l]) => <Link key={k} to={`/blog/?c=${k}`} className={pill(data.cat === k)}>{l}</Link>)}
        </div>
      </div></section>
      <div className="max-w-6xl mx-auto px-4 mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.posts.length
          ? data.posts.map((p, i) => <Reveal key={p.slug} className="min-w-0" d={i}><PostCard p={p} /></Reveal>)
          : <p className="md:col-span-2 lg:col-span-3 rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center text-slate-500">New articles are coming soon.</p>}
      </div>
    </>
  );
}

// Django's |linebreaks: blank line = new paragraph, single line break = <br>
const paragraphs = (body) => body.replace(/\r\n?/g, '\n').split(/\n{2,}/);

export function BlogDetail() {
  const { slug } = useParams();
  const { data: p, error } = useApi(`/api/site/blog/${slug}/`);
  useMeta(p ? `${p.title} | AMOXHomes` : undefined, p?.summary);
  if (error) return <NotFound />;
  if (!p) return <Loading />;
  return (
    <>
      <article className="max-w-3xl mx-auto px-4 mt-8">
        <Link to="/blog/" className="text-sm font-semibold text-brand">← All articles</Link>
        <p className="mt-4"><span className="rounded bg-mist px-2 py-0.5 text-xs font-bold text-navy">{p.category}</span> <span className="ml-1 text-xs text-slate-400">{p.published} · {p.read_minutes} min read</span></p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight text-navy">{p.title}</h1><p className="mt-2 text-lg text-slate-600">{p.summary}</p>
        {p.cover && <img src={p.cover} alt="" width="1200" height="675" className="mt-5 w-full rounded-2xl object-cover" />}
        <div className="mt-6 space-y-4 break-words text-[17px] leading-relaxed text-slate-700">
          {paragraphs(p.body).map((para, i) => (
            <p key={i}>{para.split('\n').map((line, j, a) => <span key={j}>{line}{j < a.length - 1 && <br />}</span>)}</p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-5">
          <a href={`https://wa.me/?text=${encodeURIComponent(p.share)}`} target="_blank" rel="noopener" className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white">Share on WhatsApp</a>
          <Link to="/houses/" className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white">Find a House</Link>
        </div>
      </article>
      {p.related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mt-12"><h2 className="text-xl font-extrabold text-navy">More to read</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">{p.related.map((r) => <div key={r.slug} className="min-w-0"><PostCard p={r} /></div>)}</div>
        </section>
      )}
    </>
  );
}
