import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { fetchMarketsByIds } from '../services/api';
import CryptoCard from '../components/CryptoCard';
import '../styles/main.scss';

export default function Watchlist() {
  const [favorites, toggleFavorite] = useFavorites();
  const [favoriteCryptos, setFavoriteCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si l'utilisateur n'a aucun favori, on ne fait rien
    if (favorites.length === 0) {
      setLoading(false);
      setFavoriteCryptos([]); // On s'assure que la liste est vide
      return;
    }

    const fetchFavoriteData = async () => {
      try {
        setLoading(true);
        // 👇 2. Utiliser la fonction du service au lieu de fetch() direct
        const data = await fetchMarketsByIds(favorites);
        setFavoriteCryptos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteData();
  }, [favorites]);

  if (loading) return <p className="loading-message">Chargement des favoris...</p>;
  if (error) return <p className="error-message">Erreur : {error}</p>;

 return (
    <div className="watchlist">
      <h1 className="watchlist__title">⭐ Mes Favoris</h1>

      {favorites.length > 0 ? (
        <div className="watchlist__grid">
          {favoriteCryptos.map(crypto => (
            <CryptoCard
              key={crypto.id}
              crypto={crypto}
              isFavorite={favorites.includes(crypto.id)}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="watchlist-empty">
          <p className="watchlist-empty__message">
            Vous n'avez encore ajouté aucune cryptomonnaie à vos favoris.
          </p>
          <Link to="/" className="watchlist-empty__button">
            Explorer les cryptos
          </Link>
        </div>
      )}
    </div>
  );
}