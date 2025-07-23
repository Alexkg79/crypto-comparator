import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchTopCryptos, searchCryptos, RateLimitError } from '../services/api';
import CryptoCard from '../components/CryptoCard';
import SearchResultCard from '../components/SearchResultCard';
import { useFavorites } from '../hooks/useFavorites';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import CryptoCardSkeleton from '../components/CryptoCardSkeleton';
import toast from 'react-hot-toast';
import '../styles/main.scss';

const RATE_LIMIT_TOAST_ID = 'api-rate-limit-toast';

export default function Home() {
  const [cryptos, setCryptos] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [favorites, toggleFavorite] = useFavorites();
  const [page, setPage] = useState(1);
  const { isLoading: isLoadingMore, setIsLoading: setIsLoadingMore, hasMore, setHasMore } = useInfiniteScroll();

  // Chargement initial de la liste et pour le scroll infini
  useEffect(() => {
    // Ne se déclenche que si la recherche est vide
    if (search.trim() !== '') return;

    const loadTopCryptos = async () => {
      if (page === 1) setLoading(true); else setIsLoadingMore(true);
      setError(null);

      try {
        const data = await fetchTopCryptos(page);
        toast.dismiss(RATE_LIMIT_TOAST_ID);
        if (data.length === 0) setHasMore(false);
        setCryptos(prev => page === 1 ? data : [...prev, ...data]);
      } catch (err) {
        // Gère les erreurs de chargement de la liste principale
        setError(err.message);
        toast.error(err.message, { id: RATE_LIMIT_TOAST_ID });
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    };
    
    loadTopCryptos();
  }, [page, search, setIsLoadingMore, setHasMore]);

  // Refresh de la première page toutes les 60 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (page === 1 && !search) {
        fetchTopCryptos(1).then(data => setCryptos(data)).catch(console.error);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [page, search]);

  // Logique de recherche via l'API
  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    
    const performSearch = async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const data = await searchCryptos(search);
        toast.dismiss(RATE_LIMIT_TOAST_ID);
        setSearchResults(data);
      } catch (err) {
        setSearchError(err.message);
        setSearchResults([]);
        if (err instanceof RateLimitError) toast.error(err.message, { id: RATE_LIMIT_TOAST_ID });
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimeout = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimeout);
  }, [search]);

  // Écouteur pour l'événement de scroll infini
  useEffect(() => {
    const handleLoadMore = () => {
      if (hasMore && !isLoadingMore && !loading && !search) {
        setPage(prevPage => prevPage + 1);
      }
    };
    window.addEventListener('loadMore', handleLoadMore);
    return () => window.removeEventListener('loadMore', handleLoadMore);
  }, [hasMore, isLoadingMore, loading, search]);


  // --- Logique d'affichage ---

  // Si le chargement initial a une erreur critique, on l'affiche
  if (error && page === 1) return <p className="error-message">Erreur : {error}</p>;

  const isSearchActive = search.trim().length > 0;
  const dataToDisplay = isSearchActive ? searchResults : cryptos;
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };
  
  const renderContent = () => {
    if (loading && !isSearchActive) {
      return (
        <motion.div className="home-container__grid" variants={containerVariants} initial="hidden" animate="show">
          {Array.from({ length: 20 }).map((_, index) => <CryptoCardSkeleton key={index} />)}
        </motion.div>
      );
    }
    if (isSearchActive) {
      return (
        <div className="search-results-container">
          <div className="search-results-scrollable">
            {dataToDisplay.map((crypto) => (
              <SearchResultCard
                key={crypto.id}
                crypto={crypto}
                isFavorite={favorites.includes(crypto.id)}
                toggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>
      );
    }
    return (
      <motion.div className="home-container__grid" variants={containerVariants} initial="hidden" animate="show">
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
    );
  };
  
  const renderStatusMessages = () => {
    // Si une recherche est active et terminée...
    if (isSearchActive && !isSearching) {
      // S'il y a une erreur de recherche, on l'affiche en priorité
      if (searchError) {
        return <div className="no-results"><p className="error-message">{searchError}</p></div>;
      }
      // Sinon, s'il n'y a juste aucun résultat
      if (dataToDisplay.length === 0) {
        return <div className="no-results"><p>Aucune cryptomonnaie trouvée pour "{search}"</p></div>;
      }
    }

    const showLoadingMore = !isSearchActive && isLoadingMore;
    if (isSearching || showLoadingMore) {
       return <div className="loading-more"><div className="spinner-small"></div></div>;
    }
    
    if (!isSearchActive && !hasMore && cryptos.length > 0) {
      return <div className="end-message"><p>🎉 Vous avez vu toutes les cryptomonnaies disponibles !</p></div>;
    }
    
    return null;
  };

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
      
      {renderContent()}
      {renderStatusMessages()}

    </div>
  );
}