import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ISearch, IMenu, IVerified } from './Icons.jsx';
import Artwork from '../lib/art.jsx';
import WalletMenu from './WalletMenu.jsx';
import { useWallet } from '../lib/wallet.jsx';
import { collections, eth } from '../lib/data.js';
import logo from '../assets/logo.png';

function Search() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const box = useRef(null);
  const input = useRef(null);
  const nav = useNavigate();
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (s ? collections.filter(c => c.name.toLowerCase().includes(s) || c.creator.toLowerCase().includes(s)) : [...collections].sort((a, b) => b.vol24 - a.vol24)).slice(0, 6);
  }, [q]);
  useEffect(() => {
    const key = e => { if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); input.current?.focus(); } };
    const down = e => { if (!box.current?.contains(e.target)) setOpen(false); };
    addEventListener('keydown', key); addEventListener('mousedown', down);
    return () => { removeEventListener('keydown', key); removeEventListener('mousedown', down); };
  }, []);
  const go = c => { setOpen(false); setQ(''); input.current?.blur(); nav(`/collection/${c.slug}`); };
  const onKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(results.length - 1, h + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(0, h - 1)); }
    if (e.key === 'Enter' && results[hi]) go(results[hi]);
    if (e.key === 'Escape') { setOpen(false); input.current?.blur(); }
  };
  return (
    <div className="search" ref={box}>
      <ISearch className="search-ico" />
      <label htmlFor="gm-search" className="sr">Search collections</label>
      <input id="gm-search" ref={input} value={q} placeholder="Search GiwaMarket" autoComplete="off"
        onChange={e => { setQ(e.target.value); setHi(0); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={onKey}
        role="combobox" aria-expanded={open} aria-controls="gm-search-list" />
      <kbd className="search-kbd">/</kbd>
      {open && (
        <div className="search-pop" id="gm-search-list" role="listbox">
          <div className="pop-title">{q ? 'Collections' : 'Trending'}</div>
          {results.length ? results.map((c, i) => (
            <button key={c.slug} role="option" aria-selected={i === hi} className={`sr-row ${i === hi ? 'hi' : ''}`} onMouseEnter={() => setHi(i)} onClick={() => go(c)}>
              <span className="thumb sm"><Artwork seed={c.seed} /></span>
              <span className="grow"><span className="sr-name">{c.name}{c.verified && <IVerified />}</span><span className="muted xs">{c.items.toLocaleString('en-US')} items</span></span>
              <span className="mono xs muted">{eth(c.floor)}</span>
            </button>
          )) : <p className="muted small pop-empty">No collection matches “{q}”.</p>}
        </div>
      )}
    </div>
  );
}

export default function Topbar({ onMenu }) {
  const { error, setError } = useWallet();
  useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 4500); return () => clearTimeout(t); } }, [error]);
  return (
    <>
      <header className="top">
        <button className="icon-btn top-menu" onClick={onMenu} aria-label="Open menu"><IMenu /></button>
        <img className="top-logo" src={logo} alt="" width="26" height="26" />
        <Search />
        <div className="top-right"><WalletMenu /></div>
      </header>
      <div className={`toast ${error ? 'show' : ''}`} role="status">{error}</div>
    </>
  );
}
