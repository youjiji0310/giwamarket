import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-big" aria-hidden="true"><b>Giwa</b><i>Market</i></div>
        <div className="ftr-row">
          <Logo size={22} />
          <nav className="ftr-links" aria-label="Footer">
            <Link to="/explore">Explore</Link>
            <Link to="/launchpad">Launchpad</Link>
            <a href="https://sepolia-explorer.giwa.io" target="_blank" rel="noreferrer">Block explorer</a>
            <a href="https://docs.giwa.io" target="_blank" rel="noreferrer">GIWA docs</a>
          </nav>
        </div>
        <p className="ftr-legal">Trade · Discover · Collect — An independent project, not affiliated with Upbit, Dunamu or GIWA. Testnet build: no real assets.</p>
      </div>
    </footer>
  );
}
