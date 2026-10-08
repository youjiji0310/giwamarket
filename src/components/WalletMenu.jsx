import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import qrcode from 'qrcode-generator';
import Avatar from './Avatar.jsx';
import Modal from './Modal.jsx';
import { useWallet, short, GIWA } from '../lib/wallet.jsx';
import { IBell, ISwap, IWallet, IChevron, IPlus, IUser, IGear, IPhone, ILogout, ICopy, ICheck, IExt } from './Icons.jsx';

function useOutside(open, setOpen) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const down = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const key = e => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('mousedown', down); addEventListener('keydown', key);
    return () => { removeEventListener('mousedown', down); removeEventListener('keydown', key); };
  }, [open]);
  return ref;
}

function CopyAddr({ address }) {
  const [ok, setOk] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(address); setOk(true); setTimeout(() => setOk(false), 1400); } catch {} };
  return <button className="icon-btn sm" onClick={copy} aria-label="Copy address">{ok ? <ICheck /> : <ICopy />}</button>;
}

function Manage({ open, onClose }) {
  const { wallets, address, setActive, removeWallet, addWallet, balanceOf, fmt } = useWallet();
  return (
    <Modal open={open} onClose={onClose} title="Manage wallets">
      <ul className="wlist">
        {wallets.map(a => {
          const on = address && a.toLowerCase() === address.toLowerCase();
          return (
            <li key={a} className={on ? 'on' : ''}>
              <Avatar address={a} size={40} />
              <div className="grow">
                <div className="mono">{short(a)} {on && <span className="badge">Active</span>}</div>
                <div className="muted small">{fmt(balanceOf(a))}</div>
              </div>
              <CopyAddr address={a} />
              {!on && <button className="btn-mini" onClick={() => setActive(a)}>Use</button>}
              <button className="btn-mini danger" onClick={() => removeWallet(a)} aria-label={`Remove ${short(a)}`}>Remove</button>
            </li>
          );
        })}
      </ul>
      <button className="btn btn-ghost block" onClick={addWallet}><IPlus /> Add wallet</button>
      <p className="muted small modal-note">Wallets are remembered on this browser only. Removing one here does not touch your extension.</p>
    </Modal>
  );
}

function Settings({ open, onClose }) {
  const { settings, setSettings } = useWallet();
  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));
  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="setting">
        <div><b>Display currency</b><p className="muted small">USD uses the mainnet ETH reference price. Testnet ETH has no real value.</p></div>
        <div className="seg">{['ETH', 'USD'].map(c => <button key={c} className={settings.currency === c ? 'on' : ''} onClick={() => set('currency', c)}>{c}</button>)}</div>
      </div>
      <div className="setting">
        <div><b>Animations</b><p className="muted small">Reduce motion across the site.</p></div>
        <div className="seg">{[['full', 'Full'], ['reduced', 'Reduced']].map(([k, l]) => <button key={k} className={settings.motion === k ? 'on' : ''} onClick={() => set('motion', k)}>{l}</button>)}</div>
      </div>
      <div className="setting">
        <div><b>Network</b><p className="muted small">{GIWA.chainName} · chain ID {parseInt(GIWA.chainId, 16)}</p></div>
        <a className="btn-mini" href={GIWA.blockExplorerUrls[0]} target="_blank" rel="noreferrer">Explorer</a>
      </div>
    </Modal>
  );
}

function Pair({ open, onClose }) {
  const url = location.href.split('#')[0];
  const mm = `https://metamask.app.link/dapp/${url.replace(/^https?:\/\//, '')}`;
  const [svg, setSvg] = useState('');
  useEffect(() => {
    if (!open) return;
    const q = qrcode(0, 'M'); q.addData(mm); q.make();
    setSvg(q.createSvgTag({ cellSize: 6, margin: 2, scalable: true }));
  }, [open]);
  return (
    <Modal open={open} onClose={onClose} title="Pair mobile" width={420}>
      <div className="qr" dangerouslySetInnerHTML={{ __html: svg }} />
      <ol className="pair-steps">
        <li>Scan with your phone camera.</li>
        <li>GiwaMarket opens inside the MetaMask mobile browser.</li>
        <li>Tap Connect and approve. Your wallet is paired.</li>
      </ol>
      <a className="btn btn-ghost block" href={mm} target="_blank" rel="noreferrer">Open in MetaMask mobile <IExt /></a>
    </Modal>
  );
}

function Notifications() {
  const { owned } = useWallet();
  const [open, setOpen] = useState(false);
  const ref = useOutside(open, setOpen);
  const items = owned.slice(0, 6);
  return (
    <div className="pop-wrap" ref={ref}>
      <button className="icon-btn" aria-label="Notifications" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <IBell />{items.length > 0 && <span className="dot-badge" />}
      </button>
      {open && (
        <div className="pop pop-notes">
          <div className="pop-title">Notifications</div>
          {items.length ? items.map(i => (
            <Link key={`${i.slug}${i.id}`} to={`/item/${i.slug}/${i.id}`} className="note" onClick={() => setOpen(false)}>
              <b>{i.collection} #{i.id}</b><span className="muted small">Added to your collection</span>
            </Link>
          )) : <p className="muted small pop-empty">You're all caught up.</p>}
        </div>
      )}
    </div>
  );
}

export default function WalletMenu() {
  const { address, wallets, total, fmt, connect, addWallet, logout } = useWallet();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const ref = useOutside(open, setOpen);
  const nav = useNavigate();
  const go = fn => () => { setOpen(false); fn(); };

  if (!address) return <button className="btn btn-light btn-sm" onClick={connect}>Connect</button>;

  return (
    <>
      <div className="wm">
        <Notifications />
        <span className="wm-sep" />
        <Link to="/explore" className="icon-btn" aria-label="Trade"><ISwap /></Link>
        <span className="wm-sep" />
        <button className="wm-bal" onClick={() => setModal('manage')}><IWallet /><span>{fmt(total)}</span></button>
        <span className="wm-sep" />
        <div className="pop-wrap" ref={ref}>
          <button className={`wm-me ${open ? 'on' : ''}`} onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="menu" aria-label="Account menu">
            <Avatar address={address} size={32} /><IChevron className="chev" />
          </button>
          {open && (
            <div className="pop pop-menu" role="menu">
              <div className="pm-head">
                <Avatar address={address} size={48} />
                <div>
                  <div className="pm-addr mono">{short(address)}</div>
                  <div className="muted small">{wallets.length} wallet{wallets.length > 1 ? 's' : ''} | {fmt(total)}</div>
                </div>
              </div>
              <div className="pm-group">
                <button role="menuitem" onClick={go(addWallet)}><IPlus />Add Wallet</button>
                <button role="menuitem" onClick={go(() => setModal('manage'))}><IWallet />Manage Wallets</button>
              </div>
              <div className="pm-group">
                <button role="menuitem" onClick={go(() => nav('/profile'))}><IUser />Profile</button>
                <button role="menuitem" onClick={go(() => setModal('settings'))}><IGear />Settings</button>
              </div>
              <div className="pm-group">
                <button role="menuitem" onClick={go(() => setModal('pair'))}><IPhone />Pair Mobile</button>
              </div>
              <div className="pm-group">
                <button role="menuitem" className="danger" onClick={go(logout)}><ILogout />Log Out</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Manage open={modal === 'manage'} onClose={() => setModal(null)} />
      <Settings open={modal === 'settings'} onClose={() => setModal(null)} />
      <Pair open={modal === 'pair'} onClose={() => setModal(null)} />
    </>
  );
}
