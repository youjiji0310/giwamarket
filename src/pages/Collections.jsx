import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Change, Thumb, ColName, Seg, Sparkline } from '../components/bits.jsx';
import { CATEGORIES, RANGES, collections, ethShort, compact, num } from '../lib/data.js';

const COLS = [['floor', 'Floor'], ['change', 'Change'], ['volume', 'Volume'], ['sales', 'Sales'], ['listed', 'Listed'], ['owners', 'Owners']];

export default function Collections() {
  const [cat, setCat] = useState('All');
  const [range, setRange] = useState('24h');
  const [sort, setSort] = useState({ k: 'volume', dir: -1 });
  const nav = useNavigate();
  const val = (c, k) => ({ floor: c.floor, change: c.change[range], volume: c.volume[range], sales: c.sales24, listed: c.listedPct, owners: c.owners }[k]);
  const rows = useMemo(() => (cat === 'All' ? collections : collections.filter(c => c.category === cat)).slice().sort((a, b) => (val(a, sort.k) - val(b, sort.k)) * sort.dir), [cat, range, sort]);
  const by = k => setSort(s => ({ k, dir: s.k === k ? -s.dir : -1 }));
  return (
    <div className="page">
      <div className="page-title-row">
        <h1 className="h1">Collections</h1>
        <Seg options={RANGES} value={range} onChange={setRange} label="Time range" small />
      </div>
      <div className="chips" role="tablist" aria-label="Categories">
        {CATEGORIES.map(c => <button key={c} role="tab" aria-selected={cat === c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th className="w-rank">#</th>
              <th>Collection</th>
              {COLS.map(([k, l]) => (
                <th key={k} className="r" aria-sort={sort.k === k ? (sort.dir < 0 ? 'descending' : 'ascending') : 'none'}>
                  <button className={`th-sort ${sort.k === k ? 'on' : ''}`} onClick={() => by(k)}>{l}{sort.k === k && <span aria-hidden="true">{sort.dir < 0 ? ' ↓' : ' ↑'}</span>}</button>
                </th>
              ))}
              <th className="r hide-md">Last 7 days</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c, i) => (
              <tr key={c.slug} onClick={() => nav(`/collection/${c.slug}`)} className="tr-link">
                <td className="muted mono">{i + 1}</td>
                <td><span className="cell-col"><Thumb seed={c.seed} /><ColName c={c} /></span></td>
                <td className="r mono">{ethShort(c.floor)} ETH</td>
                <td className="r"><Change v={c.change[range]} /></td>
                <td className="r mono">{compact(c.volume[range])} ETH</td>
                <td className="r mono">{num(c.sales24)}</td>
                <td className="r mono">{c.listedPct}%</td>
                <td className="r mono">{num(c.owners)}</td>
                <td className="r hide-md"><Sparkline data={c.spark} up={c.change['7d'] >= 0} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
