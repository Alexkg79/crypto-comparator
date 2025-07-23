import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import * as api from '../services/api';
import toast from 'react-hot-toast';

jest.mock('../hooks/useFavorites', () => ({ useFavorites: () => [[], jest.fn()] }));
jest.mock('../hooks/useInfiniteScroll', () => ({
  useInfiniteScroll: () => ({
    isLoading: false,
    setIsLoading: jest.fn(),
    hasMore: true,
    setHasMore: jest.fn(),
  }),
}));
jest.mock('react-hot-toast');

jest.mock('../services/api', () => ({
  ...jest.requireActual('../services/api'),
  fetchTopCryptos: jest.fn(),
  searchCryptos: jest.fn(),
}));

const mockBitcoin = { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', image: 'btc.png', current_price: 50000, market_cap: 1e12, price_change_percentage_24h: 2.5 };
const mockEthereum = { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', image: 'eth.png', current_price: 3000, market_cap: 3e11, price_change_percentage_24h: -1.0 };

describe('Page Home', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche les cryptos après un chargement réussi', async () => {
    api.fetchTopCryptos.mockResolvedValue([mockBitcoin]);
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(await screen.findByText('Bitcoin')).toBeInTheDocument();
  });

  it("affiche un message d'erreur si le chargement initial échoue", async () => {
    api.fetchTopCryptos.mockRejectedValue(new Error("Le serveur est en panne."));
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(await screen.findByText("Erreur : Le serveur est en panne.")).toBeInTheDocument();
  });

  it('affiche les résultats de recherche après une saisie', async () => {
    api.fetchTopCryptos.mockResolvedValue([mockBitcoin]);
    api.searchCryptos.mockResolvedValue([mockEthereum]);
    
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(await screen.findByText('Bitcoin')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Rechercher une crypto/i);
    await user.type(searchInput, 'ethereum');

    expect(await screen.findByText('Ethereum')).toBeInTheDocument();
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument();
  });

  it("affiche un message si la recherche ne trouve aucun résultat", async () => {
    api.fetchTopCryptos.mockResolvedValue([mockBitcoin]);
    api.searchCryptos.mockResolvedValue([]);

    render(<MemoryRouter><Home /></MemoryRouter>);
    const searchInput = screen.getByPlaceholderText(/Rechercher une crypto/i);
    await user.type(searchInput, 'unknowncrypto');

    expect(await screen.findByText(/Aucune cryptomonnaie trouvée pour "unknowncrypto"/i)).toBeInTheDocument();
  });

  it("affiche le message de rate limit si la recherche échoue", async () => {
    api.fetchTopCryptos.mockResolvedValue([mockBitcoin]);
    const rateLimitError = new api.RateLimitError("Trop d'appels à l'API. Veuillez patienter un peu.");
    api.searchCryptos.mockRejectedValue(rateLimitError);

    render(<MemoryRouter><Home /></MemoryRouter>);
    const searchInput = screen.getByPlaceholderText(/Rechercher une crypto/i);
    await user.type(searchInput, 'une recherche qui va échouer');

    expect(await screen.findByText("Trop d'appels à l'API. Veuillez patienter un peu.")).toBeInTheDocument();
    
    expect(toast.error).toHaveBeenCalledWith(
      "Trop d'appels à l'API. Veuillez patienter un peu.",
      { id: 'api-rate-limit-toast' }
    );
  });
});