import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();

const documentElementMock = {
  className: '',
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(),
    toggle: jest.fn()
  }
};

beforeAll(() => {
  global.localStorage = localStorageMock;
  Object.defineProperty(document, 'documentElement', {
    value: documentElementMock,
    writable: true
  });
});

describe('useTheme Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
    documentElementMock.className = '';
    jest.clearAllMocks();
  });

  it('should initialize with dark theme by default', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('should toggle between themes', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('light');
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('dark');
  });

  it('should apply theme class to document', () => {
    renderHook(() => useTheme());
    expect(documentElementMock.classList.add).toHaveBeenCalledWith('dark-theme');
  });
});