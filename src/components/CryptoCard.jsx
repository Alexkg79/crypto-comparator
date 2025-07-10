import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CryptoCard({ crypto, isFavorite, toggleFavorite }) {
  const variation = crypto.price_change_percentage_24h;
  const isPositive = variation >= 0;

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    toggleFavorite(crypto.id);
  };

  return (
      <motion.div
      whileHover={{ y: -5, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
      >
        <Link to={`/crypto/${crypto.id}`} className="crypto-card">
          <div className="crypto-card__content">
            <button
              onClick={handleFavoriteClick}
              className={`crypto-card__favorite-btn ${isFavorite ? 'crypto-card__favorite-btn--active' : ''}`}
              aria-label="Ajouter aux favoris"
            >
              {isFavorite ? '★' : '☆'}
            </button>

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
      </motion.div>
  );
}