import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchTopCryptos, searchCryptos } from '../services/api';
import CryptoCard from '../components/CryptoCard';
import SearchResultCard from '../components/SearchResultCard';
import { useFavorites } from '../hooks/useFavorites';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import CryptoCardSkeleton from '../components/CryptoCardSkeleton';
import '../styles/main.scss';

export default function Home() {
  const [cryptos, setCryptos] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, toggleFavorite] = useFavorites();
  const [page, setPage] = useState(1);
  const { isLoading: isLoadingMore, setIsLoading: setIsLoadingMore, hasMore, setHasMore } = useInfiniteScroll();

  // Chargement initial et pour le scroll infini
  useEffect(() => {
    // Ne se déclenche que si la recherche est vide
    if (search.trim() !== '') return;

    // Affiche le skeleton uniquement pour le tout premier chargement
    if (page === 1) setLoading(true);
    else setIsLoadingMore(true);

    fetchTopCryptos(page)
      .then(data => {
        if (data.length === 0) setHasMore(false);
        setCryptos(prev => page === 1 ? data : [...prev, ...data]);
      })
      .catch(err => setError(err.message))
      .finally(() => {
        setLoading(false);
        setIsLoadingMore(false);
      });
  }, [page, search]);

  // Refresh toutes les 60s
  useEffect(() => {
    const interval = setInterval(() => {
      if (page === 1 && !search) {
        fetchTopCryptos(1).then(data => setCryptos(data));
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [page, search]);

  // Recherche via l'API
  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    const debounceTimeout = setTimeout(() => {
      searchCryptos(search)
        .then(data => setSearchResults(data))
        .catch(err => console.error("Search error:", err))
        .finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [search]);

  // Écouter l'événement de scroll infini
  useEffect(() => {
    const handleLoadMore = () => {
      if (hasMore && !isLoadingMore && !loading && !search) {
        const nextPage = page + 1;
        setPage(nextPage);
      }
    };
    window.addEventListener('loadMore', handleLoadMore);
    return () => window.removeEventListener('loadMore', handleLoadMore);
  }, [hasMore, isLoadingMore, loading, search]);

  const isSearchActive = search.trim().length > 0;
  const dataToDisplay = isSearchActive ? searchResults : cryptos;

  const LoadingMore = () => (
    <div className="loading-more">
      <div className="spinner-small"></div>
    </div>
  );

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  if (error && page === 1) return <p className="error-message">Erreur : {error}</p>;

  return (
    <div className="home-container">
      <header className="home-container__header">
        <h1>Top Cryptomonnaies</h1>
        <p>Suivez les tendances en temps réel des cryptos les plus populaires</p>
      </header>
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Rechercher une crypto (BTC, ETH...)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {(loading && !isSearchActive) ? (
        <motion.div
          className="home-container__grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {Array.from({ length: 20 }).map((_, index) => <CryptoCardSkeleton key={index} />)}
        </motion.div>
      ) : isSearchActive ? (
        // Conteneur spécial pour les résultats de recherche
        <div className="search-results-container">
          <div className="search-results-scrollable">
            {dataToDisplay.map((crypto, index) => (
              <div 
                key={crypto.id} 
                className={`search-result-wrapper pinned-result ${favorites.includes(crypto.id) ? "favorite-highlight" : ""}`}
              >
                <SearchResultCard
                  key={crypto.id}
                  crypto={crypto}
                  isFavorite={favorites.includes(crypto.id)}
                  toggleFavorite={toggleFavorite}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Conteneur pour la grille normale
        <motion.div
          className="home-container__grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {dataToDisplay.map(crypto => (
            <motion.div key={crypto.id} variants={itemVariants}>
              <CryptoCard
                crypto={crypto}
                isFavorite={favorites.includes(crypto.id)}
                toggleFavorite={toggleFavorite}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Le reste de votre code reste inchangé */}
      {isSearching && <LoadingMore />}
      {!isSearchActive && isLoadingMore && <LoadingMore />}
      {!isSearchActive && !hasMore && cryptos.length > 0 && (
        <div className="end-message">
          <p>🎉 Vous avez vu toutes les cryptomonnaies disponibles !</p>
        </div>
      )}
      {isSearchActive && !isSearching && dataToDisplay.length === 0 && (
        <div className="no-results">
          <p>Aucune cryptomonnaie trouvée pour "{search}"</p>
        </div>
      )}
    </div>
  );
}