import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Artwork from '../lib/art.jsx';
import NftCard from '../components/NftCard.jsx';
import PriceChart from '../components/PriceChart.jsx';
import { Rail, Change } from '../components/bits.jsx';
import { ActivityTable } from './Activity.jsx';
import { IVerified, IHeart, IEye, ITag, IExt } from '../components/Icons.jsx';
import { bySlug, itemDetail, itemsFor, activityFeed, eth, shortAddr, num } from '../lib/data.js';
import { useWallet, short, GIWA } from '../lib/wallet.jsx';

function Panel({ title, icon, children, open: start = true }) {
  const [open, setOpen] = useState(start);
  return (
    <section className={`panel ${open ? 'open' : ''}`}>
      <button className="panel-head" onClick={() => setOpen(o => !o)} aria-expanded={open}>{icon}<span>{title}</span><span className="chev-s" aria-hidden="true">▾</span></button>
      {open && <div className="panel-body">{children}</div>}
    </section>
  );
}

export default function Item() {
  const { slug, id } = useParams();
  const c = bySlug[slug];
  const { address, connect, addOwned } = useWallet();
  const d = useMemo(() => (c ? itemDetail(slug, id) : null), [slug, id]);
  const more = useMemo(() => (c ? itemsFor(slug, 12).filter(i => String(i.id) !== String(id)).slice(0, 10) : []), [slug, id]);
  const acts = useMemo(() => (c ? activityFeed(6, slug).map(a => ({ ...a, id: Number(id), seed: d?.seed })) : []), [slug, id]);
  const [step, setStep] = useState('idle');
  const [liked, setLiked] = useState(false);
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);
  useEffect(() => { setStep('idle'); }, [slug, id]);
  if (!c) return <Navigate to="/collections" replace />;

  const buy = async () => {
    if (!address) { const ok = await connect(); if (!ok) return; }
    setStep('pending');
    // TODO: marketplace contract buy
    t.current = setTimeout(() => { addOwned([{ slug, id: d.id, collection: c.name, price: d.price, seed: d.seed }]); setStep('done'); }, 1900);
  };
  const owner = step === 'done' ? short(address) : shortAddr(d.owner);

  return (
    <div className="page">
      <div className="item">
        <div className="item-left">
          <div className="item-art">
            <div className="item-art-top"><span className="muted xs">ERC-721</span><button className={`like ${liked ? 'on' : ''}`} onClick={() => setLiked(v => !v)} aria-pressed={liked} aria-label="Favorite"><IHeart />{d.likes + (liked ? 1 : 0)}</button></div>
            <Artwork seed={d.seed} label={`${c.name} #${d.id}`} />
          </div>
          <Panel title="Traits" icon={<ITag />}>
            <div className="traits">
              {Object.entries(d.traits).map(([k, v], i) => (
                <div key={k} className="trait"><span className="label">{k}</span><b>{v}</b><span className="muted xs">{[4, 9, 12, 7, 15][i]}% have this</span><span className="mono xs">Floor {eth(+(c.floor * (1 + i * 0.08)).toFixed(3))}</span></div>
              ))}
            </div>
          </Panel>
          <Panel title="Details" open={false}>
            <dl className="details">
              <div><dt>Contract address</dt><dd><a className="mono" href={`${GIWA.blockExplorerUrls[0]}/address/${c.contract}`} target="_blank" rel="noreferrer">{shortAddr(c.contract)} <IExt width="12" height="12" /></a></dd></div>
              <div><dt>Token ID</dt><dd className="mono">{d.id}</dd></div>
              <div><dt>Token standard</dt><dd>ERC-721</dd></div>
              <div><dt>Chain</dt><dd>GIWA Sepolia</dd></div>
              <div><dt>Creator earnings</dt><dd>{c.royalty}%</dd></div>
            </dl>
          </Panel>
        </div>

        <div className="item-right">
          <Link to={`/collection/${slug}`} className="item-col">{c.name}{c.verified && <IVerified className="vf" />}</Link>
          <h1 className="h1 item-name">{c.name} #{d.id}</h1>
          <div className="item-meta muted small">
            <span>Owned by <span className="ink mono">{owner}</span></span>
            <span><IEye width="15" height="15" /> {num(d.views)} views</span>
            <span>Rarity #{num(d.rank)}</span>
          </div>

          <div className="buybox">
            {step === 'idle' && <>
              <span className="label">Current price</span>
              <div className="price"><b className="mono">{d.price}</b><span>ETH</span></div>
              <div className="actions">
                <button className="btn btn-light grow" onClick={buy}>{address ? 'Buy now' : 'Connect to buy'}</button>
                <button className="btn btn-ghost grow">Make offer</button>
              </div>
              <p className="muted xs">Sale ends in 2 days · Top offer {eth(d.offers[0].price)}</p>
            </>}
            {step === 'pending' && <div className="state"><span className="spinner" /><div><b>Confirm in your wallet</b><p className="muted small">Buying #{d.id} for {eth(d.price)}</p></div></div>}
            {step === 'done' && <div className="state">
              <svg className="check" viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" /><path d="M15 27l7 7 15-16" /></svg>
              <div className="grow"><b>#{d.id} is yours</b><p className="muted small">Confirmed on GIWA Sepolia.</p></div>
              <Link to="/profile" className="btn btn-ghost btn-sm">Profile</Link>
            </div>}
          </div>

          <Panel title="Price history">
            <PriceChart data={d.history} />
          </Panel>

          <Panel title="Offers">
            <div className="table-wrap flat">
              <table className="tbl">
                <thead><tr><th>Price</th><th className="r">Floor diff.</th><th className="r">Expires</th><th>From</th></tr></thead>
                <tbody>{d.offers.map((o, i) => (
                  <tr key={i}><td className="mono">{eth(o.price)}</td><td className="r"><Change v={(o.price / c.floor - 1) * 100} /></td><td className="r muted">{o.exp}</td><td className="mono muted">{shortAddr(o.from)}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>

      <section className="block">
        <h2 className="h2 block-title">Item activity</h2>
        <ActivityTable rows={acts} showCollection={false} />
      </section>

      <Rail title={`More from ${c.name}`} action={<Link to={`/collection/${slug}`} className="btn btn-ghost btn-sm">View collection</Link>}>
        {more.map(it => <div className="rail-card" key={it.id}><NftCard item={it} /></div>)}
      </Rail>
    </div>
  );
}
