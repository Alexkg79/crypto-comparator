import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

jest.mock('../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: jest.fn(),
  }),
}));

describe('ThemeToggle', () => {
  it('affiche 🌙 si le thème est light', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toHaveTextContent('🌙');
  });
});
