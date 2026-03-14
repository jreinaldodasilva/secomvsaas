import { useUIStore } from './uiStore';
import { act } from '@testing-library/react';

describe('uiStore', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset store to initial state
    useUIStore.setState({ sidebarOpen: true, theme: 'light' });
  });

  it('has correct initial state', () => {
    const state = useUIStore.getState();
    expect(state.sidebarOpen).toBe(true);
    expect(state.theme).toBe('light');
  });

  it('toggleSidebar flips sidebarOpen', () => {
    act(() => useUIStore.getState().toggleSidebar());
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    act(() => useUIStore.getState().toggleSidebar());
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('setSidebarOpen sets explicit value', () => {
    act(() => useUIStore.getState().setSidebarOpen(false));
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    act(() => useUIStore.getState().setSidebarOpen(true));
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('toggleTheme switches between light and dark', () => {
    act(() => useUIStore.getState().toggleTheme());
    expect(useUIStore.getState().theme).toBe('dark');

    act(() => useUIStore.getState().toggleTheme());
    expect(useUIStore.getState().theme).toBe('light');
  });

  it('toggleTheme persists to localStorage', () => {
    act(() => useUIStore.getState().toggleTheme());
    expect(localStorage.getItem('theme')).toBe('dark');

    act(() => useUIStore.getState().toggleTheme());
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
