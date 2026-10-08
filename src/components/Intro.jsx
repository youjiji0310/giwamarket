import { useEffect, useState } from 'react';
import logo from '../assets/logo.png';

const seen = () => { try { return !!sessionStorage.getItem('gm-intro'); } catch { return false; } };
const mark = () => { try { mark(); } catch {} };

// One-time curtain on first load.
export default function Intro() {
  const [phase, setPhase] = useState(() => (seen() ? 'gone' : 'in'));
  useEffect(() => {
    if (phase !== 'in') return;
    mark();
    const a = setTimeout(() => setPhase('out'), 1500);
    const b = setTimeout(() => setPhase('gone'), 2400);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  if (phase === 'gone') return null;
  return (
    <div className={`intro ${phase === 'out' ? 'is-out' : ''}`} aria-hidden="true">
      <img src={logo} alt="" />
      <span className="intro-line" />
    </div>
  );
}
