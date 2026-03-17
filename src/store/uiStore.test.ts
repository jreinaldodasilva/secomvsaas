import { useUIStore } from './uiStore';
import { act } from '@testing-library/react';

describe('uiStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useUIStore.setState({ sidebarOpen: true });
  });

  it('has correct initial state', () => {
    const state = useUIStore.getState();
    expect(state.sidebarOpen).toBe(true);
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
});
