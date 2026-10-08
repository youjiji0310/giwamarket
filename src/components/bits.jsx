import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Artwork from '../lib/art.jsx';
import { IArrowL, IArrowR, IVerified } from './Icons.jsx';
import { pct } from '../lib/data.js';

export const Change = ({ v }) => <span className={`chg ${v >= 0 ? 'up' : 'down'}`}>{pct(v)}</span>;

export function Thumb({ seed, size = 'md', round = false }) {
  return <span className={`thumb ${size} ${round ? 'round' : ''}`}><Artwork seed={seed} /></span>;
}

export function ColName({ c, link = true }) {
  const inner = <>{c.name}{c.verified && <IVerified className="vf" />}</>;
  return link ? <Link to={`/collection/${c.slug}`} className="colname">{inner}</Link> : <span className="colname">{inner}</span>;
}

export function Sparkline({ data, w = 96, h = 28, up }) {
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 3 - ((v - min) / span) * (h - 6)}`).join(' ');
  return (
    <svg className={`spark ${up ? 'up' : 'down'}`} viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <polyline points={pts} fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Tabs({ tabs, value, onChange, label }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map(([k, l]) => (
        <button key={k} role="tab" aria-selected={value === k} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{l}</button>
      ))}
    </div>
  );
}

export function Seg({ options, value, onChange, label, small }) {
  return (
    <div className={`seg ${small ? 'sm' : ''}`} role="tablist" aria-label={label}>
      {options.map(o => {
        const [k, l] = Array.isArray(o) ? o : [o, o];
        return <button key={k} role="tab" aria-selected={value === k} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{l}</button>;
      })}
    </div>
  );
}

export function Rail({ title, action, children }) {
  const ref = useRef(null);
  const by = d => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.85, behavior: 'smooth' });
  return (
    <section className="rail">
      <div className="rail-head">
        <h2 className="h2">{title}</h2>
        <div className="rail-ctrl">
          {action}
          <button className="icon-btn bordered" onClick={() => by(-1)} aria-label="Scroll left"><IArrowL /></button>
          <button className="icon-btn bordered" onClick={() => by(1)} aria-label="Scroll right"><IArrowR /></button>
        </div>
      </div>
      <div className="rail-track" ref={ref}>{children}</div>
    </section>
  );
}
