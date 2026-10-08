import { Link } from 'react-router-dom';
import Artwork from '../lib/art.jsx';
import { eth } from '../lib/data.js';

export default function NftCard({ item, meta, action }) {
  return (
    <article className="nft">
      <Link to={`/item/${item.slug}/${item.id}`} className="nft-art" data-cursor="View" aria-label={`${item.collection} #${item.id}`}>
        <Artwork seed={item.seed} />
      </Link>
      <div className="nft-body">
        <span className="eyebrow">{item.collection}</span>
        <Link to={`/item/${item.slug}/${item.id}`} className="nft-name">#{item.id}</Link>
        <div className="nft-foot">
          <span className="mono">{item.price != null ? eth(item.price) : 'Not listed'}</span>
          {action ?? <span className="muted small">{meta}</span>}
        </div>
      </div>
    </article>
  );
}
