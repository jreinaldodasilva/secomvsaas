import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/UI/Icon/Icon';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      className={className}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
    >
      <Icon name={isDark ? 'lightMode' : 'darkMode'} size="1.1rem" aria-hidden />
    </button>
  );
}
