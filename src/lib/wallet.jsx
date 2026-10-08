import { createContext, useContext, useEffect, useState, useCallback } from 'react';

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

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) return;
    eth.request({ method: 'eth_accounts' }).then(a => setAddress(a[0] || null)).catch(() => {});
    eth.request({ method: 'eth_chainId' }).then(setChainId).catch(() => {});
    const onAcc = a => setAddress(a[0] || null);
    const onChain = c => setChainId(c);
    eth.on?.('accountsChanged', onAcc);
    eth.on?.('chainChanged', onChain);
    return () => { eth.removeListener?.('accountsChanged', onAcc); eth.removeListener?.('chainChanged', onChain); };
  }, []);

  const connect = useCallback(async () => {
    setError('');
    const eth = window.ethereum;
    if (!eth) { setError('No wallet found. Install MetaMask or Rabby to continue.'); return; }
    try {
      const [a] = await eth.request({ method: 'eth_requestAccounts' });
      setAddress(a);
      try {
        await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: GIWA.chainId }] });
      } catch (e) {
        if (e.code === 4902) await eth.request({ method: 'wallet_addEthereumChain', params: [GIWA] });
        else throw e;
      }
      setChainId(GIWA.chainId);
    } catch (e) {
      setError(e?.message || 'Connection rejected');
    }
  }, []);

  const disconnect = () => setAddress(null);
  const onGiwa = chainId?.toLowerCase() === GIWA.chainId;

  return <Ctx.Provider value={{ address, chainId, onGiwa, connect, disconnect, error, setError }}>{children}</Ctx.Provider>;
}
