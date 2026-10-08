import { useEffect, useState } from 'react';
import logo from '../assets/logo.png';

const seen = () => { try { return !!sessionStorage.getItem('gm-intro'); } catch { return false; } };
const mark = () => { try { sessionStorage.setItem('gm-intro', '1'); } catch {} };

// Preloader: counter 000 → 100, then the curtain opens in two halves.
export default function Intro() {
  const [phase, setPhase] = useState(() => (seen() ? 'gone' : 'count'));
  const [n, setN] = useState(0);
  useEffect(() => {
    if (phase !== 'count') return;
    mark();
    const dur = 1700, t0 = performance.now();
    let raf;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      setN(Math.round(100 * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
      else setTimeout(() => setPhase('open'), 250);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase]);
  useEffect(() => { if (phase === 'open') { const t = setTimeout(() => setPhase('gone'), 1300); return () => clearTimeout(t); } }, [phase]);
  if (phase === 'gone') return null;
  return (
    <div className={`intro ${phase === 'open' ? 'is-open' : ''}`} aria-hidden="true">
      <div className="intro-half top" />
      <div className="intro-half bottom" />
      <div className="intro-center">
        <img src={logo} alt="" />
        <span className="intro-word"><b>Giwa</b><i>Market</i></span>
      </div>
      <span className="intro-count">{String(n).padStart(3, '0')}</span>
      <span className="intro-bar"><span style={{ transform: `scaleX(${n / 100})` }} /></span>
    </div>
  );
}
