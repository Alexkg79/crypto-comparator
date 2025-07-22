import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SearchResultCard from './SearchResultCard';

// Mock pour framer-motion si nécessaire
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Composant wrapper pour React Router
const RouterWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('SearchResultCard', () => {
  const fakeCrypto = {
    id: 'bitcoin',
    name: 'Bitcoin',
    image: 'btc.png',
    symbol: 'BTC',
    current_price: 20000
  };

  it('affiche le nom et le symbole', () => {
    render(
      <RouterWrapper>
        <SearchResultCard
          crypto={fakeCrypto}
          toggleFavorite={() => {}}
          favorites={[]}
        />
      </RouterWrapper>
    );

    expect(screen.getByText(/Bitcoin/i)).toBeInTheDocument();
    expect(screen.getByText(/BTC/i)).toBeInTheDocument();
  });

  it('déclenche toggleFavorite au clic', () => {
    const toggleFavoriteMock = jest.fn();

    render(
      <RouterWrapper>
        <SearchResultCard
          crypto={fakeCrypto}
          toggleFavorite={toggleFavoriteMock}
          favorites={[]}
        />
      </RouterWrapper>
    );

    const starBtn = screen.getByRole('button');
    fireEvent.click(starBtn);

    expect(toggleFavoriteMock).toHaveBeenCalledWith('bitcoin');
  });

  it('affiche une étoile jaune quand favori', () => {
    render(
      <RouterWrapper>
        <SearchResultCard
          crypto={fakeCrypto}
          toggleFavorite={() => {}}
          favorites={['bitcoin']}
          isFavorite={true}
        />
      </RouterWrapper>
    );

    // L'étoile remplie quand c'est un favori
    const star = screen.getByText('★');
    expect(star).toBeInTheDocument();
    expect(star.closest('button')).toHaveClass('crypto-card__favorite-btn--active');
  });
});