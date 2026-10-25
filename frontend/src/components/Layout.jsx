import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { expirePreload, getBoot } from '../lib/api.js';
import Acc from './Acc.jsx';
import { Icon, Sprite, WA_PATH } from './Icons.jsx';

const social = { background: 'rgba(255,255,255,.12)' };
const socialCls = 'grid h-10 w-10 place-items-center rounded-full text-white transition hover:scale-110';

function Drawer({ open, close }) {
  const b = getBoot();
  const aside = useRef(null);
  useEffect(() => { // keep the closed menu out of the tab order
    if (open) aside.current.removeAttribute('inert'); else aside.current.setAttribute('inert', '');
  }, [open]);
  const row = (to, icon, label, i) => (
    <Link to={to} onClick={close} className="dlink drow" style={{ '--i': i }}>
      <span className="dic"><Icon n={icon} /></span><span>{label}</span><Icon n="chev" className="h-4 w-4 ml-auto text-slate-400" />
    </Link>
  );
  return (
    <div className={`dw fixed inset-0 lg:hidden${open ? ' on' : ''}`} style={{ zIndex: 5 }}>
      <div className="bk absolute inset-0 bg-navy/60" onClick={close}></div>
      <aside ref={aside} id="mnav" className="drawer absolute right-2 top-1.5 bottom-2 w-[88%] max-w-sm bg-white shadow-2xl rounded-3xl flex flex-col overflow-y-auto" aria-label="Menu">
        <div className="dlink flex items-center gap-2 h-[52px] shrink-0 pl-5 pr-16 mt-1" style={{ '--i': 0 }}>
          <img src={b.assets.logo} alt="" width="36" height="36" className="h-9 w-9 object-contain" />
          <div className="leading-none"><b className="text-lg text-navy">AMOX<span className="text-sky">Homes</span></b><p className="text-[9px] text-brand mt-0.5 leading-tight">Connecting Students &amp; Professionals<br />to a Better Lifestyle</p></div>
        </div>
        <div className="dlink relative overflow-hidden rounded-2xl bg-mist mx-4 mt-3 shrink-0" style={{ '--i': 1 }}>
          <img src={b.assets.menu_house} alt="" width="240" height="151" loading="lazy" className="absolute inset-y-0 right-0 h-full w-3/5 object-cover" style={{ WebkitMaskImage: 'linear-gradient(to right,transparent,#000 45%)', maskImage: 'linear-gradient(to right,transparent,#000 45%)' }} />
          <div className="relative p-3.5 max-w-[74%]">
            <div className="flex items-center gap-2"><span className="grid place-items-center h-8 w-8 shrink-0 rounded-full bg-brand text-white"><Icon n="home" className="h-4 w-4" /></span><b className="text-navy text-[13px] leading-tight whitespace-nowrap">Find Your Home in Malindi</b></div>
            <p className="text-xs text-slate-600 mt-2">Verified houses near your campus or workplace.</p>
          </div>
        </div>
        <p className="dlink dsec px-5 mt-3" style={{ '--i': 2 }}>Explore</p>
        <nav className="px-3 grid gap-0.5" aria-label="Mobile">
          {row('/houses/', 'search', 'Find a House', 3)}{row('/services/', 'grid', 'Services', 4)}{row('/about/', 'info', 'About Us', 5)}
          {row('/blog/', 'news', 'Blog', 5.3)}{row('/reviews/', 'star', 'Reviews', 5.6)}
        </nav>
        <p className="dlink dsec px-5 mt-3" style={{ '--i': 6 }}>Partners</p>
        <div className="px-3 grid gap-0.5">{row('/landlords/', 'home', 'For Landlords', 7)}{row('/providers/', 'store', 'For Service Providers', 8)}</div>
        <p className="dlink dsec px-5 mt-3" style={{ '--i': 9 }}>Support</p>
        <div className="px-3 grid gap-0.5">{row('/contact/', 'phone', 'Contact', 10)}</div>
        <div className="dlink mt-3 mb-3 mx-4 pt-2.5 border-t grid grid-cols-3 text-[11px] leading-tight text-slate-500 shrink-0" style={{ '--i': 13 }}>
          <span className="flex items-center gap-1.5"><Icon n="shield" className="h-5 w-5 text-brand shrink-0" />Trusted platform</span>
          <span className="flex items-center gap-1.5 border-x px-2"><Icon n="headset" className="h-5 w-5 text-brand shrink-0" />WhatsApp support</span>
          <span className="flex items-center gap-1.5 pl-2"><Icon n="shield" className="h-5 w-5 text-brand shrink-0" />Verified houses</span>
        </div>
      </aside>
    </div>
  );
}

