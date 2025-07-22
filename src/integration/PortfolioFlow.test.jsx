import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Portfolio from '../pages/Portfolio';
import { usePortfolio } from '../hooks/usePortfolio';
import toast from 'react-hot-toast';

// Mocks des dépendances
jest.mock('../hooks/usePortfolio');
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

global.fetch = jest.fn();
window.confirm = jest.fn();

describe("Tests d'intégration du flux de Portefeuille", () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();

    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 50000 }
      ]),
    });
  });

  test('devrait ajouter, modifier et supprimer une transaction', async () => {
    let transactions = [];
    const mockAddTransaction = jest.fn((newTx) => {
      transactions = [...transactions, { ...newTx, id: Date.now() }];
    });
    const mockEditTransaction = jest.fn((id, data) => {
        transactions = transactions.map(t => t.id === id ? { ...t, ...data } : t);
    });
    const mockDeleteTransaction = jest.fn((id) => {
        transactions = transactions.filter(t => t.id !== id);
    });

    usePortfolio.mockReturnValue({
      transactions,
      addTransaction: mockAddTransaction,
      editTransaction: mockEditTransaction,
      deleteTransaction: mockDeleteTransaction,
    });
    
    const { rerender } = render(<Portfolio />);

    // 1. AJOUTER UNE TRANSACTION
    await user.click(screen.getByText('Ajouter une transaction'));
    const cryptoSelect = await screen.findByLabelText(/Choisir une crypto/i);
    await user.selectOptions(cryptoSelect, 'bitcoin');
    await user.type(screen.getByLabelText(/Quantité/i), '0.5');
    await user.type(screen.getByLabelText(/Prix d'achat par unité/i), '45000');
    await user.click(screen.getByRole('button', { name: 'Ajouter la transaction' }));

    // --- MISE A JOUR DE L'UI ---
    usePortfolio.mockReturnValue({ transactions, addTransaction: mockAddTransaction, editTransaction: mockEditTransaction, deleteTransaction: mockDeleteTransaction });
    fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ id: 'bitcoin', cryptoId: 'bitcoin', symbol: 'BTC', current_price: 50000, image: 'btc.png' }]),
    });
    rerender(<Portfolio />);

    expect(await screen.findByText('0.5')).toBeInTheDocument();

    // 2. MODIFIER LA TRANSACTION
    await user.click(screen.getByLabelText(/Modifier/i));
    await screen.findByText(/Modifier la transaction/i);
    const quantityEditInput = screen.getByLabelText('Quantité :');
    await user.clear(quantityEditInput);
    await user.type(quantityEditInput, '0.6');
    await user.click(screen.getByRole('button', { name: /Sauvegarder/i }));

    // --- MISE A JOUR DE L'UI ---
    usePortfolio.mockReturnValue({ transactions, addTransaction: mockAddTransaction, editTransaction: mockEditTransaction, deleteTransaction: mockDeleteTransaction });
    fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ id: 'bitcoin', cryptoId: 'bitcoin', symbol: 'BTC', current_price: 50000, image: 'btc.png' }]),
    });
    rerender(<Portfolio />);

    expect(await screen.findByText('0.6')).toBeInTheDocument();

    // 3. SUPPRIMER LA TRANSACTION
    window.confirm.mockReturnValue(true);
    await user.click(screen.getByLabelText(/Supprimer/i));
    
    // --- MISE A JOUR DE L'UI ---
    usePortfolio.mockReturnValue({ transactions, addTransaction: mockAddTransaction, editTransaction: mockEditTransaction, deleteTransaction: mockDeleteTransaction });
    rerender(<Portfolio />);
    
    expect(await screen.findByText(/Votre portefeuille est vide/i)).toBeInTheDocument();
  });
});