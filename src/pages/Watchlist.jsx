import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
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
        // On transforme le tableau d'ID en une chaîne de caractères
        const ids = favorites.join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`);
        if (!response.ok) {
          throw new Error("La requête vers l'API a échoué");
        }
        const data = await response.json();
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