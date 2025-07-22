import { renderHook, act } from '@testing-library/react';
import { useInfiniteScroll } from './useInfiniteScroll';

describe('useInfiniteScroll Hook', () => {
  let originalAddEventListener;
  let originalRemoveEventListener;
  let scrollCallback;

  beforeAll(() => {
    originalAddEventListener = window.addEventListener;
    originalRemoveEventListener = window.removeEventListener;
    
    window.addEventListener = jest.fn((event, cb) => {
      if (event === 'scroll') scrollCallback = cb;
    });
    window.removeEventListener = jest.fn();
    window.dispatchEvent = jest.fn();
  });

  afterAll(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset document properties
    Object.defineProperty(document.documentElement, 'scrollTop', { value: 0, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, writable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 800, writable: true });
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useInfiniteScroll());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasMore).toBe(true);
    expect(typeof result.current.setIsLoading).toBe('function');
    expect(typeof result.current.setHasMore).toBe('function');
  });

  it('should dispatch loadMore when scrolled near bottom and conditions are met', () => {
    const { result } = renderHook(() => useInfiniteScroll());

    // Simule un scroll près du bas
    document.documentElement.scrollTop = 200;

    act(() => {
      scrollCallback();
    });

    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'loadMore' })
    );
  });

  it('should not dispatch when loading is true', () => {
    const { result } = renderHook(() => useInfiniteScroll());
    
    // Définir le chargement sur vrai
    act(() => {
      result.current.setIsLoading(true);
    });

    // Simuler un scroll près du bas
    document.documentElement.scrollTop = 200;
    
    act(() => {
      scrollCallback();
    });

    expect(window.dispatchEvent).not.toHaveBeenCalled();
  });

  it('should not dispatch when hasMore is false', () => {
    const { result } = renderHook(() => useInfiniteScroll());

    // Définir hasMore sur false
    act(() => {
      result.current.setHasMore(false);
    });

    // Simuler un scroll près du bas
    document.documentElement.scrollTop = 200;
    
    act(() => {
      scrollCallback();
    });

    expect(window.dispatchEvent).not.toHaveBeenCalled();
  });

  it('should not dispatch when not near bottom', () => {
    renderHook(() => useInfiniteScroll());
    
    // Simuler un scroll près du bas
    document.documentElement.scrollTop = 50;
    
    act(() => {
      scrollCallback();
    });

    expect(window.dispatchEvent).not.toHaveBeenCalled();
  });

  it('should add and remove scroll event listener', () => {
    const { unmount } = renderHook(() => useInfiniteScroll());
    
    expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    
    unmount();
    
    expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});