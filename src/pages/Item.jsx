import { useEffect, useRef, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Artwork from '../lib/art.jsx';
import Reveal from '../components/Reveal.jsx';
import { bySlug, eth } from '../lib/data.js';
import { useWallet, short } from '../lib/wallet.jsx';

const TRAITS = [['Background', 'Ink', '12%'], ['Tile', 'Black giwa', '4%'], ['Seal', 'Moon', '7%'], ['Aura', 'Silver', '2%'], ['Eyes', 'Closed', '9%'], ['Lineage', 'Guardian', '15%']];

export default function Item() {
  const { slug, id } = useParams();
  const c = bySlug[slug];
  const { address, connect } = useWallet();
  const [step, setStep] = useState('idle');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);
  if (!c) return <Navigate to="/explore" replace />;

  const price = +(c.floor * 1.08).toFixed(3);
  const me = address ? short(address) : 'you';
  const buy = async () => {
    if (!address) { await connect(); return; }
    setStep('pending');
    t.current = setTimeout(() => setStep('done'), 1900); // TODO: call marketplace contract
  };
  const onMove = e => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -8, y: ((e.clientX - r.left) / r.width - 0.5) * 8 });
  };
  const history = [
    ['Listed', eth(price), '0x4b1e…c07a', '—', '6 min ago'],
    ['Sale', eth(+(price * 0.86).toFixed(3)), '0x91ad…2f3b', '0x4b1e…c07a', '3 days ago'],
    ['Offer', eth(+(price * 0.79).toFixed(3)), '0x2c77…aa10', '—', '4 days ago'],
    ['Minted', eth(0.02), '0x0000…0000', '0x91ad…2f3b', '21 days ago']
  ];
  if (step === 'done') history.unshift(['Sale', eth(price), '0x4b1e…c07a', me, 'just now']);

  return (
    <div className="page wrap">
      <Link to={`/collection/${slug}`} className="back">← {c.name}</Link>
      <div className="item">
        <Reveal className="item-art-wrap">
          <div className="item-art" onMouseMove={onMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            style={{ transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
            <Artwork seed={c.seed * 100 + Number(id) % 50} label={`${c.name} #${id}`} />
            <span className="item-glare" style={{ background: `radial-gradient(circle at ${50 + tilt.y * 6}% ${50 - tilt.x * 6}%, rgba(255,255,255,.12), transparent 55%)` }} />
          </div>
        </Reveal>

        <Reveal className="item-info" delay={120}>
          <Link to={`/collection/${slug}`} className="eyebrow ink">{c.name}{c.verified && <span className="tick">✦</span>}</Link>
          <h1 className="display">#{id}</h1>
          <p className="muted">Owned by <span className="mono ink">{step === 'done' ? me : '0x4b1e…c07a'}</span> · ERC-721 on GIWA</p>

          <div className="buybox">
            {step === 'idle' && (
              <>
                <span className="eyebrow">Current price</span>
                <div className="price"><span className="mono">{price}</span><small>ETH</small></div>
                <p className="muted small">Sale ends in 2 days · network fee ≈ 0.00002 ETH</p>
                <div className="actions">
                  <button className="btn btn-light grow" onClick={buy}>{address ? 'Buy now' : 'Connect to buy'}</button>
                  <button className="btn btn-ghost grow">Make offer</button>
                </div>
              </>
            )}
            {step === 'pending' && (
              <div className="state"><span className="spinner" /><div><b>Confirm in your wallet…</b><p className="muted small">Purchasing #{id} for {eth(price)}</p></div></div>
            )}
            {step === 'done' && (
              <div className="state">
                <svg className="check" viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" /><path d="M15 27l7 7 15-16" /></svg>
                <div className="grow"><b>#{id} is yours.</b><p className="muted small">Confirmed on GIWA Sepolia.</p></div>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep('idle')}>Done</button>
              </div>
            )}
          </div>

          <div>
            <h2 className="h3">Traits</h2>
            <div className="traits">
              {TRAITS.map(([k, v, p]) => (
                <div key={k} className="trait"><span className="eyebrow">{k}</span><b>{v}</b><span className="mono muted small">{p} have this</span></div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <section className="section-sm">
        <h2 className="h3">Provenance</h2>
        <div className="table">
          <div className="tr th"><span>Event</span><span>Price</span><span>From</span><span>To</span><span>Date</span></div>
          {history.map((r, i) => (
            <div key={i} className={`tr ${i === 0 && step === 'done' ? 'flash' : ''}`}>
              <span><b>{r[0]}</b></span><span className="mono">{r[1]}</span><span className="mono muted">{r[2]}</span><span className="mono muted">{r[3]}</span><span className="muted">{r[4]}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
