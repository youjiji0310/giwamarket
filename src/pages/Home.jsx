import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import banner from '../assets/banner.jpg';
import Artwork from '../lib/art.jsx';
import Reveal from '../components/Reveal.jsx';
import Marquee from '../components/Marquee.jsx';
import NftCard from '../components/NftCard.jsx';
import { collections, drops, latest, eth, num } from '../lib/data.js';
import { useCountUp, useCountdown } from '../lib/hooks.js';

function Stat({ value, label, decimals = 0, suffix = '' }) {
  const [v, ref] = useCountUp(value);
  return (
    <div className="stat" ref={ref}>
      <span className="stat-v">{v.toLocaleString('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}</span>
      <span className="eyebrow">{label}</span>
    </div>
  );
}

function Ranking() {
  const [range, setRange] = useState('24h');
  const [hover, setHover] = useState(null);
  const box = useRef(null);
  const prev = useRef(null);
  const factor = { '1h': 0.04, '24h': 1, '7d': 6.2 }[range];
  const rows = [...collections].sort((a, b) => b.volume - a.volume);

  const onMove = e => {
    if (!prev.current || !box.current) return;
    const r = box.current.getBoundingClientRect();
    prev.current.style.transform = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0) translate(-50%, -50%)`;
  };

  return (
    <section className="wrap section">
      <Reveal className="sec-head">
        <div>
          <span className="eyebrow">Curated</span>
          <h2 className="h2">The <em>collections</em> that matter</h2>
        </div>
        <div className="seg" role="tablist" aria-label="Time range">
          {['1h', '24h', '7d'].map(r => (
            <button key={r} role="tab" aria-selected={range === r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </Reveal>
      <div className="rank" ref={box} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <div className="rank-row rank-head">
          <span>#</span><span>Collection</span><span>Floor</span><span>Change</span><span>Volume</span><span className="hide-sm">Owners</span>
        </div>
        {rows.map((c, i) => {
          const ch = range === '7d' ? c.change * 1.9 : range === '1h' ? c.change / 9 : c.change;
          return (
            <Reveal key={c.slug} delay={i * 60}>
              <Link to={`/collection/${c.slug}`} className="rank-row" onMouseEnter={() => setHover(c)}>
                <span className="mono muted">{String(i + 1).padStart(2, '0')}</span>
                <span className="rank-name">
                  <span className="rank-thumb"><Artwork seed={c.seed} /></span>
                  <span>{c.name}{c.verified && <span className="tick" title="Verified">✦</span>}</span>
                </span>
                <span className="mono">{eth(c.floor)}</span>
                <span className={`mono ${ch < 0 ? 'down' : 'up'}`}>{ch > 0 ? '+' : ''}{ch.toFixed(1)}%</span>
                <span className="mono">{num(Math.round(c.volume * factor))} ETH</span>
                <span className="mono muted hide-sm">{num(c.owners)}</span>
              </Link>
            </Reveal>
          );
        })}
        <div ref={prev} className={`rank-preview ${hover ? 'show' : ''}`} aria-hidden="true">
          {hover && <Artwork seed={hover.seed} />}
        </div>
      </div>
    </section>
  );
}

function FeaturedDrop() {
  const d = drops[0];
  const time = useCountdown(d.endsInH);
  const pct = Math.round((d.minted / d.supply) * 100);
  return (
    <section className="feature">
      <div className="wrap feature-in">
        <Reveal className="feature-art">
          <div className="feature-frame">
            <Artwork seed={d.seed} style="orbit" />
          </div>
          <span className="feature-caption mono">No. 0001 — {d.title}</span>
        </Reveal>
        <Reveal className="feature-copy" delay={120}>
          <span className="eyebrow"><span className="live" /> Featured drop · {d.phase}</span>
          <h2 className="h1">{d.title.split(' ').slice(0, -1).join(' ')} <em>{d.title.split(' ').slice(-1)}</em></h2>
          <p className="lead">The second series of guardians. {num(d.supply)} pieces, revealed twenty-four hours after sell-out. By {d.creator}.</p>
          <div className="countdown" aria-label={`Ends in ${time}`}>
            {time.split(':').map((p, i) => (
              <div key={i}><span className="cd-n">{p}</span><span className="eyebrow">{['Hours', 'Minutes', 'Seconds'][i]}</span></div>
            ))}
          </div>
          <div className="progress"><span style={{ width: `${pct}%` }} /></div>
          <div className="row-between small"><span className="muted">{num(d.minted)} / {num(d.supply)} minted</span><span className="mono">{eth(d.price)}</span></div>
          <div className="actions">
            <Link to="/launchpad" className="btn btn-light">Mint now</Link>
            <Link to={`/collection/${d.slug}`} className="btn btn-ghost">View series I</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-img"><img src={banner} alt="GiwaMarket — Trade, Discover, Collect" /></div>
        <div className="hero-shade" />
        <div className="wrap hero-bottom">
          <p className="hero-kicker">The curated NFT house of <em>GIWA</em></p>
          <div className="actions">
            <Link to="/explore" className="btn btn-light">Explore collections</Link>
            <Link to="/launchpad" className="btn btn-ghost">Enter the launchpad</Link>
          </div>
        </div>
        <span className="scroll-cue" aria-hidden="true"><span /></span>
      </section>

      <section className="wrap statement">
        <Reveal as="p" className="statement-text">
          A marketplace built like a gallery. <em>Fewer collections, chosen with care</em>, traded on a fast and quiet Layer 2.
        </Reveal>
        <div className="stats">
          <Stat value={3802} label="ETH traded" />
          <Stat value={48} label="Curated collections" />
          <Stat value={12650} label="Collectors" />
          <Stat value={1.2} decimals={1} suffix="s" label="Block time" />
        </div>
      </section>

      <Marquee items={collections.map(c => c.name)} />

      <Ranking />
      <FeaturedDrop />

      <section className="wrap section">
        <Reveal className="sec-head">
          <div>
            <span className="eyebrow">Launchpad</span>
            <h2 className="h2">Minting <em>now</em></h2>
          </div>
          <Link to="/launchpad" className="link-arrow">All drops <span aria-hidden="true">→</span></Link>
        </Reveal>
        <div className="drops">
          {drops.map((d, i) => {
            const pct = Math.round((d.minted / d.supply) * 100);
            return (
              <Reveal key={d.title} delay={i * 100}>
                <Link to="/launchpad" className="drop">
                  <div className="drop-art"><Artwork seed={d.seed} /><span className="chip">{d.phase}</span></div>
                  <div className="drop-body">
                    <div className="row-between"><span className="drop-title">{d.title}</span><span className="mono">{eth(d.price)}</span></div>
                    <div className="progress thin"><span style={{ width: `${pct}%` }} /></div>
                    <div className="row-between small muted"><span>{pct}% minted</span><span>by {d.creator}</span></div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="wrap section">
        <Reveal className="sec-head">
          <div>
            <span className="eyebrow">Fresh</span>
            <h2 className="h2">Latest <em>listings</em></h2>
          </div>
        </Reveal>
        <div className="grid-nft">
          {latest.map((it, i) => (
            <Reveal key={i} delay={(i % 4) * 80}><NftCard item={it} meta={`${it.mins}m ago`} /></Reveal>
          ))}
        </div>
      </section>

      <section id="atelier" className="atelier">
        <div className="wrap atelier-in">
          <Reveal>
            <span className="eyebrow">The Atelier</span>
            <h2 className="h1">Your collection, <em>presented properly.</em></h2>
          </Reveal>
          <Reveal delay={120} className="atelier-side">
            <p className="lead">Upload the work, set supply, phases and royalties. We deploy the contract on GIWA and give you a mint page worthy of it.</p>
            <Link to="/launchpad" className="btn btn-light">Apply to launch</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
