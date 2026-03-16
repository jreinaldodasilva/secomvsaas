import { useEffect } from 'react';
import { useUIStore } from '../../../store';

export function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="theme-toggle-btn"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
