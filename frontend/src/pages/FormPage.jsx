import DynamicForm from '../components/DynamicForm.jsx';
import { Loading } from '../components/Cards.jsx';
import NotFound from './NotFound.jsx';
import { getBoot, useApi, useMeta } from '../lib/api.js';

/** Shared page for the request / contact / list-your-property / provider forms. */
export default function FormPage({ apiPath, postTo }) {
  const b = getBoot();
  const { data, error } = useApi(apiPath);
  useMeta(data ? `${data.title} | AMOXHomes` : undefined);
  if (error) return <NotFound />;
  if (!data) return <Loading />;
  const partners = data.partners || [];
  return (
    <>
      <section className="bg-mist py-10"><div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold text-navy">{data.title}</h1><p className="text-slate-600 mt-2">{data.intro}</p>
      </div></section>
      <section className="max-w-2xl mx-auto px-4 mt-8">
        {data.area_options?.length > 0 && <datalist id="area-options">{data.area_options.map((a) => <option key={a} value={a} />)}</datalist>}
        {partners.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-navy">Options in your area</h2>
            <div className="grid gap-3 mt-3 mb-6">
              {partners.map((pv, i) => (
                <div key={i} className="bg-mist rounded-2xl p-4">
                  <b className="text-navy">{pv.business}</b>{pv.package ? ` · ${pv.package}` : ''}
                  <p className="text-sm text-slate-700">{pv.speed ? `${pv.speed} · ` : ''}{pv.price || ''}{pv.install_fee ? ` · Installation: ${pv.install_fee}` : ''}</p>
                  {pv.coverage && <p className="text-xs text-slate-500">Covers: {pv.coverage}</p>}
                  {pv.details && <p className="text-sm text-slate-600">{pv.details}</p>}
                </div>
              ))}
              <p className="text-xs text-slate-500">Send the form below and we will introduce you to the right provider.</p>
            </div>
          </>
        )}
        <div className="bg-white border rounded-2xl p-5"><DynamicForm schema={data.form} postTo={postTo} btn={data.btn} /></div>
        {data.contact && (
          <div className="flex flex-wrap gap-3 mt-6">
            <a className="bg-green-600 text-white rounded-full px-5 py-2" href={b.wa}>WhatsApp</a>
            <a className="border-2 border-navy text-navy rounded-full px-5 py-2" href={`tel:${b.phone}`}>Call {b.phone}</a>
            <a className="border-2 border-navy text-navy rounded-full px-5 py-2" href={`mailto:${b.email}`}>Email</a>
          </div>
        )}
      </section>
    </>
  );
}
