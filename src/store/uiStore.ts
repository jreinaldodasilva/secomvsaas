import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
}

const initialUIState = { sidebarOpen: true, theme: 'system' as Theme };

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      ...initialUIState,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'secom-ui-state',
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen, theme: state.theme }),
    }
  )
);

/** Resets store to its initial state. Call in `afterEach` to prevent test state leakage. */
export function resetUIStore() {
  useUIStore.setState(initialUIState);
}
