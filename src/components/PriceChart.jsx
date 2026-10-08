import { useState } from 'react';

// Single-series price history: line + soft area, recessive grid, crosshair tooltip.
export default function PriceChart({ data, height = 220 }) {
  const [hover, setHover] = useState(null);
  const W = 640, H = height, pl = 46, pr = 14, pt = 14, pb = 26;
  const ps = data.map(d => d.p);
  const lo = Math.min(...ps) * 0.92, hi = Math.max(...ps) * 1.05;
  const x = i => pl + (i / (data.length - 1)) * (W - pl - pr);
  const y = v => pt + (1 - (v - lo) / (hi - lo)) * (H - pt - pb);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.p).toFixed(1)}`).join('');
  const area = `${line}L${x(data.length - 1)},${H - pb}L${x(0)},${H - pb}Z`;
  const ticks = [0, 1, 2, 3].map(k => lo + ((hi - lo) * k) / 3);
  const fmtD = t => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const onMove = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - pl) / (W - pl - pr)) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };
  const avg = ps.reduce((a, b) => a + b, 0) / ps.length;
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Price history, ${data.length} sales, average ${avg.toFixed(3)} ETH`} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="pc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--ink)" stopOpacity=".18" />
            <stop offset="1" stopColor="var(--ink)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t, k) => (
          <g key={k}>
            <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} className="grid" />
            <text x={pl - 8} y={y(t) + 4} textAnchor="end" className="axis">{t.toFixed(3)}</text>
          </g>
        ))}
        {[0, Math.floor((data.length - 1) / 2), data.length - 1].map(i => (
          <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'} className="axis">{fmtD(data[i].t)}</text>
        ))}
        <path d={area} fill="url(#pc-fill)" />
        <path d={line} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(data.length - 1)} cy={y(data[data.length - 1].p)} r="4" fill="var(--ink)" stroke="var(--bg-2)" strokeWidth="2" />
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pt} y2={H - pb} className="cross" />
            <circle cx={x(hover)} cy={y(data[hover].p)} r="5" fill="var(--ink)" stroke="var(--bg-2)" strokeWidth="2" />
          </g>
        )}
        <rect x={pl} y={pt} width={W - pl - pr} height={H - pt - pb} fill="transparent" />
      </svg>
      {hover != null && (
        <div className="chart-tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <b className="mono">{data[hover].p.toFixed(4)} ETH</b><span className="muted xs">{fmtD(data[hover].t)}</span>
        </div>
      )}
    </figure>
  );
}