function Footer() {
  const b = getBoot();
  const summary = (t) => <>{t}<Icon n="chev" className="chev h-4 w-4 md:hidden" /></>;
  const sum = 'flex items-center justify-between py-3 md:py-0 font-bold text-white text-base';
  return (
    <footer className="bg-navy text-blue-100 mt-16 pt-8 pb-12 text-sm">
      <div className="max-w-6xl mx-auto px-4 grid gap-1 md:gap-8 md:grid-cols-4">
        <div className="pb-3 md:pb-0"><b className="text-white text-base">AMOXHomes</b><p className="mt-1">A division of AMOX Solutions Ltd. Connecting Students &amp; Professionals to a Better Lifestyle.</p>
          <div className="mt-3 flex items-center gap-2">
            <a href="https://www.facebook.com/profile.php?id=61594030323808" target="_blank" rel="noopener" aria-label="AMOXHomes on Facebook" className={socialCls} style={social}><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.4H7.7V13h2.7v8h3.1z" /></svg></a>
            <a href="https://www.instagram.com/amoxhomes?stkn=N3YzYmJpam5ta3Yz" target="_blank" rel="noopener" aria-label="AMOXHomes on Instagram" className={socialCls} style={social}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg></a>
            <a href="https://www.tiktok.com/@amoxhomes?_r=1&_t=ZS-99iwmapHjPe" target="_blank" rel="noopener" aria-label="AMOXHomes on TikTok" className={socialCls} style={social}><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19.6 6.8a5 5 0 0 1-3.8-4.3V2h-3.3v13.4a2.8 2.8 0 1 1-2-2.7V9.3a6.1 6.1 0 1 0 5.3 6V8.8a8 8 0 0 0 4.7 1.5V7a5 5 0 0 1-.9-.2z" /></svg></a>
          </div>
        </div>
        <Acc fdet className="border-t border-white/10 md:border-0" summaryClassName={sum} summary={summary('Explore')}>
          <ul className="pb-3 md:pb-0 md:mt-1 space-y-1">
            <li><Link to="/houses/">Find a House</Link></li><li><Link to="/services/">Services</Link></li><li><Link to="/landlords/">For Landlords</Link></li>
            <li><Link to="/providers/">For Service Providers</Link></li><li><Link to="/about/">About Us</Link></li><li><Link to="/blog/">Blog</Link></li><li><Link to="/reviews/">Reviews</Link></li>
          </ul>
        </Acc>
        <Acc fdet className="border-t border-white/10 md:border-0" summaryClassName={sum} summary={summary('Contact')}>
          <p className="pb-3 md:pb-0 md:mt-1">📞 <a className="underline" href={`tel:${b.phone}`}>{b.phone}</a><br />✉️ <a className="underline" href={`mailto:${b.email}`}>{b.email}</a><br />P.O. Box 321-80200 Malindi</p>
        </Acc>
        <div className="border-t border-white/10 md:border-0 pt-3 md:pt-0"><b className="text-white text-base">Stay safe</b><p className="mt-1">Never pay a deposit or rent before viewing the house and confirming the landlord.</p>
          <p className="mt-2"><Link className="underline" to="/privacy/">Privacy</Link> · <Link className="underline" to="/terms/">Terms</Link> · <Link className="underline" to="/contact/">Report a listing</Link></p></div>
      </div>
      <p className="max-w-6xl mx-auto px-4 mt-6 text-xs text-blue-200">© {new Date().getFullYear()} AMOX Solutions Ltd. · <a href="/console/" className="opacity-60 hover:opacity-100">Staff</a></p>
    </footer>
  );
}

export default function Layout({ children }) {
  const b = getBoot();
  const [open, setOpen] = useState(false);
  const [sc, setSc] = useState(false);
  const { pathname, search, hash } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    const onScroll = () => setSc(window.scrollY > 8);
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.code === 'KeyA' && e.shiftKey && (e.ctrlKey || e.altKey)) { e.preventDefault(); window.location.href = '/console/'; }   // staff shortcut
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey); };
  }, []);

  useEffect(() => { document.documentElement.style.overflow = open ? 'hidden' : ''; }, [open]);

  // New page: close the menu, scroll to the top (or to #anchor) and stop using the server-preloaded data.
  useEffect(() => {
    setOpen(false);
    if (first.current) first.current = false; else expirePreload();
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView(), 0); else window.scrollTo(0, 0);
  }, [pathname, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDetail = /^\/houses\/(?!near\/)[^/]+\/?$/.test(pathname);   // house pages have their own sticky bar, so no WhatsApp bubble

  return (
    <>
      <Sprite />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${sc ? 'shadow-lg' : 'border-b'}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-navy text-base sm:text-lg shrink-0"><img src={b.assets.logo} alt="" width="40" height="40" className="h-10 w-10 object-cover object-top" /><span>AMOX<span className="text-sky">Homes</span></span></Link>
          <nav className="hidden lg:flex items-center gap-4 whitespace-nowrap text-sm font-medium" aria-label="Main">
            <Link className="nl" to="/services/">Services</Link><Link className="nl" to="/landlords/">For Landlords</Link><Link className="nl" to="/providers/">For Providers</Link><Link className="nl" to="/about/">About Us</Link>
            <Link className="nl hidden xl:inline" to="/blog/">Blog</Link><Link className="nl hidden xl:inline" to="/reviews/">Reviews</Link><Link className="nl" to="/contact/">Contact</Link>
            <Link to="/houses/" className="bg-brand text-white rounded-full px-4 py-2 font-semibold hover:scale-105 transition">Find a House</Link>
            <Link to="/landlords/list/" className="bg-coral text-slate-900 rounded-full px-4 py-2 font-semibold hover:scale-105 transition">List Your Property</Link>
          </nav>
          <div className="flex items-center lg:hidden">
            <Link to="/houses/" className="hidden min-[360px]:inline-block bg-brand text-white text-xs sm:text-sm font-semibold rounded-full px-3 sm:px-4 py-2 whitespace-nowrap">Find a House</Link>
            <button className={`burger relative z-10${open ? ' is-open' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mnav" aria-label="Menu"><span></span><span></span><span></span></button>
          </div>
        </div>
        <Drawer open={open} close={() => setOpen(false)} />
      </header>
      <main id="main" key={pathname} className="pg">{children}</main>
      <Footer />
      {!onDetail && (
        <a href={b.wa} target="_blank" rel="noopener" aria-label="Chat with AMOXHomes on WhatsApp" className="fixed right-4 bottom-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110">
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping"></span>
          <svg viewBox="0 0 24 24" className="relative h-8 w-8" fill="currentColor" aria-hidden="true"><path d={WA_PATH} /></svg>
        </a>
      )}
    </>
  );
}
