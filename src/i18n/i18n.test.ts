import { t, tArray, useTranslation, useI18nStore } from './index';
import { renderHook, act } from '@testing-library/react';

describe('t()', () => {
  it('resolves a known key', () => {
    expect(t('common.cancel')).toBe('Cancelar');
  });

  it('resolves a nested key', () => {
    expect(t('auth.email')).toBe('Email');
  });

  it('returns the key itself when missing from all locales', () => {
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('interpolates {{param}} placeholders', () => {
    expect(t('common.goToPage', { page: 3 })).toBe('Ir para a página 3');
  });

  it('leaves unreferenced placeholders intact', () => {
    expect(t('common.goToPage', {})).toBe('Ir para a página {{page}}');
  });

  it('interpolates multiple params', () => {
    expect(t('dashboard.welcome', { name: 'Ana' })).toBe('Bem-vindo, Ana');
  });
});

describe('tArray()', () => {
  it('returns an array for a known array key', () => {
    const result = tArray('password.strength');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(4);
    expect(result[0]).toBe('Fraca');
    expect(result[3]).toBe('Forte');
  });

  it('returns [] for a non-array key', () => {
    expect(tArray('common.cancel')).toEqual([]);
  });

  it('returns [] for a missing key', () => {
    expect(tArray('nonexistent.array')).toEqual([]);
  });
});

describe('useTranslation()', () => {
  it('t() resolves keys reactively', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('common.close')).toBe('Fechar');
  });

  it('tArray() returns array values', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.tArray('password.strength')).toHaveLength(4);
  });

  it('setLocale ignores unsupported locales', () => {
    const { result } = renderHook(() => useTranslation());
    const before = result.current.locale;
    act(() => result.current.setLocale('xx-XX'));
    expect(result.current.locale).toBe(before);
  });
});
