import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Watchlist from './Watchlist';

jest.mock('../hooks/useFavorites', () => ({
  useFavorites: jest.fn(),
}));

import { useFavorites } from '../hooks/useFavorites';

test('affiche message si aucun favori', () => {
  useFavorites.mockReturnValue([[], jest.fn()]);

  render(
    <BrowserRouter>
      <Watchlist />
    </BrowserRouter>
  );

  expect(screen.getByText(/Vous n'avez encore ajout/i)).toBeInTheDocument();
});

test('affiche les favoris', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'btc',
            image: '',
            current_price: 25000,
            market_cap: 500000000000,
            price_change_percentage_24h: 3.2,
          },
        ]),
    })
  );

  useFavorites.mockReturnValue([['bitcoin'], jest.fn()]);

  render(
    <BrowserRouter>
      <Watchlist />
    </BrowserRouter>
  );

  expect(await screen.findByText(/Bitcoin/i)).toBeInTheDocument();
});
