import { useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Artwork from '../lib/art.jsx';
import Reveal from '../components/Reveal.jsx';
import NftCard from '../components/NftCard.jsx';
import { bySlug, itemsFor, eth, num } from '../lib/data.js';

export default function Collection() {
  const { slug } = useParams();
  const c = bySlug[slug];
  const [sort, setSort] = useState('low');
  const [listedOnly, setListedOnly] = useState(false);
  const [cart, setCart] = useState({});
  const all = useMemo(() => (c ? itemsFor(slug, 16) : []), [slug]);
  if (!c) return <Navigate to="/explore" replace />;

  const items = all
    .filter(i => !listedOnly || i.listed)
    .sort((a, b) => sort === 'rare' ? a.rank - b.rank : sort === 'low' ? (a.price ?? 99) - (b.price ?? 99) : (b.price ?? 0) - (a.price ?? 0));
  const inCart = Object.values(cart).filter(Boolean).length;
  const total = all.filter(i => cart[i.id]).reduce((s, i) => s + i.price, 0);

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
          {[['Floor', eth(c.floor)], ['Best offer', eth(+(c.floor * 0.95).toFixed(3))], ['Volume', `${num(c.volume)} ETH`], ['Listed', '6.4%'], ['Owners', num(c.owners)], ['Royalty', `${c.royalty}%`]].map(([k, v]) => (
            <div key={k}><span className="eyebrow">{k}</span><span className="mono big">{v}</span></div>
          ))}
        </Reveal>

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
            <Reveal key={it.id} delay={(i % 4) * 70}>
              <NftCard
                item={it}
                action={it.listed ? (
                  <button className={`btn-mini ${cart[it.id] ? 'on' : ''}`} onClick={() => setCart(s => ({ ...s, [it.id]: !s[it.id] }))}
                    aria-label={cart[it.id] ? `Remove #${it.id} from cart` : `Add #${it.id} to cart`}>
                    {cart[it.id] ? 'Added' : 'Add'}
                  </button>
                ) : <span className="muted small">Rank {it.rank}</span>}
              />
            </Reveal>
          ))}
        </div>
      </div>

      <div className={`cartbar ${inCart ? 'show' : ''}`} role="region" aria-label="Cart">
        <span><b>{inCart}</b> item{inCart > 1 ? 's' : ''} · <span className="mono">{total.toFixed(3)} ETH</span></span>
        <div className="actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setCart({})}>Clear</button>
          <button className="btn btn-light btn-sm">Checkout</button>
        </div>
      </div>
    </div>
  );
}
