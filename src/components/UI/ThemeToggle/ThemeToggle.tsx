import { useEffect } from 'react';
import { useUIStore } from '../../../store';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className={styles.btn}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
