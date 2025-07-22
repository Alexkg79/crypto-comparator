import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/search-result-card.scss';

export default function SearchResultCard({ crypto, isFavorite, toggleFavorite }) {
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    toggleFavorite(crypto.id);
  };

  return (
    <Link to={`/crypto/${crypto.id}`} className="search-result-card">
      <div className="search-result-card__content">
        <div className="search-result-card__identity">
          <img src={crypto.image} alt={crypto.name} className="search-result-card__image" />
          <div className="search-result-card__info">
            <h3 className="search-result-card__name">{crypto.name}</h3>
            <p className="search-result-card__symbol">{crypto.symbol.toUpperCase()}</p>
          </div>
        </div>
        <button
          onClick={handleFavoriteClick}
          className={`crypto-card__favorite-btn ${isFavorite ? 'crypto-card__favorite-btn--active' : ''}`}
          aria-label="Ajouter aux favoris"
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>
    </Link>
  );
}