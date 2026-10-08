import { useEffect, useRef, useState } from 'react';
import Artwork from '../lib/art.jsx';
import Reveal from '../components/Reveal.jsx';
import { drops, eth, num } from '../lib/data.js';
import { useCountdown } from '../lib/hooks.js';
import { useWallet } from '../lib/wallet.jsx';

const PHASES = [
  { name: 'Allowlist', meta: 'Series I holders · 0.015 ETH · 2 max', status: 'Closed' },
  { name: 'Public', meta: '0.02 ETH · 5 per wallet', status: 'Live' },
  { name: 'Reveal', meta: '24 hours after sell-out', status: 'Upcoming' }
];

export default function Launchpad() {
  const d = drops[0];
  const { address, connect } = useWallet();
  const time = useCountdown(d.endsInH);
  const [qty, setQty] = useState(1);
  const [minted, setMinted] = useState(d.minted);
  const [step, setStep] = useState('form');
  const [last, setLast] = useState(1);
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);
  const pct = Math.round((minted / d.supply) * 100);

  const mint = async () => {
    if (!address) { await connect(); return; }
    setStep('pending');
    t.current = setTimeout(() => { setMinted(m => Math.min(d.supply, m + qty)); setLast(qty); setStep('done'); }, 1900); // TODO: call drop contract
  };

  return (
    <div className="page wrap">
      <section className="lp">
        <Reveal className="lp-stage">
          <div className="lp-card c1"><Artwork seed={51} style="monolith" /></div>
          <div className="lp-card c2"><Artwork seed={63} style="moon" /></div>
          <div className="lp-card c3"><Artwork seed={d.seed} style="orbit" /><span className="chip"><span className="live" /> Live</span></div>
        </Reveal>

        <Reveal className="lp-panel" delay={120}>
          <span className="eyebrow">Launchpad · {d.creator}</span>
          <h1 className="h1">{d.title.replace(/ II$/, '')} <em>II</em></h1>
          <p className="lead">The second series of guardians. {num(d.supply)} pieces. Series I holders received allowlist access.</p>

          <div className="row-between small"><span><b>{pct}%</b> minted</span><span className="mono muted">{num(minted)} / {num(d.supply)}</span></div>
          <div className="progress"><span style={{ width: `${pct}%` }} /></div>

          <ol className="phases">
            {PHASES.map(p => (
              <li key={p.name} className={`phase is-${p.status.toLowerCase()}`}>
                <span className="phase-dot" />
                <span className="grow"><b>{p.name}</b><span className="muted small">{p.meta}</span></span>
                <span className="small">{p.status === 'Live' ? <span className="mono">{time}</span> : p.status}</span>
              </li>
            ))}
          </ol>

          <div className="mintbox">
            {step === 'form' && (
              <>
                <div className="row-between">
                  <div><span className="eyebrow">Public price</span><div className="mono big">{eth(d.price)}</div></div>
                  <div className="stepper">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                    <span className="mono" aria-live="polite">{qty}</span>
                    <button onClick={() => setQty(q => Math.min(5, q + 1))} aria-label="Increase quantity">+</button>
                  </div>
                </div>
                <div className="row-between small muted line"><span>Total · max 5 per wallet</span><span className="mono ink">{(qty * d.price).toFixed(2)} ETH</span></div>
                <button className="btn btn-light block" onClick={mint}>{address ? `Mint ${qty}` : 'Connect to mint'}</button>
              </>
            )}
            {step === 'pending' && <div className="state"><span className="spinner" /><div><b>Minting…</b><p className="muted small">Confirm {(qty * d.price).toFixed(2)} ETH in your wallet.</p></div></div>}
            {step === 'done' && (
              <div className="state">
                <svg className="check" viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" /><path d="M15 27l7 7 15-16" /></svg>
                <div className="grow"><b>{last} minted.</b><p className="muted small">They'll appear in your profile after reveal.</p></div>
                <button className="btn btn-ghost btn-sm" onClick={() => { setStep('form'); setQty(1); }}>Mint more</button>
              </div>
            )}
          </div>
        </Reveal>
      </section>

      <section className="section">
        <Reveal className="sec-head">
          <div><span className="eyebrow">Calendar</span><h2 className="h2">All <em>drops</em></h2></div>
        </Reveal>
        <div className="drops">
          {drops.map((x, i) => (
            <Reveal key={x.title} delay={i * 90}>
              <div className="drop">
                <div className="drop-art"><Artwork seed={x.seed} /><span className="chip">{x.phase}</span></div>
                <div className="drop-body">
                  <div className="row-between"><span className="drop-title">{x.title}</span><span className="mono">{eth(x.price)}</span></div>
                  <div className="progress thin"><span style={{ width: `${Math.round((x.minted / x.supply) * 100)}%` }} /></div>
                  <div className="row-between small muted"><span>{num(x.minted)} / {num(x.supply)}</span><span>by {x.creator}</span></div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="atelier" className="section steps">
        <Reveal className="sec-head"><div><span className="eyebrow">For creators</span><h2 className="h2">Launch on <em>GIWA</em></h2></div></Reveal>
        <div className="steps-grid">
          {[['I', 'Upload', 'Artwork and metadata, as a folder or CSV. IPFS storage included.'],
            ['II', 'Configure', 'Supply, price, allowlist and public phases, wallet limits, royalties.'],
            ['III', 'Deploy', 'An ERC-721 contract deployed on GIWA from your wallet, with a mint page ready to share.']].map(([n, t, s], i) => (
            <Reveal key={n} delay={i * 100} className="step"><span className="step-n">{n}</span><b>{t}</b><p className="muted">{s}</p></Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
