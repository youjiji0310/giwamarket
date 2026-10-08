import { Link } from 'react-router-dom';
import Artwork from '../lib/art.jsx';
import { ethShort } from '../lib/data.js';

// OpenSea-style item card: art, name, price, last sale, and a buy bar on hover.
export default function NftCard({ item, inCart, onToggle, owned, note }) {
  const href = `/item/${item.slug}/${item.id}`;
  return (
    <article className={`card ${inCart ? 'sel' : ''}`}>
      <Link to={href} className="card-art" aria-label={`${item.collection} #${item.id}`}>
        <Artwork seed={item.seed} />
        {item.rank != null && <span className="card-rank">#{item.rank.toLocaleString('en-US')}</span>}
        {inCart && <span className="card-check" aria-label="In cart"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg></span>}
      </Link>
      <div className="card-body">
        <Link to={href} className="card-name">{item.collection} #{item.id}</Link>
        <div className="card-price">
          {item.listed && item.price != null ? <b className="mono">{ethShort(item.price)} ETH</b> : <span className="muted">{owned ? 'Owned' : 'Not listed'}</span>}
        </div>
        <div className="card-meta muted xs">{note ?? (item.lastSale ? `Last sale ${ethShort(item.lastSale)} ETH` : '')}</div>
      </div>
      {item.listed && onToggle && (
        <div className="card-actions">
          <button className="card-buy" onClick={onToggle}>{inCart ? 'Remove from cart' : 'Add to cart'}</button>
        </div>
      )}
    </article>
  );
}
