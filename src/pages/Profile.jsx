import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import NftCard from '../components/NftCard.jsx';
import { IExt } from '../components/Icons.jsx';
import { Tabs } from '../components/bits.jsx';
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
      <div className="page empty-page">
                <h1 className="h1">Connect to see your collection.</h1>
        <button className="btn btn-light" onClick={connect}>Connect wallet</button>
      </div>
    );
  }

  const copy = async () => { try { await navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch {} };
  const spent = owned.reduce((s, i) => s + (i.price || 0), 0);

  return (
    <div className="page">
      <div className="prof-head">
        <Avatar address={address} size={120} />
        <div className="prof-id">
          <span className="label">Collector</span>
          <h1 className="h1 prof-name">{short(address)}</h1>
          <div className="prof-links">
            <button className="btn-mini" onClick={copy}>{copied ? 'Copied' : 'Copy address'}</button>
            <a className="btn-mini" href={`${GIWA.blockExplorerUrls[0]}/address/${address}`} target="_blank" rel="noreferrer">Explorer <IExt width="12" height="12" /></a>
          </div>
        </div>
      </div>

      <div className="stat-row prof-stats">
        {[['Balance', fmt(balanceOf(address))], ['Works held', String(owned.length)], ['Spent', `${spent.toFixed(3)} ETH`], ['Wallets', String(wallets.length)]].map(([k, v]) => (
          <div key={k}><b className="mono">{v}</b><span className="label">{k}</span></div>
        ))}
      </div>

      <Tabs tabs={[['collected', `Collected ${owned.length}`], ['activity', 'Activity']]} value={tab} onChange={setTab} label="Profile sections" />

      {tab === 'collected' && (owned.length ? (
        <div className="grid">
          {owned.map((it, i) => (
            <NftCard key={`${it.slug}${it.id}`} item={{ ...it, listed: false, price: null }} owned note={it.price != null ? `Paid ${eth(it.price)}` : 'Minted'} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <p className="h3">Nothing here yet.</p>
          <p className="muted">Works you buy, sweep or mint on GiwaMarket appear here.</p>
          <div className="actions"><Link to="/collections" className="btn btn-light">Explore collections</Link><Link to="/drops" className="btn btn-ghost">Mint a drop</Link></div>
        </div>
      ))}

      {tab === 'activity' && (
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Event</th><th>Item</th><th className="r">Price</th><th>Wallet</th><th className="r">Date</th></tr></thead>
            <tbody>
              {owned.length ? owned.map(i => (
                <tr key={`${i.slug}${i.id}`}>
                  <td><b>{i.price != null ? 'Bought' : 'Minted'}</b></td>
                  <td><Link to={`/item/${i.slug}/${i.id}`}>{i.collection} #{i.id}</Link></td>
                  <td className="r mono">{i.price != null ? eth(i.price) : '—'}</td>
                  <td className="mono muted">{short(address)}</td>
                  <td className="r muted">{ago(i.at)}</td>
                </tr>
              )) : <tr><td colSpan="5" className="muted">No activity yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
