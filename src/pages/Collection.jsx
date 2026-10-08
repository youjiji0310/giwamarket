import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Artwork from '../lib/art.jsx';
import NftCard from '../components/NftCard.jsx';
import { ActivityTable } from './Activity.jsx';
import { Tabs, Change } from '../components/bits.jsx';
import { IVerified, IFilter, ISearch, IGrid, IBroom, IExt } from '../components/Icons.jsx';
import { bySlug, itemsFor, activityFeed, TRAIT_TYPES, traitValues, eth, ethShort, compact, num, shortAddr } from '../lib/data.js';
import { useWallet, GIWA } from '../lib/wallet.jsx';

export default function Collection() {
  const { slug } = useParams();
  const c = bySlug[slug];
  const { address, connect, addOwned } = useWallet();
  const [tab, setTab] = useState('items');
  const [showFilters, setShowFilters] = useState(() => innerWidth > 1100);
  const [status, setStatus] = useState('all');
  const [minP, setMinP] = useState(''); const [maxP, setMaxP] = useState('');
  const [traits, setTraits] = useState({});
  const [openTrait, setOpenTrait] = useState(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('low');
  const [dense, setDense] = useState(false);
  const [cart, setCart] = useState({});
  const [sold, setSold] = useState({});
  const [step, setStep] = useState('idle');
  const [last, setLast] = useState({ n: 0, total: 0 });
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);
  useEffect(() => { setCart({}); setSold({}); setStep('idle'); setTraits({}); setTab('items'); }, [slug]);
  const all = useMemo(() => (c ? itemsFor(slug, 40) : []), [slug]);
  const activity = useMemo(() => (c ? activityFeed(24, slug) : []), [slug]);
  if (!c) return <Navigate to="/collections" replace />;

  const live = all.map(i => (sold[i.id] ? { ...i, listed: false, price: null, mine: true } : i));
  const available = live.filter(i => i.listed).sort((a, b) => a.price - b.price);
  const activeTraits = Object.entries(traits).filter(([, set]) => set.size);
  const shown = live
    .filter(i => status === 'all' || i.listed)
    .filter(i => !minP || (i.price != null && i.price >= +minP))
    .filter(i => !maxP || (i.price != null && i.price <= +maxP))
    .filter(i => activeTraits.every(([k, set]) => set.has(i.traits[k])))
    .filter(i => !q || String(i.id).includes(q.trim()))
    .sort((a, b) => sort === 'rare' ? a.rank - b.rank : sort === 'high' ? (b.price ?? -1) - (a.price ?? -1) : sort === 'recent' ? b.id % 17 - a.id % 17 : (a.price ?? 1e9) - (b.price ?? 1e9));
  const counts = k => Object.fromEntries(traitValues(k).map(v => [v, all.filter(i => i.traits[k] === v).length]));
  const toggleTrait = (k, v) => setTraits(s => { const n = new Set(s[k] || []); n.has(v) ? n.delete(v) : n.add(v); return { ...s, [k]: n }; });

  const picked = available.filter(i => cart[i.id]);
  const total = picked.reduce((s, i) => s + i.price, 0);
  const sweepTo = n => { const next = {}; available.slice(0, n).forEach(i => { next[i.id] = true; }); setCart(next); };
  const checkout = async () => {
    if (!picked.length) return;
    if (!address) { const ok = await connect(); if (!ok) return; }
    setStep('pending');
    // TODO: marketplace contract batch buy
    t.current = setTimeout(() => {
      setSold(s => { const n = { ...s }; picked.forEach(i => { n[i.id] = true; }); return n; });
      addOwned(picked.map(i => ({ slug, id: i.id, collection: c.name, price: i.price, seed: i.seed })));
      setLast({ n: picked.length, total }); setCart({}); setStep('done');
    }, 1900);
  };

  return (
    <div className="colpage">
      <div className="col-banner"><Artwork seed={c.seed + 500} style="tiles" /></div>
      <div className="page col-page">
        <header className="col-head">
          <div className="col-avatar"><Artwork seed={c.seed} /></div>
          <div className="col-head-main">
            <h1 className="h1 col-name">{c.name}{c.verified && <IVerified className="vf" width="22" height="22" />}</h1>
            <p className="muted">By <span className="ink">{c.creator}</span></p>
            <div className="meta-chips">
              <span>Items <b>{num(c.items)}</b></span><span>Created <b>{c.created}</b></span><span>Creator earnings <b>{c.royalty}%</b></span><span>Chain <b>GIWA</b></span><span>Category <b>{c.category}</b></span>
            </div>
          </div>
        </header>

        <div className="stat-row">
          {[['Floor price', eth(available[0]?.price ?? c.floor)], ['Top offer', eth(c.topOffer)], ['24h volume', `${compact(c.vol24)} ETH`], ['Total volume', `${compact(c.totalVolume)} ETH`], ['Listed', `${c.listedPct}%`], ['Owners', `${num(c.owners)} (${Math.round((c.owners / c.items) * 100)}%)`]].map(([k, v]) => (
            <div key={k}><b className="mono">{v}</b><span className="label">{k}</span></div>
          ))}
          <div><b><Change v={c.change['24h']} /></b><span className="label">24h change</span></div>
        </div>

        <Tabs tabs={[['items', 'Items'], ['offers', 'Offers'], ['activity', 'Activity'], ['about', 'About']]} value={tab} onChange={setTab} label="Collection sections" />

        {tab === 'items' && (
          <>
            <div className="toolbar">
              <button className={`tool-btn ${showFilters ? 'on' : ''}`} onClick={() => setShowFilters(v => !v)} aria-pressed={showFilters} aria-label="Toggle filters"><IFilter /><span className="hide-sm">Filters</span></button>
              <label className="tool-search"><ISearch /><span className="sr">Search by token ID</span><input id="col-search" value={q} onChange={e => setQ(e.target.value.replace(/\D/g, ''))} placeholder="Search by ID" inputMode="numeric" /></label>
              <span className="muted small hide-sm">{shown.length} results</span>
              <label className="sr" htmlFor="col-sort">Sort</label>
              <select id="col-sort" className="select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="low">Price low to high</option><option value="high">Price high to low</option><option value="rare">Rarity</option><option value="recent">Recently listed</option>
              </select>
              <button className={`tool-btn ${dense ? 'on' : ''}`} onClick={() => setDense(v => !v)} aria-pressed={dense} aria-label="Compact grid"><IGrid /></button>
            </div>

            <div className={`items-layout ${showFilters ? 'with-filters' : ''}`}>
              {showFilters && (
                <aside className="filters" aria-label="Filters">
                  <div className="f-group">
                    <span className="f-title">Status</span>
                    <div className="f-radio">
                      {[['all', 'All'], ['buy', 'Buy now']].map(([k, l]) => <button key={k} className={status === k ? 'on' : ''} onClick={() => setStatus(k)} aria-pressed={status === k}>{l}</button>)}
                    </div>
                  </div>
                  <div className="f-group">
                    <span className="f-title">Price (ETH)</span>
                    <div className="f-price">
                      <label className="sr" htmlFor="f-min">Minimum price</label><input id="f-min" inputMode="decimal" placeholder="Min" value={minP} onChange={e => setMinP(e.target.value.replace(',', '.'))} />
                      <span className="muted">to</span>
                      <label className="sr" htmlFor="f-max">Maximum price</label><input id="f-max" inputMode="decimal" placeholder="Max" value={maxP} onChange={e => setMaxP(e.target.value.replace(',', '.'))} />
                    </div>
                  </div>
                  <div className="f-group">
                    <span className="f-title">Traits</span>
                    {TRAIT_TYPES.map(k => {
                      const cnt = counts(k), sel = traits[k] || new Set();
                      return (
                        <div key={k} className={`acc ${openTrait === k ? 'open' : ''}`}>
                          <button className="acc-head" onClick={() => setOpenTrait(o => (o === k ? null : k))} aria-expanded={openTrait === k}>
                            <span>{k}</span><span className="muted xs">{sel.size ? `${sel.size} selected` : traitValues(k).length}</span>
                          </button>
                          {openTrait === k && (
                            <div className="acc-body">
                              {traitValues(k).map(v => (
                                <label key={v} className="check-row">
                                  <input type="checkbox" checked={sel.has(v)} onChange={() => toggleTrait(k, v)} />
                                  <span className="grow">{v}</span><span className="muted xs mono">{cnt[v]}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {(activeTraits.length > 0 || minP || maxP || status !== 'all') && (
                    <button className="btn btn-ghost btn-sm block" onClick={() => { setTraits({}); setMinP(''); setMaxP(''); setStatus('all'); }}>Clear all filters</button>
                  )}
                </aside>
              )}
              <div className={`grid ${dense ? 'dense' : ''}`}>
                {shown.map(it => (
                  <NftCard key={it.id} item={it} owned={it.mine} inCart={!!cart[it.id]} onToggle={() => setCart(s => ({ ...s, [it.id]: !s[it.id] }))} />
                ))}
                {!shown.length && <p className="muted grid-empty">No items match these filters.</p>}
              </div>
            </div>

            <div className="buybar" role="region" aria-label="Cart and sweep">
              {step === 'idle' && <>
                <button className="btn btn-ghost btn-sm" onClick={() => sweepTo(1)} disabled={!available.length}>Buy floor</button>
                <div className="sweep">
                  <IBroom />
                  <label className="sr" htmlFor="sweep-range">Sweep</label>
                  <input id="sweep-range" type="range" min="0" max={available.length} value={picked.length} onChange={e => sweepTo(+e.target.value)}
                    style={{ '--fill': `${available.length ? (picked.length / available.length) * 100 : 0}%` }} />
                  <input className="sweep-n mono" aria-label="Number of items to sweep" inputMode="numeric" value={picked.length}
                    onChange={e => sweepTo(Math.min(available.length, +e.target.value.replace(/\D/g, '') || 0))} />
                </div>
                <div className="buybar-sum">
                  <span className="muted xs">{picked.length ? `${picked.length} item${picked.length > 1 ? 's' : ''}` : 'Sweep the floor'}</span>
                  <b className="mono">{total.toFixed(4)} ETH</b>
                </div>
                <button className="btn btn-light btn-sm" onClick={checkout} disabled={!picked.length}>{address ? `Buy ${picked.length || ''}`.trim() : 'Connect to buy'}</button>
              </>}
              {step === 'pending' && <span className="buybar-state"><span className="spinner sm" />Confirm in your wallet · {picked.length} item{picked.length > 1 ? 's' : ''} for {total.toFixed(4)} ETH</span>}
              {step === 'done' && <>
                <span className="buybar-state"><svg className="check sm" viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" /><path d="M15 27l7 7 15-16" /></svg>{last.n} item{last.n > 1 ? 's' : ''} bought for {last.total.toFixed(4)} ETH</span>
                <div className="actions"><Link to="/profile" className="btn btn-light btn-sm">View in profile</Link><button className="btn btn-ghost btn-sm" onClick={() => setStep('idle')}>Done</button></div>
              </>}
            </div>
          </>
        )}

        {tab === 'offers' && (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Offer</th><th className="r">Quantity</th><th className="r">Floor difference</th><th>From</th><th className="r">Expires</th></tr></thead>
              <tbody>
                {[0.96, 0.95, 0.93, 0.9, 0.88, 0.85].map((f, i) => (
                  <tr key={i}><td className="mono">{eth(+(c.floor * f).toFixed(4))}</td><td className="r mono">{[1, 3, 1, 5, 2, 10][i]}</td><td className="r"><Change v={(f - 1) * 100} /></td><td className="mono muted">{shortAddr(activity[i]?.from)}</td><td className="r muted">{i + 1} day{i ? 's' : ''}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'activity' && <ActivityTable rows={activity} showCollection={false} />}

        {tab === 'about' && (
          <div className="about">
            <div className="about-text"><h2 className="h2">About {c.name}</h2><p className="muted">{c.blurb}</p></div>
            <dl className="details">
              <div><dt>Contract address</dt><dd><a className="mono" href={`${GIWA.blockExplorerUrls[0]}/address/${c.contract}`} target="_blank" rel="noreferrer">{shortAddr(c.contract)} <IExt width="12" height="12" /></a></dd></div>
              <div><dt>Token standard</dt><dd>ERC-721</dd></div>
              <div><dt>Chain</dt><dd>GIWA Sepolia</dd></div>
              <div><dt>Creator earnings</dt><dd>{c.royalty}%</dd></div>
              <div><dt>Total supply</dt><dd className="mono">{num(c.items)}</dd></div>
              <div><dt>Floor</dt><dd className="mono">{ethShort(c.floor)} ETH</dd></div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
