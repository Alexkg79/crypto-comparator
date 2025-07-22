import { renderHook, act } from '@testing-library/react';
import { usePortfolio } from './usePortfolio';
import toast from 'react-hot-toast';

jest.mock('react-hot-toast');

const mockTimestamp = 1640995200000;

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();

// Mock window.confirm pour le test de suppression
const mockConfirm = jest.fn();

beforeAll(() => {
  jest.spyOn(Date, 'now').mockImplementation(() => mockTimestamp);
  
  jest.spyOn(global, 'Date').mockImplementation(() => ({
    toISOString: () => '2023-01-01T00:00:00.000Z'
  }));
  
  global.Date.now = jest.fn(() => mockTimestamp);
  
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  Object.defineProperty(window, 'confirm', { value: mockConfirm });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('usePortfolio Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    mockConfirm.mockClear();
  });

  describe('Initialization', () => {
    it('should initialize with empty transactions when localStorage is empty', () => {
      const { result } = renderHook(() => usePortfolio());
      
      expect(result.current.transactions).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('cryptoPortfolio');
    });

    it('should initialize with transactions from localStorage', () => {
      const storedTransactions = [
        { id: 1, cryptoId: 'bitcoin', amount: 0.5, price: 50000, type: 'buy' }
      ];
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(storedTransactions));
      
      const { result } = renderHook(() => usePortfolio());
      
      expect(result.current.transactions).toEqual(storedTransactions);
    });
  });

  describe('addTransaction', () => {
    it('should add a new transaction with generated id and date', () => {
      const { result } = renderHook(() => usePortfolio());
      
      const newTransaction = {
        cryptoId: 'bitcoin',
        amount: 0.5,
        price: 50000,
        type: 'buy'
      };

      act(() => {
        result.current.addTransaction(newTransaction);
      });

      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0]).toEqual({
        ...newTransaction,
        id: mockTimestamp,
        date: '2023-01-01T00:00:00.000Z'
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cryptoPortfolio',
        JSON.stringify([{
          ...newTransaction,
          id: mockTimestamp,
          date: '2023-01-01T00:00:00.000Z'
        }])
      );
      
      expect(toast.success).toHaveBeenCalledWith('Transaction ajoutée !');
    });
  });

  describe('editTransaction', () => {
    it('should edit an existing transaction', () => {
      const initialTransactions = [{
        id: 1,
        cryptoId: 'bitcoin',
        amount: 0.5,
        price: 50000,
        type: 'buy',
        date: '2023-01-01T00:00:00.000Z'
      }];
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialTransactions));

      const { result } = renderHook(() => usePortfolio());
      
      act(() => {
        result.current.editTransaction(1, { amount: 1.0, price: 60000 });
      });

      expect(result.current.transactions[0]).toEqual({
        id: 1,
        cryptoId: 'bitcoin',
        amount: 1.0,
        price: 60000,
        type: 'buy',
        date: '2023-01-01T00:00:00.000Z'
      });
      
      expect(toast.success).toHaveBeenCalledWith('Transaction modifiée !');
    });

    it('should not modify non-matching transactions', () => {
      const initialTransactions = [
        { id: 1, cryptoId: 'bitcoin', amount: 0.5, price: 50000, type: 'buy' },
        { id: 2, cryptoId: 'ethereum', amount: 2.0, price: 3000, type: 'buy' }
      ];
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialTransactions));

      const { result } = renderHook(() => usePortfolio());
      
      act(() => {
        result.current.editTransaction(1, { amount: 1.0 });
      });

      expect(result.current.transactions[0].amount).toBe(1.0);
      expect(result.current.transactions[1].amount).toBe(2.0); // Inchangé
    });
  });

  describe('deleteTransaction', () => {
    it('should delete transaction when confirmed', () => {
      const initialTransactions = [
        { id: 1, cryptoId: 'bitcoin', amount: 0.5, price: 50000, type: 'buy' },
        { id: 2, cryptoId: 'ethereum', amount: 2.0, price: 3000, type: 'buy' }
      ];
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialTransactions));
      mockConfirm.mockReturnValueOnce(true);

      const { result } = renderHook(() => usePortfolio());
      
      act(() => {
        result.current.deleteTransaction(1);
      });

      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0].id).toBe(2);
      expect(mockConfirm).toHaveBeenCalledWith("Êtes-vous sûr de vouloir supprimer cette transaction ?");
      expect(toast.error).toHaveBeenCalledWith('Transaction supprimée.');
    });

    it('should not delete transaction when not confirmed', () => {
      const initialTransactions = [
        { id: 1, cryptoId: 'bitcoin', amount: 0.5, price: 50000, type: 'buy' }
      ];
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialTransactions));
      mockConfirm.mockReturnValueOnce(false);

      const { result } = renderHook(() => usePortfolio());
      
      act(() => {
        result.current.deleteTransaction(1);
      });

      expect(result.current.transactions).toHaveLength(1);
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('localStorage integration', () => {
    it('should save transactions to localStorage on every change', () => {
      const { result } = renderHook(() => usePortfolio());
      
      act(() => {
        result.current.addTransaction({
          cryptoId: 'bitcoin',
          amount: 0.5,
          price: 50000,
          type: 'buy'
        });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cryptoPortfolio',
        expect.stringContaining('bitcoin')
      );
    });
  });
});