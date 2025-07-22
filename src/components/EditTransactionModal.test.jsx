import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditTransactionModal from './EditTransactionModal';

describe('EditTransactionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnEditTransaction = jest.fn();
  const transaction = {
    id: 'btc',
    symbol: 'btc',
    quantity: 1,
    pricePerCoin: 20000,
  };

  beforeEach(() => jest.clearAllMocks());

  it('affiche les champs pré-remplis', () => {
    render(<EditTransactionModal transaction={transaction} onClose={mockOnClose} onEditTransaction={mockOnEditTransaction} />);
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20000')).toBeInTheDocument();
  });

  it('appelle onClose au clic sur Annuler', () => {
    render(<EditTransactionModal transaction={transaction} onClose={mockOnClose} onEditTransaction={mockOnEditTransaction} />);
    fireEvent.click(screen.getByText('Annuler'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('appelle onEditTransaction avec les nouvelles valeurs', () => {
    render(<EditTransactionModal transaction={transaction} onClose={mockOnClose} onEditTransaction={mockOnEditTransaction} />);
    fireEvent.change(screen.getByLabelText(/Quantité/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Prix par coin/i), { target: { value: '21000' } });
    fireEvent.click(screen.getByText('Sauvegarder'));
    expect(mockOnEditTransaction).toHaveBeenCalledWith('btc', { quantity: 2, pricePerCoin: 21000 });
    expect(mockOnClose).toHaveBeenCalled();
  });
});