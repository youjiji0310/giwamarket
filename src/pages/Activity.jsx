import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Thumb } from '../components/bits.jsx';
import { ITag, ICart, IHand, ISwapH, ISpark } from '../components/Icons.jsx';
import { activityFeed, eth, shortAddr, ago } from '../lib/data.js';

const ICON = { Sale: ICart, List: ITag, Offer: IHand, Transfer: ISwapH, Mint: ISpark };
const TYPES = ['Sale', 'List', 'Offer', 'Transfer', 'Mint'];

export function ActivityTable({ rows, showCollection = true }) {
  return (
    <div className="table-wrap">
      <table className="tbl">
        <thead><tr><th>Event</th><th>Item</th><th className="r">Price</th><th>From</th><th>To</th><th className="r">Time</th></tr></thead>
        <tbody>
          {rows.map((a, i) => {
            const Ico = ICON[a.ev];
            return (
              <tr key={i}>
                <td><span className="ev"><Ico />{a.ev === 'List' ? 'Listing' : a.ev}</span></td>
                <td><Link to={`/item/${a.c.slug}/${a.id}`} className="cell-col"><Thumb seed={a.seed} size="sm" /><span className="ell">{showCollection ? `${a.c.name} #${a.id}` : `#${a.id}`}</span></Link></td>
                <td className="r mono">{eth(a.price)}</td>
                <td className="mono muted">{shortAddr(a.from)}</td>
                <td className="mono muted">{a.to ? shortAddr(a.to) : '—'}</td>
                <td className="r muted">{ago(a.mins)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Activity() {
  const all = useMemo(() => activityFeed(40), []);
  const [on, setOn] = useState(new Set(TYPES));
  const toggle = t => setOn(s => { const n = new Set(s); n.has(t) ? n.delete(t) : n.add(t); return n.size ? n : new Set(TYPES); });
  const rows = all.filter(a => on.has(a.ev));
  return (
    <div className="page">
      <div className="page-title-row"><h1 className="h1">Activity</h1><span className="muted small"><span className="net-dot" /> Live on GIWA Sepolia</span></div>
      <div className="chips" aria-label="Event types">
        {TYPES.map(t => <button key={t} className={`chip ${on.has(t) ? 'on' : ''}`} aria-pressed={on.has(t)} onClick={() => toggle(t)}>{t === 'List' ? 'Listings' : `${t}s`}</button>)}
      </div>
      <ActivityTable rows={rows} />
    </div>
  );
}
