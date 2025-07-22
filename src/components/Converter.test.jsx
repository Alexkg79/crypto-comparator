import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Converter from './Converter';

describe('Converter', () => {
  it('affiche le convertisseur avec valeurs par défaut', () => {
    render(<Converter cryptoSymbol="BTC" fiatSymbol="USD" currentPrice={30000} />);
    expect(screen.getByDisplayValue("1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30000")).toBeInTheDocument();
  });

  it('met à jour le fiat quand la crypto change', () => {
    render(<Converter cryptoSymbol="BTC" fiatSymbol="USD" currentPrice={20000} />);
    
    const cryptoInput = screen.getByDisplayValue("1");
    fireEvent.change(cryptoInput, { target: { value: "2" } });

    expect(screen.getByDisplayValue("40000")).toBeInTheDocument();
  });

  it('met à jour la crypto quand le fiat change', () => {
    render(<Converter cryptoSymbol="BTC" fiatSymbol="USD" currentPrice={25000} />);
    
    const fiatInput = screen.getByDisplayValue("25000");
    fireEvent.change(fiatInput, { target: { value: "50000" } });

    expect(screen.getByDisplayValue("2")).toBeInTheDocument();
  });
});
