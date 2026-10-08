import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Frame from './Frame.jsx';
import { collections, eth, num } from '../lib/data.js';

// Pinned section: vertical scroll drives a horizontal gallery (desktop).
export default function Vault() {
  const sec = useRef(null);
  const track = useRef(null);
  useEffect(() => {
    const s = sec.current, tr = track.current;
    let raf;
    const wide = () => matchMedia('(min-width: 901px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const size = () => {
      if (!wide()) { s.style.height = ''; tr.style.transform = ''; return; }
      s.style.height = `${tr.scrollWidth - innerWidth + innerHeight}px`;
    };
    const tick = () => {
      if (wide()) {
        const r = s.getBoundingClientRect();
        const max = tr.scrollWidth - innerWidth;
        const p = Math.min(1, Math.max(0, -r.top / (s.offsetHeight - innerHeight || 1)));
        tr.style.transform = `translate3d(${-p * max}px, 0, 0)`;
        s.style.setProperty('--p', p.toFixed(4));
      }
      raf = requestAnimationFrame(tick);
    };
    size(); tick();
    addEventListener('resize', size);
    const t = setTimeout(size, 600);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size); clearTimeout(t); };
  }, []);

  return (
    <section className="vault" ref={sec} aria-label="The Vault">
      <div className="vault-pin">
        <div className="vault-track" ref={track}>
          <div className="vault-intro">
            <span className="eyebrow">The Vault</span>
            <h2 className="h1">Six houses.<br /><em>One standard.</em></h2>
            <p className="lead">Every collection on GiwaMarket is reviewed by hand before it reaches the floor.</p>
            <span className="vault-hint eyebrow">Scroll to browse <span aria-hidden="true">→</span></span>
          </div>
          {collections.map((c, i) => (
            <Link key={c.slug} to={`/collection/${c.slug}`} className="vault-item">
              <Frame seed={c.seed} lot={String(i + 1).padStart(3, '0')} title={c.name} meta={`${eth(c.floor)} floor · ${num(c.items)} works`} label={c.name} />
            </Link>
          ))}
          <div className="vault-end">
            <Link to="/explore" className="vault-end-link"><em>View all</em><span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className="vault-progress" aria-hidden="true"><span /></div>
      </div>
    </section>
  );
}
