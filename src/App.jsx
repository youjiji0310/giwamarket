import { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Collections from './pages/Collections.jsx';
import Collection from './pages/Collection.jsx';
import Item from './pages/Item.jsx';
import Drops from './pages/Launchpad.jsx';
import Activity from './pages/Activity.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';
import { WalletProvider } from './lib/wallet.jsx';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

export default function App() {
  const [menu, setMenu] = useState(false);
  return (
    <WalletProvider>
      <ScrollTop />
      <div className="shell">
        <Sidebar open={menu} onClose={() => setMenu(false)} />
        <div className="main">
          <Topbar onMenu={() => setMenu(true)} />
          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/explore" element={<Navigate to="/collections" replace />} />
              <Route path="/collection/:slug" element={<Collection />} />
              <Route path="/item/:slug/:id" element={<Item />} />
              <Route path="/drops" element={<Drops />} />
              <Route path="/launchpad" element={<Navigate to="/drops" replace />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </WalletProvider>
  );
}
