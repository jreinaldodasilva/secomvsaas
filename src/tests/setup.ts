import '@testing-library/jest-dom/vitest';
import { useI18nStore } from '@/i18n';
import { resetUIStore } from '@/store';
import { resetToastStore } from '@/components/UI/Toast/toastStore';

// Set deterministic locale for tests
useI18nStore.getState().setLocale('pt-BR');

// Reset Zustand singletons after every test to prevent state leakage across suites
afterEach(() => {
  resetUIStore();
  resetToastStore();
});

// Mock matchMedia (not available in jsdom)
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
