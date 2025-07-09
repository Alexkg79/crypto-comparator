import { Link } from 'react-router-dom'

export default function CryptoCard({ crypto }) {
  return (
    <Link to={`/crypto/${crypto.id}`}>
      <div className="bg-gray-800 text-white p-4 rounded-xl shadow hover:scale-105 transition">
        <div className="flex items-center gap-4 mb-2">
          <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
          <h2 className="text-lg font-bold">{crypto.name}</h2>
        </div>
        <p>Prix : ${crypto.current_price.toLocaleString()}</p>
        <p>Market Cap : ${crypto.market_cap.toLocaleString()}</p>
        <p className={crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}>
          Variation 24h : {crypto.price_change_percentage_24h.toFixed(2)}%
        </p>
      </div>
    </Link>
  )
}
