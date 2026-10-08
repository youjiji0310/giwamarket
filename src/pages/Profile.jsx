import { useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import Avatar from '../components/Avatar.jsx';
import NftCard from '../components/NftCard.jsx';
import { IExt } from '../components/Icons.jsx';
import { useWallet, short, GIWA } from '../lib/wallet.jsx';
import { eth } from '../lib/data.js';

const ago = t => {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function Profile() {
  const { address, wallets, balanceOf, fmt, owned, connect } = useWallet();
  const [tab, setTab] = useState('collected');
  const [copied, setCopied] = useState(false);

  if (!address) {
    return (
      <div className="page wrap center-page">
        <span className="eyebrow">Profile</span>
        <h1 className="h1">Connect to see <em>your collection.</em></h1>
        <button className="btn btn-light" onClick={connect}>Connect wallet</button>
      </div>
    );
  }

  const copy = async () => { try { await navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch {} };
  const spent = owned.reduce((s, i) => s + (i.price || 0), 0);

  return (
    <div className="page wrap">
      <Reveal className="prof-head">
        <Avatar address={address} size={120} />
        <div className="prof-id">
          <span className="eyebrow">Collector</span>
          <h1 className="h1 prof-name">{short(address)}</h1>
          <div className="prof-links">
            <button className="btn-mini" onClick={copy}>{copied ? 'Copied' : 'Copy address'}</button>
            <a className="btn-mini" href={`${GIWA.blockExplorerUrls[0]}/address/${address}`} target="_blank" rel="noreferrer">Explorer <IExt width="12" height="12" /></a>
          </div>
        </div>
      </Reveal>

      <Reveal className="col-stats prof-stats" delay={100}>
        {[['Balance', fmt(balanceOf(address))], ['Works held', String(owned.length)], ['Spent', `${spent.toFixed(3)} ETH`], ['Wallets', String(wallets.length)]].map(([k, v]) => (
          <div key={k}><span className="eyebrow">{k}</span><span className="mono big">{v}</span></div>
        ))}
      </Reveal>

      <div className="toolbar">
        <div className="seg" role="tablist" aria-label="Profile sections">
          {[['collected', `Collected · ${owned.length}`], ['activity', 'Activity']].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </div>

      {tab === 'collected' && (owned.length ? (
        <div className="grid-nft">
          {owned.map((it, i) => (
            <Reveal key={`${it.slug}${it.id}`} delay={(i % 4) * 70}>
              <NftCard item={{ ...it, price: null }} meta={it.price != null ? `Paid ${eth(it.price)}` : 'Minted'} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="empty">
          <p className="h3">Nothing here yet.</p>
          <p className="muted">Works you buy, sweep or mint on GiwaMarket appear here.</p>
          <div className="actions"><Link to="/explore" className="btn btn-light">Explore collections</Link><Link to="/launchpad" className="btn btn-ghost">Mint a drop</Link></div>
        </div>
      ))}

      {tab === 'activity' && (
        <div className="table">
          <div className="tr th"><span>Event</span><span>Item</span><span>Price</span><span>Wallet</span><span>Date</span></div>
          {owned.length ? owned.map(i => (
            <div key={`${i.slug}${i.id}`} className="tr">
              <span><b>{i.price != null ? 'Bought' : 'Minted'}</b></span>
              <Link to={`/item/${i.slug}/${i.id}`}>{i.collection} #{i.id}</Link>
              <span className="mono">{i.price != null ? eth(i.price) : '—'}</span>
              <span className="mono muted">{short(address)}</span>
              <span className="muted">{ago(i.at)}</span>
            </div>
          )) : <div className="tr"><span className="muted">No activity yet.</span></div>}
        </div>
      )}
    </div>
  );
}
