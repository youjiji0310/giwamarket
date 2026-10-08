import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Cursor from './components/Cursor.jsx';
import Intro from './components/Intro.jsx';
import Home from './pages/Home.jsx';
import Collection from './pages/Collection.jsx';
import Item from './pages/Item.jsx';
import Launchpad from './pages/Launchpad.jsx';
import Explore from './pages/Explore.jsx';
import NotFound from './pages/NotFound.jsx';
import { WalletProvider } from './lib/wallet.jsx';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <WalletProvider>
      <Intro />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <ScrollTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/collection/:slug" element={<Collection />} />
          <Route path="/item/:slug/:id" element={<Item />} />
          <Route path="/launchpad" element={<Launchpad />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </WalletProvider>
  );
}
