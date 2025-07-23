import { fetchTopCryptos, searchCryptos, fetchCryptoDetails, fetchMarketsByIds } from './api';

// Mock de fetch global
global.fetch = jest.fn();

// On simule le localStorage pour les tests de cache
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('API Service Tests with Cache and Retries', () => {

  // Reset des mocks ET DU CACHE avant chaque test
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  describe('fetchTopCryptos', () => {
    it('should fetch top cryptos and save to cache', async () => {
      const mockData = [{ id: 'bitcoin', name: 'Bitcoin' }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchTopCryptos();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/coins/markets'));
      expect(result).toEqual(mockData);
      
      // On refait l'appel, il ne doit PAS faire de fetch car les données sont en cache
      const cachedResult = await fetchTopCryptos();
      expect(fetch).toHaveBeenCalledTimes(1); // Le compteur n'a pas bougé
      expect(cachedResult).toEqual(mockData);
    });

    it('should throw an error after multiple retries', async () => {
      // On simule 3 échecs consécutifs
      fetch
        .mockRejectedValueOnce(new Error('Network error 1'))
        .mockRejectedValueOnce(new Error('Network error 2'))
        .mockRejectedValueOnce(new Error('Network error 3'));

      // On s'attend à ce que la fonction lève la dernière erreur après 3 tentatives
      await expect(fetchTopCryptos()).rejects.toThrow('Network error 3');
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('searchCryptos', () => {
    it('should return empty array when query is empty', async () => {
      const result = await searchCryptos('');
      expect(result).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should perform a two-step search and return rich data', async () => {
      // Mock de la 1ère réponse (pour l'appel /search)
      const mockSearchResponse = {
        coins: [{ id: 'bitcoin', name: 'Bitcoin' }],
      };
      // Mock de la 2ème réponse (pour l'appel /coins/markets)
      const mockMarketsResponse = [
        { id: 'bitcoin', name: 'Bitcoin', current_price: 50000 },
      ];

      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockSearchResponse })
        .mockResolvedValueOnce({ ok: true, json: async () => mockMarketsResponse });

      const result = await searchCryptos('bitcoin');

      // On vérifie que les deux appels ont été faits
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/search?query=bitcoin'));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/coins/markets?vs_currency=usd&ids=bitcoin'));

      // Le résultat final doit être les données riches du 2ème appel
      expect(result).toEqual(mockMarketsResponse);
    });
    
    it('should throw an error if the second API call fails', async () => {
      const mockSearchResponse = { coins: [{ id: 'bitcoin' }] };
      
      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockSearchResponse })
        .mockRejectedValue(new Error('Failed to fetch markets')); // Le 2ème appel échoue

      await expect(searchCryptos('bitcoin')).rejects.toThrow('Failed to fetch markets');
      expect(fetch).toHaveBeenCalledTimes(4); // Le 1er appel a réussi, le 2ème a échoué
    });
  });
});