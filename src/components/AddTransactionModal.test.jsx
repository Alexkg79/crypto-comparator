import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddTransactionModal from './AddTransactionModal';
import * as api from '../services/api';

// Mock de l'API pour éviter les appels réels
jest.mock('../services/api');

describe('AddTransactionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnAddTransaction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le formulaire avec crypto passée en prop', () => {
    const fakeCrypto = {
      id: 'bitcoin',
      symbol: 'btc',
      market_data: { current_price: { usd: 20000 } }
    };

    render(<AddTransactionModal crypto={fakeCrypto} onClose={mockOnClose} onAddTransaction={mockOnAddTransaction} />);

    expect(screen.getByLabelText(/Quantité/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prix d'achat par unité/i)).toHaveValue(20000);
  });

  it('affiche la liste déroulante si aucune crypto n\'est fournie', async () => {
    api.fetchTopCryptos.mockResolvedValue([
      { id: 'bitcoin', name: 'Bitcoin', current_price: 30000 },
      { id: 'ethereum', name: 'Ethereum', current_price: 2000 }
    ]);

    render(<AddTransactionModal onClose={mockOnClose} onAddTransaction={mockOnAddTransaction} />);
    await waitFor(() => expect(screen.getByText('Bitcoin')).toBeInTheDocument());
  });

  it('ajoute une transaction valide', () => {
    const fakeCrypto = {
      id: 'bitcoin',
      symbol: 'btc',
      market_data: { current_price: { usd: 20000 } }
    };

    render(<AddTransactionModal crypto={fakeCrypto} onClose={mockOnClose} onAddTransaction={mockOnAddTransaction} />);
    
    fireEvent.change(screen.getByLabelText(/Quantité/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Prix d'achat/i), { target: { value: '21000' } });
    fireEvent.click(screen.getByText(/Ajouter la transaction/i));

    expect(mockOnAddTransaction).toHaveBeenCalledWith({
      cryptoId: 'bitcoin',
      symbol: 'BTC',
      quantity: 2,
      pricePerCoin: 21000
    });
    expect(mockOnClose).toHaveBeenCalled();
  });
});
