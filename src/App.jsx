import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CryptoDetails from './pages/CryptoDetails';
import Watchlist from './pages/Watchlist';
import Header from './components/Header';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="main-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/crypto/:id" element={<CryptoDetails />} />
          <Route path="/favoris" element={<Watchlist />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;