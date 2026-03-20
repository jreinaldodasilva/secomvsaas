import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const initialUIState = { sidebarOpen: true };

export const useUIStore = create<UIState>((set) => ({
  ...initialUIState,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

/** Resets store to its initial state. Call in `afterEach` to prevent test state leakage. */
export function resetUIStore() {
  useUIStore.setState(initialUIState);
}
