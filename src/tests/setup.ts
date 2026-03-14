import '@testing-library/jest-dom/vitest';
import { useI18nStore } from '../i18n';

// Set deterministic locale for tests
useI18nStore.getState().setLocale('pt-BR');
