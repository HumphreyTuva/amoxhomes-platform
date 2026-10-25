import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../lib/api.js';
import Acc from './Acc.jsx';

// Same look as the old Django forms (core/forms.py CLS).
const CLS = 'w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky';
const PROFILE_KEY = 'amox_profile';   // name/phone/etc. remembered on the visitor's own device only

const readProfile = () => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'); } catch { return {}; } };

function initialValues(schema) {
  const v = {};
  for (const f of schema) v[f.name] = f.kind === 'checkbox' ? !!f.initial : f.kind === 'file' ? null : (f.initial ?? '');
  return v;
}

/**
 * Renders any form that Django describes (fields, choices, required, help text) and posts it back to Django,
 * which validates it with the original forms.py rules. `postTo` is an /api/site/... URL.
 */
export default function DynamicForm({ schema, postTo, btn = 'Send' }) {
  const nav = useNavigate();
  const [values, setValues] = useState(() => initialValues(schema));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [filled, setFilled] = useState(false);
  const alertRef = useRef(null);

  // Fill name/phone/etc. from the last visit.
  useEffect(() => {
    const p = readProfile(); let n = 0; const next = {};
    for (const f of schema) {
      const saved = f.pf && p[f.pf];
      if (!saved) continue;
      if (f.kind === 'select') { if (!f.choices.some(([v]) => v === saved)) continue; }
      else if (values[f.name]) continue;
      next[f.name] = saved; n++;
    }
    if (n) { setValues((v) => ({ ...v, ...next })); setFilled(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasErrors = Object.keys(errors).length > 0 || !!message;
  useEffect(() => { if (hasErrors) alertRef.current?.scrollIntoView({ block: 'center' }); }, [errors, message]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (name, val) => setValues((v) => ({ ...v, [name]: val }));
  const visible = (f) => !f.showif || values[f.showif[0]] === f.showif[1];

  const clearProfile = () => {
    try { localStorage.removeItem(PROFILE_KEY); } catch { /* private mode */ }
    setValues((v) => { const n = { ...v }; for (const f of schema) if (f.pf && f.kind !== 'select') n[f.name] = ''; return n; });
    setFilled(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({}); setMessage('');
    // remember contact details on this device
    const p = readProfile();
    for (const f of schema) if (f.pf && values[f.name]) p[f.pf] = values[f.name];
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch { /* private mode */ }

    const fd = new FormData();
    fd.append('website', '');   // spam trap: real visitors never fill it
    for (const f of schema) {
      if (!visible(f)) continue;
      const v = values[f.name];
      if (f.kind === 'checkbox') { if (v) fd.append(f.name, 'on'); }
      else if (f.kind === 'file') { if (v) fd.append(f.name, v); }
      else fd.append(f.name, v ?? '');
    }
    try {
      const { ok, status, data } = await apiPost(postTo, fd);
      if (ok) { nav(data.redirect || '/thanks/'); return; }
      if (data.errors) setErrors(data.errors); else setMessage(data.message || (status === 429 ? 'Too many requests. Please try again later.' : 'Something went wrong. Please try again.'));
    } catch {
      setMessage('We could not reach the server. Check your connection and try again.');
    }
    setBusy(false);
  };

  const err = (f) => (errors[f.name] || []).map((m, i) => <span key={i} className="block text-red-600 text-xs">{m}</span>);
  const help = (f) => (f.help ? <span className="text-xs font-normal text-slate-500">{f.help}</span> : null);

  const field = (f) => {
    const hidden = !visible(f);
    const common = { name: f.name, required: f.required && !hidden, disabled: hidden, autoComplete: f.autocomplete, ...(f.attrs.maxlength ? { maxLength: f.attrs.maxlength } : {}) };
    if (f.kind === 'radio') {
      return (
        <fieldset key={f.name} className="block" style={hidden ? { display: 'none' } : undefined}>
          <legend className="text-sm font-semibold text-slate-700">{f.label}{f.required ? ' *' : ''}</legend>
          <div className="mt-1 grid grid-cols-2 gap-3">
            {f.choices.map(([val, label]) => (
              <label key={val} className="cursor-pointer">
                <input type="radio" name={f.name} value={val} checked={values[f.name] === val} onChange={() => set(f.name, val)} className="peer sr-only" disabled={hidden} />
                <span className="block rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-center font-semibold text-slate-600 transition hover:border-brand peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-sky">{label}</span>
              </label>
            ))}
          </div>
          {help(f)}{err(f)}
        </fieldset>
      );
    }
    let input;
    if (f.kind === 'textarea') input = <textarea {...common} rows={f.attrs.rows || 3} className={CLS} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} />;
    else if (f.kind === 'select') input = <select {...common} className={CLS} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)}>{f.choices.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;
    else if (f.kind === 'file') input = <input type="file" name={f.name} accept={f.attrs.accept} disabled={hidden} className={CLS} onChange={(e) => set(f.name, e.target.files[0] || null)} />;
    else input = <input type={f.kind} {...common} {...(f.kind === 'tel' ? { inputMode: 'tel' } : {})} {...(f.attrs.min ? { min: f.attrs.min } : {})} list={f.list} className={CLS} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} />;
    return (
      <label key={f.name} className="block text-sm font-semibold text-slate-700" style={hidden ? { display: 'none' } : undefined}>
        {f.label}{f.required ? ' *' : ''}
        <div className="mt-1 font-normal">{input}</div>
        {help(f)}{err(f)}
      </label>
    );
  };

  const normal = schema.filter((f) => f.kind !== 'checkbox' && !f.more);
  const more = schema.filter((f) => f.kind !== 'checkbox' && f.more);
  const boxes = schema.filter((f) => f.kind === 'checkbox');
  const moreHasError = more.some((f) => errors[f.name]);

  return (
    <form onSubmit={submit} className="grid gap-4">
      {filled && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-mist px-3 py-2 text-sm text-navy">
          <span>✓ Filled in from your last visit.</span>
          <button type="button" onClick={clearProfile} className="underline font-semibold whitespace-nowrap">Not you? Clear</button>
        </div>
      )}
      {hasErrors && <p ref={alertRef} className="bg-red-50 text-red-700 text-sm rounded-lg p-3" role="alert">{message || 'Please fix the highlighted fields below.'}</p>}
      {normal.map(field)}
      {boxes.length > 0 && (
        <fieldset className="grid grid-cols-2 gap-2 border-t pt-3">
          {boxes.map((f) => (
            <label key={f.name} className="flex items-center gap-2 text-sm bg-mist/60 rounded-lg px-3 py-2">
              <input type="checkbox" name={f.name} className="h-5 w-5" checked={!!values[f.name]} onChange={(e) => set(f.name, e.target.checked)} /><span>{f.label}</span>
            </label>
          ))}
        </fieldset>
      )}
      {more.length > 0 && (
        <Acc className="rounded-xl border border-dashed border-slate-300 px-3 py-2" summaryClassName="cursor-pointer text-sm font-semibold text-brand py-1" summary="Add more details (optional)" forceOpen={moreHasError}>
          <div className="grid gap-4 mt-3">{more.map(field)}</div>
        </Acc>
      )}
      <p className="text-xs text-slate-500">By sending this you agree to our <Link className="underline" to="/privacy/">Privacy Policy</Link>. To save you typing, your name and contact details are remembered on this device only.</p>
      <button disabled={busy} className="bg-brand hover:bg-navy disabled:opacity-60 text-white font-semibold rounded-full px-6 py-3">{busy ? 'Sending…' : btn}</button>
    </form>
  );
}
