// Generative monochrome artworks (deterministic per seed).
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Artwork({ seed = 1, style, className = '', label }) {
  const r = rng(seed * 9973 + 7);
  const kind = style ?? ['orbit', 'tiles', 'ink', 'monolith', 'moon'][seed % 5];
  const id = `g${seed}-${kind}`;
  const bgTone = ['#0a0a0a', '#101010', '#151515', '#0d0d0d'][seed % 4];
  let body = null;

  if (kind === 'orbit') {
    const cx = 35 + r() * 30, cy = 35 + r() * 30, n = 5 + Math.floor(r() * 6);
    body = (
      <>
        {Array.from({ length: n }, (_, i) => (
          <circle key={i} cx={cx} cy={cy} r={8 + i * (6 + r() * 3)} fill="none" stroke="#e9e6df" strokeOpacity={0.12 + (i % 3) * 0.08} strokeWidth={0.35} />
        ))}
        <circle cx={cx} cy={cy} r={7 + r() * 5} fill={`url(#${id}-s)`} />
        <circle cx={cx + 22 + r() * 10} cy={cy - 14 - r() * 8} r={1.4} fill="#e9e6df" />
      </>
    );
  } else if (kind === 'tiles') {
    const rows = 7 + Math.floor(r() * 4), w = 100 / 6;
    const lit = Math.floor(r() * rows);
    body = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: 7 }, (_, c) => {
        const x = c * w - (row % 2 ? w / 2 : 0), y = 12 + row * (80 / rows);
        const on = row === lit && c > 1 && c < 5;
        return <path key={`${row}-${c}`} d={`M${x} ${y} q ${w / 2} ${-w / 2.2} ${w} 0`} fill="none" stroke={on ? '#f2efe8' : '#e9e6df'} strokeOpacity={on ? 0.95 : 0.18} strokeWidth={on ? 1.1 : 0.45} />;
      })
    );
  } else if (kind === 'ink') {
    const strokes = 3 + Math.floor(r() * 3);
    body = (
      <>
        {Array.from({ length: strokes }, (_, i) => {
          const y = 25 + r() * 50, a = r() * 30 - 15;
          return <path key={i} d={`M${8 + r() * 10} ${y} C ${30 + r() * 20} ${y + a}, ${55 + r() * 20} ${y - a}, ${88 + r() * 6} ${y + r() * 8 - 4}`} fill="none" stroke="#ece9e2" strokeOpacity={0.25 + r() * 0.6} strokeWidth={0.6 + r() * 2.4} strokeLinecap="round" />;
        })}
        <rect x={74} y={76} width={9} height={9} fill="none" stroke="#e9e6df" strokeOpacity=".55" strokeWidth=".5" />
      </>
    );
  } else if (kind === 'monolith') {
    const x = 30 + r() * 20, w = 14 + r() * 14, h = 40 + r() * 25;
    body = (
      <>
        <rect x={x} y={88 - h} width={w} height={h} fill={`url(#${id}-l)`} />
        <line x1="6" y1="88" x2="94" y2="88" stroke="#e9e6df" strokeOpacity=".35" strokeWidth=".4" />
        <circle cx={x + w + 18 + r() * 10} cy={24 + r() * 10} r={5 + r() * 4} fill="none" stroke="#e9e6df" strokeOpacity=".5" strokeWidth=".4" />
      </>
    );
  } else {
    const phase = r();
    body = (
      <>
        <circle cx="50" cy="48" r="24" fill={`url(#${id}-s)`} />
        <circle cx={50 + 10 + phase * 26} cy={48 - 4} r="24" fill={bgTone} />
        <line x1="10" y1="82" x2="90" y2="82" stroke="#e9e6df" strokeOpacity=".2" strokeWidth=".4" />
        <line x1="22" y1="86" x2="78" y2="86" stroke="#e9e6df" strokeOpacity=".12" strokeWidth=".4" />
      </>
    );
  }

  return (
    <svg className={`art ${className}`} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <radialGradient id={`${id}-s`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".55" stopColor="#bdb9b2" />
          <stop offset="1" stopColor="#3b3a38" />
        </radialGradient>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f1ea" />
          <stop offset="1" stopColor="#4a4946" />
        </linearGradient>
        <radialGradient id={`${id}-v`} cx="50%" cy="40%" r="80%">
          <stop offset="0" stopColor="#1c1c1c" />
          <stop offset="1" stopColor={bgTone} />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-v)`} />
      {body}
    </svg>
  );
}
