import { Link } from 'react-router-dom';
import Artwork from '../lib/art.jsx';
import Reveal from '../components/Reveal.jsx';
import { collections, eth, num } from '../lib/data.js';

export default function Explore() {
  return (
    <div className="page wrap">
      <Reveal className="page-head">
        <span className="eyebrow">Explore</span>
        <h1 className="h1">The <em>collections</em></h1>
        <p className="lead">Every collection on GiwaMarket is reviewed before listing.</p>
      </Reveal>
      <div className="grid-col">
        {collections.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 3) * 90}>
            <Link to={`/collection/${c.slug}`} className="colcard">
              <div className="colcard-art" data-cursor="Enter"><Artwork seed={c.seed} /></div>
              <div className="colcard-body">
                <span className="colcard-name">{c.name}{c.verified && <span className="tick">✦</span>}</span>
                <span className="muted small">by {c.creator}</span>
                <div className="colcard-stats">
                  <div><span className="eyebrow">Floor</span><span className="mono">{eth(c.floor)}</span></div>
                  <div><span className="eyebrow">Items</span><span className="mono">{num(c.items)}</span></div>
                  <div><span className="eyebrow">Owners</span><span className="mono">{num(c.owners)}</span></div>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
