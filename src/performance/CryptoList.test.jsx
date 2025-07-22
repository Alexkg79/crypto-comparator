import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import Home from '../pages/Home';
import * as api from '../services/api';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../services/api');

const mockCryptos = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 50000, market_cap: 1e12, price_change_percentage_24h: 2.5, image: 'btc.png' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'eth', current_price: 3000, market_cap: 3e11, price_change_percentage_24h: -1.0, image: 'eth.png' },
];

describe('Tests de performance et de chargement de la liste de cryptos', () => {

  test('devrait afficher les squelettes de chargement initialement', () => {
    // On configure le mock pour qu'il ne se résolve pas tout de suite
    api.fetchTopCryptos.mockReturnValue(new Promise(() => {}));
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // On cherche les squelettes. Ils ont une classe spécifique.
    const skeletons = document.querySelectorAll('.crypto-card-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
    expect(skeletons.length).toBe(20); // La page en affiche 20 par défaut

    // Les vraies données ne doivent pas être là
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument();
  });

  test('devrait remplacer les squelettes par les données réelles après le chargement', async () => {
    // On configure le mock pour qu'il se résolve avec nos données
    api.fetchTopCryptos.mockResolvedValue(mockCryptos);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // On attend que les données réelles soient affichées
    expect(await screen.findByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();

    // Une fois les données affichées, les squelettes doivent avoir disparu
    const skeletons = document.querySelectorAll('.crypto-card-skeleton');
    expect(skeletons.length).toBe(0);
  });
});