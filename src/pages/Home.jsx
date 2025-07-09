import { useEffect, useState } from 'react'
import { fetchTopCryptos } from '../services/api'
import CryptoCard from '../components/CryptoCard'
import '../styles/main.scss'

export default function Home() {
  const [cryptos, setCryptos] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = () => {
    fetchTopCryptos()
      .then(setCryptos)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 60000) // refresh toutes les 60s
    return () => clearInterval(interval)
  }, [])

  const filtered = cryptos.filter(crypto =>
    crypto.name.toLowerCase().includes(search.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className="loading-message">Chargement...</p>
  if (error) return <p className="error-message">Erreur : {error}</p>

  return (
    <div className="home-container">
      <h1 className="home-container__title">📊 Top 20 cryptomonnaies</h1>

      <div className="home-container__search">
        <input
          type="text"
          placeholder="🔍 Rechercher (BTC, ETH...)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="home-container__search-bar"
        />
      </div>

      <div className="home-container__grid">
        {filtered.map(crypto => (
          <CryptoCard key={crypto.id} crypto={crypto} />
        ))}
      </div>
    </div>
  )
}