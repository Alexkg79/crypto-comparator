import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Watchlist from '../pages/Watchlist';
import * as api from '../services/api';
import { useFavorites } from '../hooks/useFavorites';

// Mock pour framer-motion, nécessaire dans l'environnement de test
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock des modules de service et des hooks
jest.mock('../services/api');
jest.mock('../hooks/useFavorites');

const mockCryptos = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 50000, market_cap: 1e12, price_change_percentage_24h: 2.5, image: 'btc.png' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'eth', current_price: 3000, market_cap: 3e11, price_change_percentage_24h: -1.0, image: 'eth.png' },
];

describe('Tests d\'intégration du flux des Favoris', () => {

  test('devrait ajouter un favori sur Home et le voir sur Watchlist', async () => {
    // On simule l'état et les actions du hook useFavorites
    let fakeFavorites = [];
    const toggleFavoriteMock = jest.fn(id => {
      if (fakeFavorites.includes(id)) {
        fakeFavorites = fakeFavorites.filter(f => f !== id);
      } else {
        fakeFavorites.push(id);
      }
    });

    // On configure les mocks pour qu'ils retournent les bonnes valeurs à chaque appel
    useFavorites.mockImplementation(() => [fakeFavorites, toggleFavoriteMock]);
    api.fetchTopCryptos.mockResolvedValue(mockCryptos);
    api.fetchMarketsByIds.mockImplementation(async (ids) => {
      if (!ids || ids.length === 0) return [];
      return mockCryptos.filter(c => ids.includes(c.id));
    });

    // --- 1. AFFICHER LA PAGE D'ACCUEIL ET AJOUTER UN FAVORI ---
    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    );

    const favoriteButtons = await screen.findAllByLabelText('Ajouter aux favoris');
    const bitcoinButton = favoriteButtons[0];
    
    // Clic pour ajouter Bitcoin aux favoris
    fireEvent.click(bitcoinButton);
    expect(toggleFavoriteMock).toHaveBeenCalledWith('bitcoin');
    
    // On "démonte" le composant pour simuler un changement de page propre
    unmount();

    // --- 2. NAVIGUER VERS LA WATCHLIST ET VÉRIFIER LE CONTENU ---
    render(
       <MemoryRouter initialEntries={['/watchlist']}>
        <Routes>
          <Route path="/watchlist" element={<Watchlist />} />
        </Routes>
      </MemoryRouter>
    );
    
    // On attend que le titre "Mes Favoris" apparaisse
    const watchlistTitle = await screen.findByRole('heading', { name: /Mes Favoris/i });
    expect(watchlistTitle).toBeInTheDocument();
    
    // Bitcoin doit être présent, mais pas Ethereum
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
  });
});