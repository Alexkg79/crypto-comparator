import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CryptoDetails from './pages/CryptoDetails'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <h1 className="text-3xl text-center font-bold py-6">Crypto Comparator 🚀</h1>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/crypto/:id" element={<CryptoDetails />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
