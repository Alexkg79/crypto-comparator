import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Portfolio from './Portfolio';

// Mock le hook AVANT import
jest.mock('../hooks/usePortfolio', () => ({
  usePortfolio: jest.fn(),
}));

// Puis importe la version mockée
import { usePortfolio } from '../hooks/usePortfolio';

const mockTransactions = [
  { id: '1', symbol: 'btc', cryptoId: 'bitcoin', quantity: 1, pricePerCoin: 20000 },
];

test('affiche portefeuille vide', () => {
  usePortfolio.mockReturnValue({
    transactions: [],
    addTransaction: jest.fn(),
    editTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
  });

  render(<Portfolio />);
  expect(screen.getByText(/Votre portefeuille est vide/i)).toBeInTheDocument();
});

test('affiche les transactions du portefeuille', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([{ id: 'bitcoin', current_price: 25000, image: '' }]),
    })
  );

  usePortfolio.mockReturnValue({
    transactions: mockTransactions,
    addTransaction: jest.fn(),
    editTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
  });

  render(<Portfolio />);
  expect(await screen.findByText(/btc/i)).toBeInTheDocument();
  expect(screen.getByText(/Ajouter une transaction/i)).toBeInTheDocument();
});
