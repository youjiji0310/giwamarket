# GiwaMarket

Curated NFT marketplace + launchpad on GIWA (testnet). React + Vite.

**Live:** https://youjiji0310.github.io/giwamarket/ (redeployed automatically on every push to `main`).

## Get the code (PowerShell)
```powershell
git clone https://github.com/youjiji0310/giwamarket
cd giwamarket
```
No git? On the repo page click **Code > Download ZIP**.

## Run it on Windows (PowerShell)

1. Install Node.js LTS (once):
   ```powershell
   winget install OpenJS.NodeJS.LTS
   ```
   Close and reopen PowerShell, then check: `node -v`

2. Go to the project folder (after unzipping):
   ```powershell
   cd $HOME\Downloads\giwamarket
   ```

3. Install and start:
   ```powershell
   npm install
   npm run dev
   ```
   The site opens at http://localhost:5173

If PowerShell says "running scripts is disabled", run once:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## Scripts
- `npm run dev` — local dev server with hot reload
- `npm run build` — production build into `dist/`
- `npm run preview` — serve the build locally

## Structure
- `src/pages` — Home, Explore, Collection, Item, Launchpad
- `src/components` — Header, Footer, cards, intro curtain, cursor, reveal
- `src/lib/data.js` — sample data (replace with on-chain data)
- `src/lib/wallet.jsx` — real wallet connect (MetaMask/Rabby), adds/switches to GIWA Sepolia (chain 91342)
- `src/lib/art.jsx` — generative placeholder artworks
- `src/styles.css` — the whole design system

## Next
Buy and mint are simulated (see `TODO` in Item.jsx and Launchpad.jsx). Next step: marketplace + drop smart contracts on GIWA Sepolia.

Independent project, not affiliated with Upbit, Dunamu or GIWA.
