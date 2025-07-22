import { renderHook, act } from '@testing-library/react';
import { useFavorites } from './useFavorites';

// Mock localStorage complet
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
});

describe('useFavorites Hook', () => {
  beforeEach(() => {
    // Réinitialiser complètement le store et les mocks
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty favorites when localStorage is empty', () => {
      // S'assurer que localStorage retourne null
      localStorageMock.getItem.mockReturnValueOnce(null);
      
      const { result } = renderHook(() => useFavorites());
      const [favorites] = result.current;

      expect(favorites).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('cryptoFavorites');
    });

    it('should initialize with favorites from localStorage', () => {
      const storedFavorites = ['bitcoin', 'ethereum'];
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(storedFavorites));

      const { result } = renderHook(() => useFavorites());
      const [favorites] = result.current;

      expect(favorites).toEqual(storedFavorites);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('cryptoFavorites');
    });
  });

  describe('toggleFavorite', () => {
    it('should add a crypto to favorites', () => {
      // Commencer avec une liste vide
      localStorageMock.getItem.mockReturnValueOnce(null);
      
      const { result } = renderHook(() => useFavorites());
      const [, toggleFavorite] = result.current;

      act(() => {
        toggleFavorite('bitcoin');
      });

      const [favorites] = result.current;
      expect(favorites).toEqual(['bitcoin']);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cryptoFavorites',
        JSON.stringify(['bitcoin'])
      );
    });

    it('should remove a crypto from favorites', () => {
      // Commencer avec bitcoin et ethereum
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(['bitcoin', 'ethereum']));

      const { result } = renderHook(() => useFavorites());
      const [, toggleFavorite] = result.current;

      act(() => {
        toggleFavorite('bitcoin');
      });

      const [favorites] = result.current;
      expect(favorites).toEqual(['ethereum']);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cryptoFavorites',
        JSON.stringify(['ethereum'])
      );
    });
  });
});