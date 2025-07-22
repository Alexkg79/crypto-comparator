import { fetchTopCryptos, searchCryptos } from './api';

// Mock de fetch global
global.fetch = jest.fn();

describe('API Service Tests', () => {
  // Reset des mocks avant chaque test
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('fetchTopCryptos', () => {
    it('should fetch top cryptos successfully with default page', async () => {
      // Mock de la réponse API
      const mockData = [
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'btc',
          current_price: 50000,
          market_cap: 1000000000,
          price_change_percentage_24h: 2.5
        },
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'eth',
          current_price: 3000,
          market_cap: 500000000,
          price_change_percentage_24h: -1.2
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const result = await fetchTopCryptos();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false'
      );
      expect(result).toEqual(mockData);
    });

    it('should fetch top cryptos with specific page number', async () => {
      const mockData = [{ id: 'test-coin', name: 'Test Coin' }];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      await fetchTopCryptos(2);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=2&sparkline=false'
      );
    });

    it('should throw error when API call fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(fetchTopCryptos()).rejects.toThrow('Erreur lors du chargement des cryptos');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchTopCryptos()).rejects.toThrow('Network error');
    });
  });

  describe('searchCryptos', () => {
    it('should return empty array when query is empty', async () => {
      const result = await searchCryptos('');
      expect(result).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should return empty array when query is null', async () => {
      const result = await searchCryptos(null);
      expect(result).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should search cryptos successfully', async () => {
      const mockApiResponse = {
        coins: [
          {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'BTC',
            large: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
          },
          {
            id: 'ethereum',
            name: 'Ethereum',
            symbol: 'ETH',
            large: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
          }
        ]
      };

      const expectedResult = [
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'BTC',
          image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
          current_price: 0,
          market_cap: 0,
          price_change_percentage_24h: 0
        },
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
          current_price: 0,
          market_cap: 0,
          price_change_percentage_24h: 0
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      const result = await searchCryptos('bitcoin');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/search?query=bitcoin'
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle search API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      });

      await expect(searchCryptos('bitcoin')).rejects.toThrow('Erreur lors de la recherche');
    });

    it('should handle empty search results', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ coins: [] })
      });

      const result = await searchCryptos('nonexistentcoin');
      expect(result).toEqual([]);
    });

    it('should normalize data correctly with missing fields', async () => {
      const mockApiResponse = {
        coins: [
          {
            id: 'test-coin',
            name: 'Test Coin',
            symbol: 'TEST'
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      const result = await searchCryptos('test');

      expect(result[0]).toEqual({
        id: 'test-coin',
        name: 'Test Coin',
        symbol: 'TEST',
        image: undefined,
        current_price: 0,
        market_cap: 0,
        price_change_percentage_24h: 0
      });
    });
  });
});