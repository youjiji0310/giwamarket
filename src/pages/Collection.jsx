import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Artwork from '../lib/art.jsx';
import Reveal from '../components/Reveal.jsx';
import NftCard from '../components/NftCard.jsx';
import { IBroom } from '../components/Icons.jsx';
import { bySlug, itemsFor, eth, num } from '../lib/data.js';
import { useWallet } from '../lib/wallet.jsx';

export default function Collection() {
  const { slug } = useParams();
  const c = bySlug[slug];
  const { address, connect, addOwned } = useWallet();
  const [sort, setSort] = useState('low');
  const [listedOnly, setListedOnly] = useState(false);
  const [cart, setCart] = useState({});
  const [sold, setSold] = useState({});
  const [step, setStep] = useState('idle'); // idle | pending | done
  const [lastBuy, setLastBuy] = useState({ n: 0, total: 0 });
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);
  useEffect(() => { setCart({}); setSold({}); setStep('idle'); }, [slug]);
  const all = useMemo(() => (c ? itemsFor(slug, 24) : []), [slug]);
  if (!c) return <Navigate to="/explore" replace />;

  const available = all.filter(i => i.listed && !sold[i.id]).sort((a, b) => a.price - b.price);
  const items = all
    .map(i => (sold[i.id] ? { ...i, listed: false, price: null } : i))
    .filter(i => !listedOnly || i.listed)
    .sort((a, b) => sort === 'rare' ? a.rank - b.rank : sort === 'low' ? (a.price ?? 99) - (b.price ?? 99) : (b.price ?? 0) - (a.price ?? 0));
  const picked = available.filter(i => cart[i.id]);
  const inCart = picked.length;
  const total = picked.reduce((s, i) => s + i.price, 0);

  // Sweep = select the N cheapest listed items.
  const sweepTo = n => {
    const next = {};
    available.slice(0, n).forEach(i => { next[i.id] = true; });
    setCart(next);
  };
  const sweepN = inCart;
  const sweepCost = available.slice(0, sweepN).reduce((s, i) => s + i.price, 0);
  const isSweep = inCart > 0 && picked.every((p, i) => available[i] && available.slice(0, inCart).some(a => a.id === p.id));

  const checkout = async () => {
    if (!address) { const ok = await connect(); if (!ok) return; }
    setStep('pending');
    // TODO: replace with the marketplace contract's batch buy.
    t.current = setTimeout(() => {
      setSold(s => { const n = { ...s }; picked.forEach(i => { n[i.id] = true; }); return n; });
      addOwned(picked.map(i => ({ slug, id: i.id, collection: c.name, price: i.price, seed: i.seed })));
      setLastBuy({ n: picked.length, total });
      setCart({});
      setStep('done');
    }, 2000);
  };

  return (
    <div className="page-flush">
      <div className="cover"><Artwork seed={c.seed + 500} style="tiles" /></div>
      <div className="wrap">
        <Reveal className="col-id">
          <div className="col-avatar"><Artwork seed={c.seed} /></div>
          <div>
            <h1 className="h1 col-title">{c.name}{c.verified && <span className="tick" title="Verified">✦</span>}</h1>
            <p className="muted">by <span className="ink">{c.creator}</span> · {num(c.items)} items · {c.royalty}% royalties</p>
          </div>
        </Reveal>
        <Reveal as="p" className="lead col-blurb" delay={80}>{c.blurb}</Reveal>

        <Reveal className="col-stats" delay={140}>
          {[['Floor', available[0] ? eth(available[0].price) : '—'], ['Best offer', eth(+(c.floor * 0.95).toFixed(3))], ['Volume', `${num(c.volume)} ETH`], ['Listed', `${available.length} / ${all.length}`], ['Owners', num(c.owners)], ['Royalty', `${c.royalty}%`]].map(([k, v]) => (
            <div key={k}><span className="eyebrow">{k}</span><span className="mono big">{v}</span></div>
          ))}
        </Reveal>

        {/* Sweep */}
        <section className="sweep" aria-label="Sweep the floor">
          <div className="sweep-label"><IBroom /><div><b>Sweep the floor</b><span className="muted small">Select the cheapest listings in one move.</span></div></div>
          <div className="sweep-ctrl">
            <input id="sweep-range" type="range" min="0" max={available.length} value={Math.min(inCart, available.length)}
              onChange={e => sweepTo(+e.target.value)} aria-label="Number of items to sweep"
              style={{ '--fill': `${available.length ? (inCart / available.length) * 100 : 0}%` }} />
            <div className="stepper sm">
              <button onClick={() => sweepTo(Math.max(0, inCart - 1))} aria-label="One less">−</button>
              <span className="mono" aria-live="polite">{inCart}</span>
              <button onClick={() => sweepTo(Math.min(available.length, inCart + 1))} aria-label="One more">+</button>
            </div>
            <div className="sweep-quick">
              {[5, 10].filter(n => n <= available.length).map(n => <button key={n} className="btn-mini" onClick={() => sweepTo(n)}>{n}</button>)}
              <button className="btn-mini" onClick={() => sweepTo(available.length)}>All</button>
            </div>
          </div>
          <div className="sweep-sum">
            <span className="muted small">{inCart ? `${inCart} item${inCart > 1 ? 's' : ''} · avg ${(total / inCart).toFixed(3)} ETH` : `${available.length} listed`}</span>
            <span className="sweep-total">{total.toFixed(3)} <small>ETH</small></span>
          </div>
        </section>

        <div className="toolbar">
          <button className={`switch ${listedOnly ? 'on' : ''}`} onClick={() => setListedOnly(v => !v)} aria-pressed={listedOnly}>
            <span className="switch-track"><span /></span>Buy now only
          </button>
          <div className="seg" role="tablist" aria-label="Sort">
            {[['low', 'Price ↑'], ['high', 'Price ↓'], ['rare', 'Rarity']].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={sort === k} className={sort === k ? 'on' : ''} onClick={() => setSort(k)}>{l}</button>
            ))}
          </div>
        </div>

        <div className="grid-nft">
          {items.map((it, i) => (
            <Reveal key={it.id} delay={(i % 4) * 70} className={cart[it.id] ? 'in-cart' : ''}>
              <NftCard
                item={it}
                action={it.listed ? (
                  <button className={`btn-mini ${cart[it.id] ? 'on' : ''}`} onClick={() => setCart(s => ({ ...s, [it.id]: !s[it.id] }))}
                    aria-label={cart[it.id] ? `Remove #${it.id} from cart` : `Add #${it.id} to cart`}>
                    {cart[it.id] ? 'Added' : 'Add'}
                  </button>
                ) : <span className="muted small">{sold[it.id] ? 'Yours' : `Rank ${it.rank}`}</span>}
              />
            </Reveal>
          ))}
        </div>
      </div>

      <div className={`cartbar ${inCart || step !== 'idle' ? 'show' : ''}`} role="region" aria-label="Cart">
        {step === 'idle' && <>
          <span className="cart-sum">
            {isSweep && inCart > 1 && <span className="chip-in"><IBroom width="14" height="14" />Sweep</span>}
            <b>{inCart}</b> item{inCart > 1 ? 's' : ''} · <span className="mono">{total.toFixed(3)} ETH</span>
          </span>
          <div className="actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setCart({})}>Clear</button>
            <button className="btn btn-light btn-sm" onClick={checkout}>{address ? (isSweep && inCart > 1 ? `Sweep ${inCart}` : 'Buy now') : 'Connect to buy'}</button>
          </div>
        </>}
        {step === 'pending' && <span className="cart-state"><span className="spinner sm" />Confirm in your wallet · {inCart} item{inCart > 1 ? 's' : ''} for {total.toFixed(3)} ETH</span>}
        {step === 'done' && <>
          <span className="cart-state"><svg className="check sm" viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" /><path d="M15 27l7 7 15-16" /></svg>{lastBuy.n} work{lastBuy.n > 1 ? 's' : ''} collected · {lastBuy.total.toFixed(3)} ETH</span>
          <div className="actions">
            <Link to="/profile" className="btn btn-light btn-sm">View in profile</Link>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep('idle')}>Close</button>
          </div>
        </>}
      </div>
    </div>
  );
}
