import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import CryptoDetails from './pages/CryptoDetails';
import Watchlist from './pages/Watchlist';
import Portfolio from './pages/Portfolio';
import Header from './components/Header';
function App() {
  return (
    <BrowserRouter>
    <Toaster position="bottom-center" /> 
      <Header />
      <main className="main-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/crypto/:id" element={<CryptoDetails />} />
          <Route path="/favoris" element={<Watchlist />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;