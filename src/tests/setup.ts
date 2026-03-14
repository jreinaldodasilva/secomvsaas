import '@testing-library/jest-dom/vitest';
import { useI18nStore } from '../i18n';

// Set deterministic locale for tests
useI18nStore.getState().setLocale('pt-BR');

// Mock matchMedia for ThemeToggle zustand store
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
