import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { load, save } from './store.js';

// GIWA Sepolia testnet
export const GIWA = {
  chainId: '0x164ce', // 91342
  chainName: 'GIWA Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://sepolia-rpc.giwa.io'],
  blockExplorerUrls: ['https://sepolia-explorer.giwa.io']
};

const Ctx = createContext(null);
export const useWallet = () => useContext(Ctx);
export const short = a => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '');
export const seedOf = a => (a ? parseInt(a.slice(2, 10), 16) % 100000 : 1);
const lc = a => a.toLowerCase();

async function rpc(method, params) {
  const res = await fetch(GIWA.rpcUrls[0], {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  });
  const j = await res.json();
  if (j.error) throw new Error(j.error.message);
  return j.result;
}

export function WalletProvider({ children }) {
  const [wallets, setWallets] = useState(() => load('gm-wallets', []));
  const [active, setActive] = useState(() => load('gm-active', null));
  const [balances, setBalances] = useState({});
  const [ethUsd, setEthUsd] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(() => load('gm-settings', { currency: 'ETH', motion: 'full' }));
  const [owned, setOwned] = useState(() => load('gm-owned', {}));

  useEffect(() => save('gm-wallets', wallets), [wallets]);
  useEffect(() => save('gm-active', active), [active]);
  useEffect(() => save('gm-settings', settings), [settings]);
  useEffect(() => save('gm-owned', owned), [owned]);
  useEffect(() => { document.documentElement.classList.toggle('calm', settings.motion === 'reduced'); }, [settings.motion]);

  // Keep in sync with the browser wallet.
  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) return;
    eth.request({ method: 'eth_chainId' }).then(setChainId).catch(() => {});
    const onAcc = accs => {
      if (!accs.length) return;
      setWallets(w => { const s = new Set(w.map(lc)); return [...w, ...accs.filter(a => !s.has(lc(a)))]; });
      setActive(cur => (cur ? cur : accs[0]));
    };
    const onChain = c => setChainId(c);
    eth.on?.('accountsChanged', onAcc);
    eth.on?.('chainChanged', onChain);
    return () => { eth.removeListener?.('accountsChanged', onAcc); eth.removeListener?.('chainChanged', onChain); };
  }, []);

  // Balances from the GIWA RPC (works for every saved wallet, whatever network the extension is on).
  const refresh = useCallback(async () => {
    const out = {};
    await Promise.all(wallets.map(async a => {
      try { out[lc(a)] = Number(BigInt(await rpc('eth_getBalance', [a, 'latest']))) / 1e18; } catch {}
    }));
    setBalances(out);
  }, [wallets]);
  useEffect(() => { if (wallets.length) { refresh(); const t = setInterval(refresh, 20000); return () => clearInterval(t); } }, [refresh]);

  // Reference ETH price, only used when the viewer chooses USD display.
  useEffect(() => {
    if (settings.currency !== 'USD' || ethUsd) return;
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      .then(r => r.json()).then(j => setEthUsd(j?.ethereum?.usd || null)).catch(() => {});
  }, [settings.currency]);

  const switchToGiwa = async eth => {
    try {
      await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: GIWA.chainId }] });
    } catch (e) {
      if (e.code === 4902) await eth.request({ method: 'wallet_addEthereumChain', params: [GIWA] });
      else throw e;
    }
    setChainId(GIWA.chainId);
  };

  const connect = useCallback(async () => {
    setError('');
    const eth = window.ethereum;
    if (!eth) { setError('No wallet found. Install MetaMask or Rabby to continue.'); return false; }
    try {
      const accs = await eth.request({ method: 'eth_requestAccounts' });
      setWallets(w => { const s = new Set(w.map(lc)); return [...w, ...accs.filter(a => !s.has(lc(a)))]; });
      setActive(accs[0]);
      await switchToGiwa(eth);
      return true;
    } catch (e) { setError(e?.message || 'Connection rejected'); return false; }
  }, []);

  // Opens the extension's account picker so more accounts can be added.
  const addWallet = useCallback(async () => {
    setError('');
    const eth = window.ethereum;
    if (!eth) { setError('No wallet found. Install MetaMask or Rabby to continue.'); return; }
    try {
      await eth.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
      const accs = await eth.request({ method: 'eth_accounts' });
      setWallets(w => { const s = new Set(w.map(lc)); return [...w, ...accs.filter(a => !s.has(lc(a)))]; });
      if (!active && accs[0]) setActive(accs[0]);
    } catch (e) { if (e.code !== 4001) setError(e?.message || 'Could not add wallet'); }
  }, [active]);

  const removeWallet = a => {
    setWallets(w => w.filter(x => lc(x) !== lc(a)));
    if (active && lc(active) === lc(a)) setActive(wallets.find(x => lc(x) !== lc(a)) || null);
  };

  const logout = async () => {
    setWallets([]); setActive(null); setBalances({});
    try { await window.ethereum?.request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] }); } catch {}
  };

  const addOwned = items => {
    if (!active) return;
    setOwned(o => {
      const k = lc(active), cur = o[k] || [];
      const keys = new Set(cur.map(i => `${i.slug}:${i.id}`));
      return { ...o, [k]: [...items.filter(i => !keys.has(`${i.slug}:${i.id}`)).map(i => ({ ...i, listed: false, price: i.price ?? null, at: Date.now() })), ...cur] };
    });
  };

  const total = wallets.reduce((s, a) => s + (balances[lc(a)] || 0), 0);
  const fmt = n => {
    if (n == null) return '—';
    if (settings.currency === 'USD' && ethUsd) return `$${(n * ethUsd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `${n.toLocaleString('en-US', { maximumFractionDigits: 4 })} ETH`;
  };

  const value = useMemo(() => ({
    address: active, wallets, balances, total, chainId, onGiwa: chainId?.toLowerCase() === GIWA.chainId,
    connect, addWallet, removeWallet, setActive, logout, disconnect: logout, refresh,
    error, setError, settings, setSettings, fmt, ethUsd,
    owned: active ? owned[lc(active)] || [] : [], addOwned,
    balanceOf: a => balances[lc(a)]
  }), [active, wallets, balances, total, chainId, error, settings, ethUsd, owned, connect, addWallet, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
