import { useUIStore } from '../../../store';
import { Icon } from '../Icon/Icon';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className={styles.btn}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
    >
      <Icon name={isDark ? 'star' : 'shield'} size="1.1rem" aria-hidden />
    </button>
  );
}
