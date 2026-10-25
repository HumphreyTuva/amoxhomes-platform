import { useEffect, useRef } from 'react';

/** Fade-and-rise when scrolled into view (replaces the old data-reveal script). d = stagger step. */
export default function Reveal({ as: Tag = 'div', d = 0, className = '', style, children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} data-reveal="" className={className} style={{ '--d': String(d), ...style }} {...rest}>{children}</Tag>;
}
