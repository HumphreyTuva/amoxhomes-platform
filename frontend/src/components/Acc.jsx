import { useEffect, useRef } from 'react';

const desktop = () => window.matchMedia('(min-width:768px)').matches;

/** The animated <details> used for the footer, filters and "How it works" (same behaviour as the old inline script).
 *  fdet = always open on desktop. defaultOpen = open on first render. forceOpen = open it now (e.g. a form error inside). */
export default function Acc({ className = '', summaryClassName = '', summary, children, defaultOpen = false, fdet = false, forceOpen = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    d.open = defaultOpen || (fdet && desktop());
    d.classList.toggle('is-open', d.open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!forceOpen) return;
    const d = ref.current;
    d.open = true; d.classList.add('is-open');
  }, [forceOpen]);

  const onClick = (e) => {
    e.preventDefault();
    const d = ref.current;
    if (fdet && desktop()) return;
    const calm = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    const opening = d._a ? !d._want : !d.open;
    d._want = opening;
    if (calm) { d.open = opening; d.classList.toggle('is-open', opening); return; }
    if (d._a) d._a.cancel();
    const h0 = d.offsetHeight;
    let h1;
    d.open = true; h1 = d.offsetHeight;
    if (!opening) { d.open = false; h1 = d.offsetHeight; d.open = true; }
    d.classList.toggle('is-open', opening);
    d.style.overflow = 'hidden';
    const a = (d._a = d.animate({ height: [h0 + 'px', h1 + 'px'] }, { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' }));
    a.onfinish = () => { if (d._a === a) { d._a = null; d.open = opening; d.style.overflow = ''; } };
  };

  return (
    <details ref={ref} className={`acc${fdet ? ' fdet' : ''} ${className}`}>
      <summary className={`dsum ${summaryClassName}`} onClick={onClick}>{summary}</summary>
      {children}
    </details>
  );
}
