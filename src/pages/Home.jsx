import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Artwork from '../lib/art.jsx';
import banner from '../assets/banner.jpg';
import { Change, Thumb, ColName, Seg, Rail } from '../components/bits.jsx';
import { IArrowL, IArrowR } from '../components/Icons.jsx';
import { CATEGORIES, RANGES, collections, drops, eth, ethShort, compact, num } from '../lib/data.js';
import { useCountdown } from '../lib/hooks.js';

function Featured({ list }) {
  const slides = [{ brand: true }, ...list.slice(0, 4)];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => { setI(0); }, [list]);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI(v => (v + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [paused, slides.length]);
  const s = slides[i];
  return (
    <section className="feat" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel" aria-label="Featured">
      {slides.map((sl, k) => (
        <div key={k} className={`feat-slide ${k === i ? 'on' : ''}`} aria-hidden={k !== i}>
          {sl.brand ? <img src={banner} alt="" className="feat-img" /> : <div className="feat-art"><Artwork seed={sl.seed + 300} /></div>}
        </div>
      ))}
      <div className="feat-shade" />
      <div className="feat-info" key={i}>
        {s.brand ? (
          <>
            <h1 className="sr">GiwaMarket, the NFT marketplace of GIWA</h1>
            <p className="feat-sub brand-sub">The NFT marketplace of GIWA. Discover, collect and launch on Upbit's Layer 2.</p>
            <div className="feat-cta"><Link to="/collections" className="btn btn-light">Explore collections</Link><Link to="/drops" className="btn btn-ghost">View drops</Link></div>
          </>
        ) : (
          <>
            <span className="pill">{s.category}</span>
            <h2 className="feat-title"><ColName c={s} link={false} /></h2>
            <p className="muted feat-sub">by {s.creator}</p>
            <div className="feat-stats">
              <div><span className="label">Floor</span><b className="mono">{eth(s.floor)}</b></div>
              <div><span className="label">Items</span><b className="mono">{num(s.items)}</b></div>
              <div><span className="label">Total volume</span><b className="mono">{compact(s.totalVolume)} ETH</b></div>
            </div>
            <div className="feat-cta"><Link to={`/collection/${s.slug}`} className="btn btn-light">View collection</Link></div>
          </>
        )}
      </div>
      <div className="feat-nav">
        <button className="icon-btn bordered" onClick={() => setI(v => (v - 1 + slides.length) % slides.length)} aria-label="Previous"><IArrowL /></button>
        <div className="feat-dots">
          {slides.map((_, k) => <button key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`}><span style={{ animationPlayState: paused ? 'paused' : 'running' }} /></button>)}
        </div>
        <button className="icon-btn bordered" onClick={() => setI(v => (v + 1) % slides.length)} aria-label="Next"><IArrowR /></button>
      </div>
    </section>
  );
}

function Trending({ list }) {
  const [mode, setMode] = useState('trending');
  const [range, setRange] = useState('24h');
  const rows = [...list].sort((a, b) => (mode === 'trending' ? b.change[range] - a.change[range] : b.volume[range] - a.volume[range])).slice(0, 10);
  const half = Math.ceil(rows.length / 2);
  const Col = ({ part, start }) => (
    <div className="tr-col">
      <div className="tr-row tr-head"><span>#</span><span>Collection</span><span className="r">Floor</span><span className="r">{mode === 'trending' ? 'Change' : 'Volume'}</span></div>
      {part.map((c, k) => (
        <Link to={`/collection/${c.slug}`} className="tr-row" key={c.slug}>
          <span className="muted mono">{start + k + 1}</span>
          <span className="tr-name"><Thumb seed={c.seed} /><span className="ell">{c.name}</span>{c.verified && <span className="vf-dot" aria-label="Verified">✦</span>}</span>
          <span className="r mono">{ethShort(c.floor)} ETH</span>
          <span className="r">{mode === 'trending' ? <Change v={c.change[range]} /> : <span className="mono">{compact(c.volume[range])} ETH</span>}</span>
        </Link>
      ))}
    </div>
  );
  return (
    <section className="block">
      <div className="block-head">
        <Seg options={[['trending', 'Trending'], ['top', 'Top']]} value={mode} onChange={setMode} label="Ranking" />
        <div className="block-tools">
          <Seg options={RANGES} value={range} onChange={setRange} label="Time range" small />
          <Link to="/collections" className="btn btn-ghost btn-sm">View all</Link>
        </div>
      </div>
      {rows.length ? <div className="tr-grid"><Col part={rows.slice(0, half)} start={0} /><Col part={rows.slice(half)} start={half} /></div> : <p className="muted">No collections in this category yet.</p>}
    </section>
  );
}

function DropCard({ d }) {
  const live = d.phase === 'Live';
  const time = useCountdown(live ? d.endsInH : d.startsInH);
  const p = Math.round((d.minted / d.supply) * 100);
  return (
    <Link to="/drops" className="dcard">
      <div className="dcard-art"><Artwork seed={d.seed} /><span className={`pill on-art ${live ? 'live' : ''}`}>{live && <span className="net-dot" />}{live ? `Live · ${d.stage}` : 'Upcoming'}</span></div>
      <div className="dcard-body">
        <b className="ell">{d.title}</b>
        <span className="muted xs">by {d.creator}</span>
        <div className="dcard-row"><span className="mono">{eth(d.price)}</span><span className="muted xs mono">{live ? `Ends ${time}` : `Starts ${time}`}</span></div>
        {live && <div className="bar"><span style={{ width: `${p}%` }} /></div>}
      </div>
    </Link>
  );
}

function ColCard({ c, stat }) {
  return (
    <Link to={`/collection/${c.slug}`} className="ccard">
      <div className="ccard-art"><Artwork seed={c.seed + 300} /></div>
      <div className="ccard-body">
        <span className="ccard-name"><ColName c={c} link={false} /></span>
        <div className="ccard-stats">
          <div><span className="label">Floor</span><span className="mono">{eth(c.floor)}</span></div>
          <div><span className="label">{stat === 'change' ? '24h change' : '24h volume'}</span>{stat === 'change' ? <Change v={c.change['24h']} /> : <span className="mono">{compact(c.vol24)} ETH</span>}</div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [cat, setCat] = useState('All');
  const list = useMemo(() => (cat === 'All' ? collections : collections.filter(c => c.category === cat)), [cat]);
  const featured = useMemo(() => [...list].sort((a, b) => b.totalVolume - a.totalVolume), [list]);
  const movers = useMemo(() => [...list].sort((a, b) => b.change['24h'] - a.change['24h']), [list]);
  return (
    <div className="page">
      <div className="chips" role="tablist" aria-label="Categories">
        {CATEGORIES.map(c => <button key={c} role="tab" aria-selected={cat === c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <Featured list={featured} />
      <Trending list={list} />
      <Rail title="Featured drops" action={<Link to="/drops" className="btn btn-ghost btn-sm">All drops</Link>}>
        {drops.map(d => <DropCard key={d.title} d={d} />)}
      </Rail>
      <Rail title="Notable collections">
        {featured.map(c => <ColCard key={c.slug} c={c} />)}
      </Rail>
      <Rail title="Top movers today">
        {movers.map(c => <ColCard key={c.slug} c={c} stat="change" />)}
      </Rail>
    </div>
  );
}
