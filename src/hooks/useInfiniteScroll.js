import { useState, useEffect, useCallback } from 'react';

export function useInfiniteScroll() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleScroll = useCallback(() => {
    // Vérifie si l'utilisateur est proche du bas de la page
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    
    // Déclenche le chargement quand il reste 100px avant le bas
    if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !isLoading) {
      return true;
    }
    return false;
  }, [hasMore, isLoading]);

  useEffect(() => {
    const onScroll = () => {
      if (handleScroll()) {
        // Déclenche un événement personnalisé
        window.dispatchEvent(new CustomEvent('loadMore'));
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  return { isLoading, setIsLoading, hasMore, setHasMore };
}