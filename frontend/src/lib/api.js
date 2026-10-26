import { useEffect, useState } from 'react';

const readJson = (id) => {
  try { return JSON.parse(document.getElementById(id)?.textContent || 'null'); } catch { return null; }
};

// Images that ship with the frontend (frontend/public/img). They load from the same host as the page
// (Netlify's CDN, or Django's /static/app/), so they never wait for the API or for PythonAnywhere.
const IMG = {
  hero_desktop: 'hero-desktop.webp', hero_mobile: 'hero-mobile.webp', logo: 'logo-sm.png', menu_house: 'menu-house.webp',
  internet: 'services/internet.webp', gas: 'services/gas.webp', items: 'services/items.webp', moving: 'services/moving.webp', other: 'services/other.webp',
};
const withLocalImages = (b) => {
  if (b) b.assets = { ...b.assets, ...Object.fromEntries(Object.entries(IMG).map(([k, f]) => [k, `${import.meta.env.BASE_URL}img/${f}`])) };
  return b;
};

// Django puts site settings and the current page's data into the HTML, so the first paint needs no API call.
let boot = withLocalImages(readJson('amox-boot'));
let preload = readJson('amox-preload') || {};

export const getBoot = () => boot;
export async function loadBoot() {            // only used by `npm run dev`, where Django does not render index.html
  if (!boot) boot = withLocalImages(await (await fetch('/api/site/boot/')).json());
  return boot;
}
export const expirePreload = () => { preload = {}; };   // after the first client-side navigation, always ask the server

export const csrf = () => (document.cookie.match(/(?:^|; )csrftoken=([^;]+)/) || [])[1] || '';

export async function apiGet(path, signal) {
  const r = await fetch(path, { headers: { Accept: 'application/json' }, credentials: 'same-origin', signal });
  if (!r.ok) { const e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
  return r.json();
}

export async function apiPost(path, formData) {
  const r = await fetch(path, { method: 'POST', body: formData, credentials: 'same-origin', headers: { 'X-CSRFToken': csrf(), Accept: 'application/json' } });
  let data = {};
  try { data = await r.json(); } catch { /* not JSON */ }
  return { ok: r.ok, status: r.status, data };
}

/** GET a JSON endpoint. keep=true keeps showing the previous result while the next one loads (used by the house list). */
export function useApi(path, { keep = false } = {}) {
  const [s, setS] = useState(() => {
    const d = preload[path];
    delete preload[path];                       // use the server-preloaded data once
    return { path, data: d === undefined ? null : d, error: null };
  });
  useEffect(() => {
    if (s.path === path && (s.data || s.error)) return;
    const ac = new AbortController();
    let live = true;
    apiGet(path, ac.signal)
      .then((data) => live && setS({ path, data, error: null }))
      .catch((error) => { if (live && error.name !== 'AbortError') setS({ path, data: null, error }); });
    return () => { live = false; ac.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  const ready = s.path === path;
  return { data: ready || keep ? s.data : null, error: ready ? s.error : null, loading: !(ready && (s.data || s.error)) };
}

export const DEFAULT_DESC = 'Houses, bedsitters and student accommodation in Malindi and Kilifi, plus internet, gas, mattress hire and moving support.';

/** Keep the tab title and description right when the visitor moves between pages. */
export function useMeta(title, desc = DEFAULT_DESC) {
  useEffect(() => {
    if (title) document.title = title;
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
    m.content = desc;
  }, [title, desc]);
}

export const ksh = (n) => Number(n).toLocaleString('en-US');
