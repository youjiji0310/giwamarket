import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="ftr-row">
        <span className="ftr-brand"><img src={logo} alt="" width="20" height="20" /><b>Giwa</b><i>Market</i></span>
        <nav className="ftr-links" aria-label="Footer">
          <Link to="/collections">Collections</Link>
          <Link to="/drops">Drops</Link>
          <Link to="/activity">Activity</Link>
          <a href="https://sepolia-explorer.giwa.io" target="_blank" rel="noreferrer">Block explorer</a>
          <a href="https://docs.giwa.io" target="_blank" rel="noreferrer">GIWA docs</a>
        </nav>
      </div>
      <p className="ftr-legal">Independent project, not affiliated with Upbit, Dunamu or GIWA. Testnet build: no real assets.</p>
    </footer>
  );
}
