import { useEffect, useState } from 'react'
import { fetchTopCryptos } from '../services/api'
import CryptoCard from '../components/CryptoCard'

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

  if (loading) return <p className="text-center text-white">Chargement...</p>
  if (error) return <p className="text-center text-red-500">Erreur : {error}</p>

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Rechercher une crypto (ex : BTC, ETH)..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-6 p-2 rounded bg-gray-700 text-white placeholder-gray-400"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(crypto => (
          <CryptoCard key={crypto.id} crypto={crypto} />
        ))}
      </div>
    </div>
  )
}
