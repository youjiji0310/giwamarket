import { NavLink, Link } from 'react-router-dom';
import { ICompass, IGrid, IRocket, IPulse, IUser, IClose } from './Icons.jsx';
import logo from '../assets/logo.png';

const NAV = [
  ['/', 'Discover', ICompass, true],
  ['/collections', 'Collections', IGrid],
  ['/drops', 'Drops', IRocket],
  ['/activity', 'Activity', IPulse],
  ['/profile', 'Profile', IUser]
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <aside className={`side ${open ? 'is-open' : ''}`} aria-label="Main navigation">
        <div className="side-top">
          <Link to="/" className="side-logo" aria-label="GiwaMarket home" onClick={onClose}>
            <img src={logo} alt="" width="28" height="28" />
            <span className="side-word"><b>Giwa</b><i>Market</i></span>
          </Link>
          <button className="icon-btn side-close" onClick={onClose} aria-label="Close menu"><IClose /></button>
        </div>
        <nav className="side-nav">
          {NAV.map(([to, label, Icon, end]) => (
            <NavLink key={to} to={to} end={end} onClick={onClose} title={label}>
              <Icon /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <span className="net-dot" /><span>GIWA Sepolia</span>
        </div>
      </aside>
      <div className={`side-scrim ${open ? 'show' : ''}`} onClick={onClose} aria-hidden="true" />
    </>
  );
}
