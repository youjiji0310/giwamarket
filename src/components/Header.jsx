import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useScrolled } from '../lib/hooks.js';
import { useWallet } from '../lib/wallet.jsx';
import WalletMenu from './WalletMenu.jsx';
import Logo from './Logo.jsx';

export default function Header() {
  const scrolled = useScrolled();
  const { address, onGiwa, error, setError } = useWallet();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 4500); return () => clearTimeout(t); } }, [error]);

  return (
    <>
      <header className={`hdr ${scrolled ? 'is-solid' : ''} ${open ? 'is-open' : ''}`}>
        <div className="hdr-in wrap">
          <Link to="/" className="brand" aria-label="GiwaMarket home"><Logo /></Link>
          <nav className="hdr-nav" aria-label="Main">
            <NavLink to="/explore">Explore</NavLink>
            <NavLink to="/collection/monochrome-kami">Collections</NavLink>
            <NavLink to="/launchpad">Launchpad</NavLink>
            <NavLink to="/launchpad" end={false} className={() => ''}>Create</NavLink>
          </nav>
          <div className="hdr-right">
            <span className={`net ${address ? 'hide-lg' : ''}`}><span className={`net-dot ${address && !onGiwa ? 'warn' : ''}`} />GIWA Sepolia</span>
            <WalletMenu />
            <button className="burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(o => !o)}>
              <span /><span />
            </button>
          </div>
        </div>
      </header>
      <div className={`toast ${error ? 'show' : ''}`} role="status">{error}</div>
    </>
  );
}
