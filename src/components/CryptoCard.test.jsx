import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CryptoCard from './CryptoCard';

describe('CryptoCard', () => {
  const fakeCrypto = {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    image: 'https://example.com/bitcoin.png',
    current_price: 20000,
    market_cap: 500000000,
    price_change_percentage_24h: 3.5
  };

  const mockToggleFavorite = jest.fn();

  it('affiche les infos de la crypto', () => {
    render(
      <MemoryRouter>
        <CryptoCard crypto={fakeCrypto} isFavorite={false} toggleFavorite={mockToggleFavorite} />
      </MemoryRouter>
    );

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('btc')).toBeInTheDocument();
    expect(screen.getByText(/Prix actuel/i)).toHaveTextContent(/\$?20[\s\u202f\u00a0]?000/);
    expect(screen.getByText(/Capitalisation/i)).toHaveTextContent(/\$?500[\s\u202f\u00a0]?000[\s\u202f\u00a0]?000/);
    expect(screen.getByText(/Variation 24h/i)).toHaveTextContent('3.50%');
  });

  it('affiche l\'étoile active si favori', () => {
    render(
      <MemoryRouter>
        <CryptoCard crypto={fakeCrypto} isFavorite={true} toggleFavorite={mockToggleFavorite} />
      </MemoryRouter>
    );

    expect(screen.getByText('★')).toBeInTheDocument();
  });

  it('appelle toggleFavorite au clic sur l\'étoile', () => {
    render(
      <MemoryRouter>
        <CryptoCard crypto={fakeCrypto} isFavorite={false} toggleFavorite={mockToggleFavorite} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockToggleFavorite).toHaveBeenCalledWith('bitcoin');
  });
});
