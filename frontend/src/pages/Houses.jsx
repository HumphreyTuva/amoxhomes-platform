import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import Acc from '../components/Acc.jsx';
import { HouseCard, Loading } from '../components/Cards.jsx';
import { Icon } from '../components/Icons.jsx';
import Reveal from '../components/Reveal.jsx';
import NotFound from './NotFound.jsx';
import { getBoot, useApi, useMeta } from '../lib/api.js';

const sel = 'mt-1 w-full rounded-lg border px-3 py-2 font-normal';

export default function Houses() {
  const b = getBoot();
  const { institution } = useParams();
  const loc = useLocation();
  const nav = useNavigate();
  const g = new URLSearchParams(loc.search);

  // Same rule as before: choosing a different "Near" institution moves to that institution's page.
  const near = g.get('near');
  const redirectTo = near !== null && near !== (institution || '');

  const entries = [...g.entries()].filter(([, v]) => v !== '').sort(([a], [c]) => (a < c ? -1 : a > c ? 1 : 0));
  const base = institution ? `/houses/near/${institution}/` : '/houses/';
  const apiPath = `/api/site${base}${entries.length ? `?${new URLSearchParams(entries)}` : ''}`;
  const { data, error } = useApi(apiPath, { keep: true });

  const inst = data?.inst;
  useMeta(inst ? `Houses near ${inst.name} | AMOXHomes` : 'Houses & Bedsitters in Malindi | AMOXHomes',
    inst ? `Rental houses and student accommodation near ${inst.name}, closest first.` : 'Browse bedsitters, single rooms and apartments in Malindi and Kilifi.');

  if (redirectTo) {
    const rest = new URLSearchParams(loc.search); rest.delete('near'); rest.delete('page');
    return <Navigate replace to={(near ? `/houses/near/${near}/` : '/houses/') + (rest.toString() ? `?${rest}` : '')} />;
  }
  if (error?.status === 404) return <NotFound />;
  if (!data) return <Loading />;

  const groups = b.amenity_groups.map(([title, items], gi, all) => {
    const rows = items.map(([k, l]) => [k, l, !!g.get(k)]);
    const n = rows.filter((r) => r[2]).length + (gi === all.length - 1 && g.get('verified') ? 1 : 0);   // the Verified chip sits in the last group
    return [title, rows, n];
  });
  const nActive = b.amenity_groups.flatMap(([, items]) => items).filter(([k]) => g.get(k)).length + (g.get('verified') ? 1 : 0);

  const submit = (e) => {
    e.preventDefault();
    const sp = new URLSearchParams(); let nr = '';
    for (const [k, v] of new FormData(e.currentTarget).entries()) { if (v === '') continue; if (k === 'near') nr = v; else sp.append(k, v); }
    nav((nr ? `/houses/near/${nr}/` : '/houses/') + (sp.toString() ? `?${sp}` : ''));
  };

  const pageLink = (n) => { const sp = new URLSearchParams(loc.search); sp.set('page', n); return `${base}?${sp}`; };

  return (
    <>
      <section className="bg-mist py-8"><div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold text-navy">{inst ? `Houses near ${inst.name}` : 'Find a house'}</h1>
        <p className="text-slate-600">{data.total} house{data.total === 1 ? '' : 's'} found{inst ? ', closest first' : ''}.</p>
      </div></section>
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <form key={loc.pathname + loc.search} onSubmit={submit} className="bg-white border rounded-2xl p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-6 items-end">
            {b.areas.length > 0 ? (
              <>
                {g.get('q') && <input type="hidden" name="q" defaultValue={g.get('q')} />}
                <label className="col-span-2 md:col-span-1 text-sm font-semibold">Area
                  <select name="area" defaultValue={g.get('area') || ''} className={sel}><option value="">Anywhere</option>{b.areas.map((a) => <option key={a} value={a}>{a}</option>)}</select>
                </label>
              </>
            ) : (
              <label className="col-span-2 md:col-span-1 text-sm font-semibold">Search<input name="q" defaultValue={g.get('q') || ''} placeholder="Area or estate" className={sel} /></label>
            )}
            <label className="col-span-2 md:col-span-1 text-sm font-semibold">Near
              <select name="near" defaultValue={institution || ''} className={sel}><option value="">Anywhere</option>{b.institutions.map((i) => <option key={i.slug} value={i.slug}>{i.name}</option>)}</select>
            </label>
            <label className="col-span-2 md:col-span-1 text-sm font-semibold">House type
              <select name="type" defaultValue={g.get('type') || ''} className={sel}><option value="">Any</option>{b.house_types.map((v) => <option key={v}>{v}</option>)}</select>
            </label>
            <label className="text-sm font-semibold">Min rent<input name="min" type="number" step="500" defaultValue={g.get('min') || ''} className={sel} /></label>
            <label className="text-sm font-semibold">Max rent<input name="max" type="number" step="500" defaultValue={g.get('max') || ''} className={sel} /></label>
            <button className="hidden md:block bg-brand text-white font-semibold rounded-full px-6 py-2.5">Search</button>
          </div>
          <Acc fdet defaultOpen={nActive > 0} className="mt-4 rounded-xl border bg-mist/50 px-4 py-3" summaryClassName="flex items-center justify-between font-bold text-navy"
            summary={<><span>More filters{nActive > 0 && <> <span className="ml-1 rounded-full bg-brand px-2 py-0.5 text-xs text-white">{nActive} selected</span></>}</span><Icon n="chev" className="chev h-5 w-5 text-brand md:hidden" /></>}>
            <div className="mt-3 grid gap-2 md:mt-4 md:gap-5 md:grid-cols-2 lg:grid-cols-4">
              {groups.map(([title, items, n], gi) => (
                <Acc key={title} fdet defaultOpen={n > 0} summaryClassName="flex items-center justify-between rounded-xl border bg-white px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-brand md:mb-2 md:rounded-none md:border-0 md:bg-transparent md:p-0"
                  summary={<><span>{title}{n > 0 && <> <span className="ml-1 rounded-full bg-brand px-2 py-0.5 text-[10px] text-white">{n}</span></>}</span><Icon n="chev" className="chev h-4 w-4 md:hidden" /></>}>
                  <div className="flex flex-wrap gap-2 pb-1 pt-3 md:pt-0">
                    {items.map(([k, l, on]) => (
                      <label key={k} className="cursor-pointer"><input type="checkbox" name={k} value="1" defaultChecked={on} className="peer sr-only" />
                        <span className="inline-block rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-brand peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-sky">{l}</span></label>
                    ))}
                    {gi === groups.length - 1 && (
                      <label className="cursor-pointer"><input type="checkbox" name="verified" value="1" defaultChecked={!!g.get('verified')} className="peer sr-only" />
                        <span className="inline-block rounded-full border border-green-600/40 bg-white px-3 py-1.5 text-sm font-semibold text-green-800 transition peer-checked:bg-green-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-green-500">✓ AMOX Verified only</span></label>
                    )}
                  </div>
                </Acc>
              ))}
            </div>
          </Acc>
          <button className="mt-4 w-full rounded-full bg-brand py-3 font-semibold text-white md:hidden">Search</button>
          <div className="flex items-center justify-between gap-3 mt-3">
            {!inst ? (
              <label className="text-sm text-slate-600">Sort{' '}
                <select name="sort" defaultValue={g.get('sort') || ''} onChange={(e) => { const f = e.target.form; f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); }} className="rounded-lg border px-2 py-1">
                  <option value="">Featured</option><option value="new">Newest</option><option value="price_asc">Rent: low to high</option><option value="price_desc">Rent: high to low</option>
                </select>
              </label>
            ) : <span></span>}
            {loc.search && <Link to={loc.pathname} className="text-sm font-semibold text-slate-500 underline">Clear all filters</Link>}
          </div>
        </form>

        <div className="grid gap-4 md:grid-cols-3 mt-6">
          {data.results.length ? data.results.map((p, i) => <Reveal key={p.slug} className="min-w-0" d={i}><HouseCard p={p} /></Reveal>) : (
            <div className="md:col-span-3 rounded-3xl border-2 border-coral/60 bg-gradient-to-br from-sand to-white p-8 text-center shadow-md" role="status">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-coral/25 text-navy"><Icon n="search" className="h-8 w-8" /></span>
              <h2 className="mt-4 text-2xl font-extrabold text-navy">No houses match your search yet</h2>
              <p className="mt-2 mx-auto max-w-xl text-slate-600">Try a wider budget or fewer filters. Or tell us what you need and we will find a suitable house for you.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/request/house/" className="shine rounded-full bg-brand px-7 py-3 font-semibold text-white">Find a house for me</Link>
                {loc.search && <Link to={loc.pathname} className="rounded-full border-2 border-navy px-7 py-3 font-semibold text-navy">Clear all filters</Link>}
              </div>
            </div>
          )}
        </div>
        {data.num_pages > 1 && (
          <div className="flex justify-between mt-6">
            {data.page > 1 ? <Link className="text-brand underline" to={pageLink(data.page - 1)}>← Previous</Link> : <span></span>}
            {data.page < data.num_pages && <Link className="text-brand underline" to={pageLink(data.page + 1)}>Next →</Link>}
          </div>
        )}
      </div>
    </>
  );
}
