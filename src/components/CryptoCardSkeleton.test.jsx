import React from 'react';
import { render } from '@testing-library/react';
import CryptoCardSkeleton from './CryptoCardSkeleton';

describe('CryptoCardSkeleton', () => {
  it('affiche les blocs de chargement', () => {
    const { container } = render(<CryptoCardSkeleton />);
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
  });
});
