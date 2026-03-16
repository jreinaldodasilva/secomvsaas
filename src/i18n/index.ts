import { create } from 'zustand';
import ptBR from './locales/pt-BR.json';

const locales: Record<string, Record<string, any>> = { 'pt-BR': ptBR };

const STORAGE_KEY = 'secom_locale';
const DEFAULT_LOCALE = 'pt-BR';
export const SUPPORTED_LOCALES = ['pt-BR'];

function getInitialLocale(): string {
  return DEFAULT_LOCALE;
}

interface I18nState {
  locale: string;
  setLocale: (locale: string) => void;
}

export const useI18nStore = create<I18nState>((set) => ({
  locale: getInitialLocale(),
  setLocale: (locale) => {
    if (!locales[locale]) return;
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    set({ locale });
  },
}));

function resolve(obj: any, path: string): string | undefined {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

export function t(key: string, params?: Record<string, string | number>): string {
  const { locale } = useI18nStore.getState();
  const value = resolve(locales[locale], key) ?? resolve(locales[DEFAULT_LOCALE], key) ?? key;
  if (typeof value !== 'string') return key;
  if (!params) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_, k) => String(params[k] ?? `{{${k}}}`));
}

export function tArray(key: string): string[] {
  const { locale } = useI18nStore.getState();
  const value = resolve(locales[locale], key) ?? resolve(locales[DEFAULT_LOCALE], key);
  return Array.isArray(value) ? value : [];
}

export function useTranslation() {
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);
  // Re-render when locale changes by reading it from the store
  void locale;
  return { t, tArray, locale, setLocale };
}
