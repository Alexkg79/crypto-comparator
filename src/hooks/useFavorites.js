import { useState, useEffect } from 'react';

// La clé pour stocker les favoris dans le localStorage
const FAVORITES_KEY = 'cryptoFavorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  // Au premier chargement, on récupère les favoris depuis le localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Fonction pour ajouter ou supprimer un favori
  const toggleFavorite = (cryptoId) => {
    let updatedFavorites;
    if (favorites.includes(cryptoId)) {
      // Si l'ID est déjà là, on le retire
      updatedFavorites = favorites.filter(id => id !== cryptoId);
    } else {
      // Sinon, on l'ajoute
      updatedFavorites = [...favorites, cryptoId];
    }
    
    setFavorites(updatedFavorites);
    // On met à jour le localStorage
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  };

  // On retourne la liste des favoris et la fonction pour les modifier
  return [favorites, toggleFavorite];
}