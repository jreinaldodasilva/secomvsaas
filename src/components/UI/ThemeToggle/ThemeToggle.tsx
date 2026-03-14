import { useEffect } from 'react';
import { create } from 'zustand';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'vsaas_theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useThemeStore = create<{ theme: Theme; toggle: () => void }>((set, get) => ({
  theme: getInitialTheme(),
  toggle: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.setAttribute('data-theme', next);
    set({ theme: next });
  },
}));

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em', padding: 0 }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
