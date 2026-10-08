import { useEffect, useRef, useState } from 'react';
import Artwork from '../lib/art.jsx';
import { Seg } from '../components/bits.jsx';
import { drops, eth, num } from '../lib/data.js';
import { useCountdown } from '../lib/hooks.js';
import { useWallet } from '../lib/wallet.jsx';

function MintPanel({ d }) {
  const { address, connect, addOwned } = useWallet();
  const live = d.phase === 'Live';
  const time = useCountdown(live ? d.endsInH : d.startsInH);
  const [qty, setQty] = useState(1);
  const [minted, setMinted] = useState(d.minted);
  const [step, setStep] = useState('form');
  const [last, setLast] = useState(1);
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);
  useEffect(() => { setMinted(d.minted); setStep('form'); setQty(1); }, [d]);
  const p = Math.round((minted / d.supply) * 100);
  const phases = [
    ['Allowlist', d.stage === 'Allowlist' && live ? 'Live' : live ? 'Ended' : 'Upcoming', `${eth(+(d.price * 0.75).toFixed(4))} · 2 per wallet`],
    ['Public', d.stage !== 'Allowlist' && live ? 'Live' : 'Upcoming', `${eth(d.price)} · 5 per wallet`]
  ];
  const mint = async () => {
    if (!address) { const ok = await connect(); if (!ok) return; }
    setStep('pending');
    // TODO: drop contract mint
    t.current = setTimeout(() => {
      addOwned(Array.from({ length: qty }, (_, k) => ({ slug: d.slug, id: minted + k + 1, collection: d.title, price: null, seed: d.seed * 10 + minted + k })));
      setMinted(m => Math.min(d.supply, m + qty)); setLast(qty); setStep('done');
    }, 1900);
  };
  return (
    <div className="drop-hero">
      <div className="drop-art"><Artwork seed={d.seed} /></div>
      <div className="drop-panel">
        <span className={`pill ${live ? 'live' : ''}`}>{live && <span className="net-dot" />}{live ? `Minting now · ${d.stage}` : 'Upcoming'}</span>
        <h1 className="h1">{d.title}</h1>
        <p className="muted">By <span className="ink">{d.creator}</span> · Edition of {num(d.supply)} · ERC-721 on GIWA</p>

        <div className="mintbox">
          <div className="row-between">
            <div><span className="label">Price</span><b className="mono big">{eth(d.price)}</b></div>
            <div className="r"><span className="label">{live ? 'Ends in' : 'Starts in'}</span><b className="mono big">{time}</b></div>
          </div>
          <div className="row-between small"><span className="muted">{p}% minted</span><span className="mono muted">{num(minted)} / {num(d.supply)}</span></div>
          <div className="bar"><span style={{ width: `${p}%` }} /></div>
          {step === 'form' && (live ? (
            <div className="mint-row">
              <div className="stepper">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                <span className="mono" aria-live="polite">{qty}</span>
                <button onClick={() => setQty(q => Math.min(5, q + 1))} aria-label="Increase quantity">+</button>
              </div>
              <button className="btn btn-light grow" onClick={mint}>{address ? `Mint ${qty} · ${(qty * d.price).toFixed(3)} ETH` : 'Connect to mint'}</button>
            </div>
          ) : <button className="btn btn-ghost block" disabled>Mint opens in {time}</button>)}
          {step === 'pending' && <div className="state"><span className="spinner" /><div><b>Minting</b><p className="muted small">Confirm {(qty * d.price).toFixed(3)} ETH in your wallet.</p></div></div>}
          {step === 'done' && <div className="state">
            <svg className="check" viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" /><path d="M15 27l7 7 15-16" /></svg>
            <div className="grow"><b>{last} minted</b><p className="muted small">They are in your profile.</p></div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setStep('form'); setQty(1); }}>Mint more</button>
          </div>}
        </div>

        <div className="phases">
          {phases.map(([n, s, m]) => (
            <div key={n} className={`phase ${s === 'Live' ? 'on' : ''}`}>
              <div><b>{n}</b><span className="muted xs">{m}</span></div>
              <span className={`pill ${s === 'Live' ? 'live' : ''}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Drops() {
  const [sel, setSel] = useState(drops[0]);
  const [tab, setTab] = useState('Live');
  const list = drops.filter(d => d.phase === tab);
  return (
    <div className="page">
      <MintPanel d={sel} />
      <section className="block">
        <div className="block-head">
          <h2 className="h2">Drops</h2>
          <Seg options={['Live', 'Upcoming']} value={tab} onChange={setTab} label="Drop status" />
        </div>
        <div className="drop-grid">
          {list.map(d => {
            const p = Math.round((d.minted / d.supply) * 100);
            return (
              <button key={d.title} className={`dcard ${sel.title === d.title ? 'sel' : ''}`} onClick={() => { setSel(d); scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <div className="dcard-art"><Artwork seed={d.seed} /><span className={`pill on-art ${d.phase === 'Live' ? 'live' : ''}`}>{d.phase === 'Live' ? d.stage : 'Upcoming'}</span></div>
                <div className="dcard-body">
                  <b className="ell">{d.title}</b><span className="muted xs">by {d.creator}</span>
                  <div className="dcard-row"><span className="mono">{eth(d.price)}</span><span className="muted xs">{num(d.supply)} items</span></div>
                  {d.phase === 'Live' && <div className="bar"><span style={{ width: `${p}%` }} /></div>}
                </div>
              </button>
            );
          })}
        </div>
      </section>
      <section className="cta-box" id="create">
        <div><h2 className="h2">Launch your collection on GIWA</h2><p className="muted">Upload artwork, set supply, phases and creator earnings. We deploy the contract and give you a mint page.</p></div>
        <a className="btn btn-light" href="https://github.com/youjiji0310/giwamarket" target="_blank" rel="noreferrer">Apply to launch</a>
      </section>
    </div>
  );
}
