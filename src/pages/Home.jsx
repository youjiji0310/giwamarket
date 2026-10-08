import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import banner from '../assets/banner.jpg';
import Artwork from '../lib/art.jsx';
import Reveal from '../components/Reveal.jsx';
import Marquee from '../components/Marquee.jsx';
import ChromeCanvas from '../components/ChromeCanvas.jsx';
import Lines from '../components/Lines.jsx';
import Magnetic from '../components/Magnetic.jsx';
import Frame from '../components/Frame.jsx';
import Vault from '../components/Vault.jsx';
import { useEffect } from 'react';
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
          <span className="eyebrow">Market</span>
          <Lines className="h2" lines={[<>The market,</>, <em>by the hour.</em>]} />
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
          <Frame seed={d.seed} style="orbit" lot="001" title={d.title} meta={`Edition of ${num(d.supply)} · by ${d.creator}`} className="frame-feature" />
        </Reveal>
        <Reveal className="feature-copy" delay={120}>
          <span className="eyebrow"><span className="live" /> Featured drop · {d.phase}</span>
          <Lines className="h1" lines={[d.title.split(' ').slice(0, -1).join(' '), <em>{d.title.split(' ').slice(-1)}</em>]} />
          <p className="lead">The second series of guardians. {num(d.supply)} pieces, revealed twenty-four hours after sell-out. By {d.creator}.</p>
          <div className="countdown" aria-label={`Ends in ${time}`}>
            {time.split(':').map((p, i) => (
              <div key={i}><span className="cd-n">{p}</span><span className="eyebrow">{['Hours', 'Minutes', 'Seconds'][i]}</span></div>
            ))}
          </div>
          <div className="progress"><span style={{ width: `${pct}%` }} /></div>
          <div className="row-between small"><span className="muted">{num(d.minted)} / {num(d.supply)} minted</span><span className="mono">{eth(d.price)}</span></div>
          <div className="actions">
            <Magnetic><Link to="/launchpad" className="btn btn-light">Mint now</Link></Magnetic>
            <Magnetic><Link to={`/collection/${d.slug}`} className="btn btn-ghost">View series I</Link></Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Banner() {
  const img = useRef(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf;
    const tick = () => {
      const el = img.current;
      if (el) {
        const r = el.parentElement.getBoundingClientRect();
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.transform = `translate3d(0, ${p * -12}%, 0) scale(1.18)`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <section className="banner" aria-label="GiwaMarket">
      <div className="banner-media"><img ref={img} src={banner} alt="GiwaMarket — Trade, Discover, Collect" /></div>
      <div className="wrap banner-cap">
        <span className="eyebrow">Trade</span><span className="eyebrow">Discover</span><span className="eyebrow">Collect</span>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <section className="hero2">
        <ChromeCanvas />
        <div className="hero2-shade" />
        <div className="wrap hero2-in">
          <div className="hero2-top">
            <span className="eyebrow">Est. 2026</span>
            <span className="eyebrow hide-sm">A curated NFT house on GIWA</span>
            <span className="eyebrow">Seoul · Online</span>
          </div>
          <Lines as="h1" className="hero2-title" delay={250} lines={['Rare things,', <em>kept beautifully.</em>]} />
          <div className="hero2-foot">
            <p className="lead">Collect, trade and launch generative art on GIWA. Fewer collections, chosen with care.</p>
            <div className="actions">
              <Magnetic><Link to="/explore" className="btn btn-light">Enter the gallery</Link></Magnetic>
              <Magnetic><Link to="/launchpad" className="btn btn-ghost">Launchpad</Link></Magnetic>
            </div>
          </div>
        </div>
        <span className="scroll-cue" aria-hidden="true"><span /></span>
      </section>

      <section className="wrap statement">
        <Reveal as="p" className="statement-text">
          A marketplace built like a gallery. <em>Every piece framed, every collection reviewed</em>, traded on a fast and quiet Layer 2.
        </Reveal>
        <div className="stats">
          <Stat value={3802} label="ETH traded" />
          <Stat value={48} label="Curated collections" />
          <Stat value={12650} label="Collectors" />
          <Stat value={1.2} decimals={1} suffix="s" label="Block time" />
        </div>
      </section>

      <Banner />

      <Marquee items={collections.map(c => c.name)} />

      <Vault />
      <Ranking />
      <FeaturedDrop />

      <section className="wrap section">
        <Reveal className="sec-head">
          <div>
            <span className="eyebrow">Launchpad</span>
            <Lines className="h2" lines={['Minting', <em>now.</em>]} />
          </div>
          <Link to="/launchpad" className="link-arrow">All drops <span aria-hidden="true">→</span></Link>
        </Reveal>
        <div className="drops">
          {drops.map((d, i) => {
            const pct = Math.round((d.minted / d.supply) * 100);
            return (
              <Reveal key={d.title} delay={i * 100}>
                <Link to="/launchpad" className="drop">
                  <div className="drop-art" data-cursor="Mint"><Artwork seed={d.seed} /><span className="chip">{d.phase}</span></div>
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
            <Lines className="h2" lines={['Latest', <em>arrivals.</em>]} />
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
            <Lines className="h1" lines={['Your collection,', <em>presented properly.</em>]} />
          </Reveal>
          <Reveal delay={120} className="atelier-side">
            <p className="lead">Upload the work, set supply, phases and royalties. We deploy the contract on GIWA and give you a mint page worthy of it.</p>
            <Magnetic><Link to="/launchpad" className="btn btn-light">Apply to launch</Link></Magnetic>
          </Reveal>
        </div>
      </section>
    </>
  );
}
