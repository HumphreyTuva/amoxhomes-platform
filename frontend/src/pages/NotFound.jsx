import { Link } from 'react-router-dom';
import { useMeta } from '../lib/api.js';

export default function NotFound() {
  useMeta('Page not found | AMOXHomes');
  return (
    <section className="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-extrabold text-navy">Page not found</h1>
      <p className="mt-2 text-slate-600">That page may have moved, or the house is no longer listed.</p>
      <Link to="/houses/" className="inline-block mt-6 bg-brand text-white font-semibold rounded-full px-6 py-3">Find a House</Link>
    </section>
  );
}
