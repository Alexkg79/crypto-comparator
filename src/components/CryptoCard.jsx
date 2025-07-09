import { Link } from 'react-router-dom'

export default function CryptoCard({ crypto }) {
  const variation = crypto.price_change_percentage_24h
  const isPositive = variation >= 0

  return (
    <Link to={`/crypto/${crypto.id}`} className="crypto-card">
      <div className="crypto-card__content">
        <header className="crypto-card__header">
          <img src={crypto.image} alt={crypto.name} className="crypto-card__image" />
          <div className="crypto-card__info">
            <h2 className="crypto-card__info-name">{crypto.name}</h2>
            <p className="crypto-card__info-symbol">{crypto.symbol}</p>
          </div>
        </header>

        <div className="crypto-card__details">
          <p>
            Prix actuel : <span>${crypto.current_price.toLocaleString()}</span>
          </p>
          <p>
            Capitalisation : <span>${crypto.market_cap.toLocaleString()}</span>
          </p>
          <p className={`crypto-card__variation ${isPositive ? 'crypto-card__variation--positive' : 'crypto-card__variation--negative'}`}>
            Variation 24h : {variation.toFixed(2)}%
          </p>
        </div>
      </div>
    </Link>
  )
}