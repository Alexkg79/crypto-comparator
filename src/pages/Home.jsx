import { useEffect, useState } from 'react';
import { fetchTopCryptos } from '../services/api';
import { motion } from 'framer-motion';
import CryptoCard from '../components/CryptoCard';
import { useFavorites } from '../hooks/useFavorites';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import CryptoCardSkeleton from '../components/CryptoCardSkeleton';
import '../styles/main.scss';

export default function Home() {
  const [cryptos, setCryptos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, toggleFavorite] = useFavorites();
  const [page, setPage] = useState(1);
  const { isLoading: isLoadingMore, setIsLoading: setIsLoadingMore, hasMore, setHasMore } = useInfiniteScroll();

  const CRYPTOS_PER_PAGE = 20;

  // Fonction pour récupérer les cryptos avec pagination
  const fetchCryptos = async (pageNum, isAppending = false) => {
    try {
      if (!isAppending) setLoading(true);
      else setIsLoadingMore(true);

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${CRYPTOS_PER_PAGE}&page=${pageNum}&sparkline=false`
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        setHasMore(false);
        return;
      }

      if (isAppending) {
        setCryptos(prev => [...prev, ...data]);
      } else {
        setCryptos(data);
      }
      
      // S'il y a moins de cryptos que demandé, on a atteint la fin
      if (data.length < CRYPTOS_PER_PAGE) {
        setHasMore(false);
      }
      
    } catch (err) {
      setError(err.message);
      if (isAppending) {
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchCryptos(1);
    
    // Refresh toutes les 60s seulement pour la première page
    const interval = setInterval(() => {
      if (page === 1) {
        fetchCryptos(1);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Écouter l'événement de scroll infini
  useEffect(() => {
    const handleLoadMore = () => {
      if (hasMore && !isLoadingMore && !loading && !search) { // Pas de scroll infini pendant la recherche
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCryptos(nextPage, true);
      }
    };

    window.addEventListener('loadMore', handleLoadMore);
    return () => window.removeEventListener('loadMore', handleLoadMore);
  }, [page, hasMore, isLoadingMore, loading, search]);

  const filteredCryptos = cryptos.filter(crypto =>
    crypto.name.toLowerCase().includes(search.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(search.toLowerCase())
  );

  // Composant pour le chargement de plus d'éléments
  const LoadingMore = () => (
    <div className="loading-more">
      <div className="spinner-small"></div>
      <p>Chargement de plus de cryptos...</p>
    </div>
  );

  //Framer motion
  // Pour le conteneur des cartes
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };
  // Pour chaque carte individuelle
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  if (error) return <p className="error-message">Erreur : {error}</p>;

  return (
    <div className="home-container">
      <h1 className="home-container__title">📊 Top Cryptomonnaies</h1>

      <div className="home-container__search">
        <input
          type="text"
          placeholder="🔍 Rechercher (BTC, ETH...)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="home-container__search-bar"
        />
      </div>

      <motion.div
        className="home-container__grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {(loading && page === 1) ? (
          Array.from({ length: 12 }).map((_, index) => (
            <CryptoCardSkeleton key={index} />
          ))
        ) : (
          filteredCryptos.map(crypto => (
            <motion.div key={crypto.id} variants={itemVariants}>
              <CryptoCard
                crypto={crypto}
                isFavorite={favorites.includes(crypto.id)}
                toggleFavorite={toggleFavorite}
              />
            </motion.div>
          ))
        )}
      </motion.div>

      {!search && isLoadingMore && <LoadingMore />}
      
      {!search && !hasMore && cryptos.length > 0 && (
        <div className="end-message">
          <p>🎉 Vous avez vu toutes les cryptomonnaies disponibles !</p>
        </div>
      )}

      {search && filteredCryptos.length === 0 && (
        <div className="no-results">
          <p>Aucune cryptomonnaie trouvée pour "{search}"</p>
        </div>
      )}
    </div>
  );
}