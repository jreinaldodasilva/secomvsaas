import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// ── Mock useApi ───────────────────────────────────────────────────────────────
const mockUseApiQuery = vi.fn();
const mockUseApiMutation = vi.fn();

vi.mock('./useApi', () => ({
  useApiQuery: (...args: unknown[]) => mockUseApiQuery(...args),
  useApiMutation: (...args: unknown[]) => mockUseApiMutation(...args),
}));

// ── Imports after mock ────────────────────────────────────────────────────────
import {
  usePressReleaseList, usePressReleaseDetail,
  useCreatePressRelease, useUpdatePressRelease, useDeletePressRelease,
} from './usePressRelease';
import {
  useAppointmentList, useAppointmentDetail,
  useCreateAppointment, useUpdateAppointment, useDeleteAppointment,
} from './useAppointment';
import {
  useClippingList, useClippingDetail,
  useCreateClipping, useUpdateClipping, useDeleteClipping,
} from './useClipping';
import {
  useEventList, useEventDetail,
  useCreateEvent, useUpdateEvent, useDeleteEvent,
} from './useEvent';
import {
  useMediaContactList, useMediaContactDetail,
  useCreateMediaContact, useUpdateMediaContact, useDeleteMediaContact,
} from './useMediaContact';
import {
  useCitizenPortalList, useCitizenPortalDetail,
  useCreateCitizenPortal, useUpdateCitizenPortal, useDeleteCitizenPortal,
} from './useCitizenPortal';
import {
  useSocialMediaList, useSocialMediaDetail,
  useCreateSocialMedia, useUpdateSocialMedia, useDeleteSocialMedia,
} from './useSocialMedia';

// ── Wrapper ───────────────────────────────────────────────────────────────────
function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children);
  }
  return Wrapper;
}

beforeEach(() => {
  mockUseApiQuery.mockReturnValue({});
  mockUseApiMutation.mockReturnValue({});
});

// ── Helpers: assert mutation invalidation ────────────────────────────────────
function assertMutationInvalidates(domainKey: string) {
  const [, , opts] = mockUseApiMutation.mock.lastCall as [string, unknown, { invalidateKeys: string[][] }];
  expect(opts.invalidateKeys).toEqual([[domainKey]]);
}

function assertUpdateDetailInvalidatesFn(domainKey: string, sampleId: string) {
  const [, , opts] = mockUseApiMutation.mock.lastCall as [string, unknown, { invalidateKeysFn: (v: { id: string }) => string[][] }];
  expect(typeof opts.invalidateKeysFn).toBe('function');
  expect(opts.invalidateKeysFn({ id: sampleId })).toEqual([[domainKey, sampleId]]);
}

function assertDeleteDetailInvalidatesFn(domainKey: string, sampleId: string) {
  const [, , opts] = mockUseApiMutation.mock.lastCall as [string, unknown, { invalidateKeysFn: (id: string) => string[][] }];
  expect(typeof opts.invalidateKeysFn).toBe('function');
  expect(opts.invalidateKeysFn(sampleId)).toEqual([[domainKey, sampleId]]);
}

// ── PressRelease ──────────────────────────────────────────────────────────────
describe('usePressRelease hooks', () => {
  const wrapper = makeWrapper();

  it('usePressReleaseList calls useApiQuery with correct key and path', () => {
    renderHook(() => usePressReleaseList(), { wrapper });
    expect(mockUseApiQuery).toHaveBeenCalledWith(
      ['press-releases'],
      '/api/v1/press-releases',
      undefined,
    );
  });

  it('usePressReleaseList forwards params', () => {
    renderHook(() => usePressReleaseList({ page: 2 }), { wrapper });
    expect(mockUseApiQuery).toHaveBeenCalledWith(
      ['press-releases'],
      '/api/v1/press-releases',
      { page: 2 },
    );
  });

  it('usePressReleaseDetail uses correct key and path', () => {
    renderHook(() => usePressReleaseDetail('abc'), { wrapper });
    expect(mockUseApiQuery).toHaveBeenCalledWith(
      ['press-releases', 'abc'],
      '/api/v1/press-releases/abc',
      undefined,
      { enabled: true },
    );
  });

  it('usePressReleaseDetail disables query when id is empty', () => {
    renderHook(() => usePressReleaseDetail(''), { wrapper });
    const [, , , opts] = mockUseApiQuery.mock.lastCall as [unknown, unknown, unknown, { enabled: boolean }];
    expect(opts.enabled).toBe(false);
  });

  it('useCreatePressRelease posts to correct path and invalidates key', () => {
    renderHook(() => useCreatePressRelease(), { wrapper });
    expect(mockUseApiMutation).toHaveBeenCalledWith('post', '/api/v1/press-releases', expect.any(Object));
    assertMutationInvalidates('press-releases');
  });

  it('useUpdatePressRelease patches with dynamic path and invalidates key', () => {
    renderHook(() => useUpdatePressRelease(), { wrapper });
    const [method, pathFn] = mockUseApiMutation.mock.lastCall as [string, (v: { id: string }) => string];
    expect(method).toBe('patch');
    expect(pathFn({ id: '42' })).toBe('/api/v1/press-releases/42');
    assertMutationInvalidates('press-releases');
    assertUpdateDetailInvalidatesFn('press-releases', '42');
  });

  it('useDeletePressRelease deletes with dynamic path and invalidates key', () => {
    renderHook(() => useDeletePressRelease(), { wrapper });
    const [method, pathFn] = mockUseApiMutation.mock.lastCall as [string, (id: string) => string];
    expect(method).toBe('delete');
    expect(pathFn('99')).toBe('/api/v1/press-releases/99');
    assertMutationInvalidates('press-releases');
    assertDeleteDetailInvalidatesFn('press-releases', '99');
  });
});

// ── Appointment ───────────────────────────────────────────────────────────────
describe('useAppointment hooks', () => {
  const wrapper = makeWrapper();

  it('useAppointmentList calls useApiQuery with correct key and path', () => {
    renderHook(() => useAppointmentList(), { wrapper });
    expect(mockUseApiQuery).toHaveBeenCalledWith(['appointments'], '/api/v1/appointments', undefined);
  });

  it('useAppointmentDetail disables query when id is empty', () => {
    renderHook(() => useAppointmentDetail(''), { wrapper });
    const [, , , opts] = mockUseApiQuery.mock.lastCall as [unknown, unknown, unknown, { enabled: boolean }];
    expect(opts.enabled).toBe(false);
  });

  it('useCreateAppointment posts to correct path and invalidates key', () => {
    renderHook(() => useCreateAppointment(), { wrapper });
    expect(mockUseApiMutation).toHaveBeenCalledWith('post', '/api/v1/appointments', expect.any(Object));
    assertMutationInvalidates('appointments');
  });

  it('useUpdateAppointment patches with dynamic path and invalidates detail', () => {
    renderHook(() => useUpdateAppointment(), { wrapper });
    const [, pathFn] = mockUseApiMutation.mock.lastCall as [string, (v: { id: string }) => string];
    expect(pathFn({ id: '5' })).toBe('/api/v1/appointments/5');
    assertUpdateDetailInvalidatesFn('appointments', '5');
  });

  it('useDeleteAppointment deletes with dynamic path and invalidates detail', () => {
    renderHook(() => useDeleteAppointment(), { wrapper });
    const [, pathFn] = mockUseApiMutation.mock.lastCall as [string, (id: string) => string];
    expect(pathFn('7')).toBe('/api/v1/appointments/7');
    assertDeleteDetailInvalidatesFn('appointments', '7');
  });
});

// ── Clipping ──────────────────────────────────────────────────────────────────
describe('useClipping hooks', () => {
  const wrapper = makeWrapper();

  it('useClippingList calls useApiQuery with correct key and path', () => {
    renderHook(() => useClippingList(), { wrapper });
    expect(mockUseApiQuery).toHaveBeenCalledWith(['clippings'], '/api/v1/clippings', undefined);
  });

  it('useClippingDetail disables query when id is empty', () => {
    renderHook(() => useClippingDetail(''), { wrapper });
    const [, , , opts] = mockUseApiQuery.mock.lastCall as [unknown, unknown, unknown, { enabled: boolean }];
    expect(opts.enabled).toBe(false);
  });

  it('useCreateClipping posts to correct path and invalidates key', () => {
    renderHook(() => useCreateClipping(), { wrapper });
    expect(mockUseApiMutation).toHaveBeenCalledWith('post', '/api/v1/clippings', expect.any(Object));
    assertMutationInvalidates('clippings');
  });

  it('useUpdateClipping patches with dynamic path and invalidates detail', () => {
    renderHook(() => useUpdateClipping(), { wrapper });
    const [, pathFn] = mockUseApiMutation.mock.lastCall as [string, (v: { id: string }) => string];
    expect(pathFn({ id: '3' })).toBe('/api/v1/clippings/3');
    assertUpdateDetailInvalidatesFn('clippings', '3');
  });

  it('useDeleteClipping deletes with dynamic path and invalidates detail', () => {
    renderHook(() => useDeleteClipping(), { wrapper });
    const [, pathFn] = mockUseApiMutation.mock.lastCall as [string, (id: string) => string];
    expect(pathFn('8')).toBe('/api/v1/clippings/8');
    assertDeleteDetailInvalidatesFn('clippings', '8');
  });
});

// ── Event ─────────────────────────────────────────────────────────────────────
describe('useEvent hooks', () => {
  const wrapper = makeWrapper();

  it('useEventList calls useApiQuery with correct key and path', () => {
    renderHook(() => useEventList(), { wrapper });
    expect(mockUseApiQuery).toHaveBeenCalledWith(['events'], '/api/v1/events', undefined);
  });

  it('useEventDetail disables query when id is empty', () => {
    renderHook(() => useEventDetail(''), { wrapper });
    const [, , , opts] = mockUseApiQuery.mock.lastCall as [unknown, unknown, unknown, { enabled: boolean }];
    expect(opts.enabled).toBe(false);
  });

  it('useCreateEvent posts to correct path and invalidates key', () => {
    renderHook(() => useCreateEvent(), { wrapper });
    expect(mockUseApiMutation).toHaveBeenCalledWith('post', '/api/v1/events', expect.any(Object));
    assertMutationInvalidates('events');
  });

  it('useUpdateEvent patches with dynamic path and invalidates detail', () => {
    renderHook(() => useUpdateEvent(), { wrapper });
    const [, pathFn] = mockUseApiMutation.mock.lastCall as [string, (v: { id: string }) => string];
    expect(pathFn({ id: '11' })).toBe('/api/v1/events/11');
    assertUpdateDetailInvalidatesFn('events', '11');
  });

  it('useDeleteEvent deletes with dynamic path and invalidates detail', () => {
    renderHook(() => useDeleteEvent(), { wrapper });
    const [, pathFn] = mockUseApiMutation.mock.lastCall as [string, (id: string) => string];
    expect(pathFn('12')).toBe('/api/v1/events/12');
    assertDeleteDetailInvalidatesFn('events', '12');
  });
});

// ── MediaContact ──────────────────────────────────────────────────────────────
describe('useMediaContact hooks', () => {
  const wrapper = makeWrapper();

  it('useMediaContactList calls useApiQuery with correct key and path', () => {
    renderHook(() => useMediaContactList(), { wrapper });
    expect(mockUseApiQuery).toHaveBeenCalledWith(['media-contacts'], '/api/v1/media-contacts', undefined);
  });

  it('useMediaContactDetail disables query when id is empty', () => {
    renderHook(() => useMediaContactDetail(''), { wrapper });
    const [, , , opts] = mockUseApiQuery.mock.lastCall as [unknown, unknown, unknown, { enabled: boolean }];
    expect(opts.enabled).toBe(false);
  });

  it('useCreateMediaContact posts to correct path and invalidates key', () => {
    renderHook(() => useCreateMediaContact(), { wrapper });
    expect(mockUseApiMutation).toHaveBeenCalledWith('post', '/api/v1/media-contacts', expect.any(Object));
    assertMutationInvalidates('media-contacts');
  });

  it('useUpdateMediaContact patches with dynamic path and invalidates detail', () => {
    renderHook(() => useUpdateMediaContact(), { wrapper });
    const [, pathFn] = mockUseApiMutation.mock.lastCall as [string, (v: { id: string }) => string];
    expect(pathFn({ id: '20' })).toBe('/api/v1/media-contacts/20');
    assertUpdateDetailInvalidatesFn('media-contacts', '20');
  });

  it('useDeleteMediaContact deletes with dynamic path and invalidates detail', () => {
    renderHook(() => useDeleteMediaContact(), { wrapper });
    const [, pathFn] = mockUseApiMutation.mock.lastCall as [string, (id: string) => string];
    expect(pathFn('21')).toBe('/api/v1/media-contacts/21');
    assertDeleteDetailInvalidatesFn('media-contacts', '21');
  });
});

// ── CitizenPortal ─────────────────────────────────────────────────────────────
describe('useCitizenPortal hooks', () => {
  const wrapper = makeWrapper();

  it('useCitizenPortalList calls useApiQuery with correct key and path', () => {
    renderHook(() => useCitizenPortalList(), { wrapper });
    expect(mockUseApiQuery).toHaveBeenCalledWith(['citizen-portal'], '/api/v1/citizen-portal', undefined);
  });

  it('useCitizenPortalDetail disables query when id is empty', () => {
    renderHook(() => useCitizenPortalDetail(''), { wrapper });
    const [, , , opts] = mockUseApiQuery.mock.lastCall as [unknown, unknown, unknown, { enabled: boolean }];
    expect(opts.enabled).toBe(false);
  });

  it('useCreateCitizenPortal posts to correct path and invalidates key', () => {
    renderHook(() => useCreateCitizenPortal(), { wrapper });
    expect(mockUseApiMutation).toHaveBeenCalledWith('post', '/api/v1/citizen-portal', expect.any(Object));
    assertMutationInvalidates('citizen-portal');
  });

  it('useUpdateCitizenPortal patches with dynamic path and invalidates detail', () => {
    renderHook(() => useUpdateCitizenPortal(), { wrapper });
    const [, pathFn] = mockUseApiMutation.mock.lastCall as [string, (v: { id: string }) => string];
    expect(pathFn({ id: '30' })).toBe('/api/v1/citizen-portal/30');
    assertUpdateDetailInvalidatesFn('citizen-portal', '30');
  });

  it('useDeleteCitizenPortal deletes with dynamic path and invalidates detail', () => {
    renderHook(() => useDeleteCitizenPortal(), { wrapper });
    const [, pathFn] = mockUseApiMutation.mock.lastCall as [string, (id: string) => string];
    expect(pathFn('31')).toBe('/api/v1/citizen-portal/31');
    assertDeleteDetailInvalidatesFn('citizen-portal', '31');
  });
});

// ── SocialMedia ───────────────────────────────────────────────────────────────
describe('useSocialMedia hooks', () => {
  const wrapper = makeWrapper();

  it('useSocialMediaList calls useApiQuery with correct key and path', () => {
    renderHook(() => useSocialMediaList(), { wrapper });
    expect(mockUseApiQuery).toHaveBeenCalledWith(['social-media'], '/api/v1/social-media', undefined);
  });

  it('useSocialMediaDetail disables query when id is empty', () => {
    renderHook(() => useSocialMediaDetail(''), { wrapper });
    const [, , , opts] = mockUseApiQuery.mock.lastCall as [unknown, unknown, unknown, { enabled: boolean }];
    expect(opts.enabled).toBe(false);
  });

  it('useCreateSocialMedia posts to correct path and invalidates key', () => {
    renderHook(() => useCreateSocialMedia(), { wrapper });
    expect(mockUseApiMutation).toHaveBeenCalledWith('post', '/api/v1/social-media', expect.any(Object));
    assertMutationInvalidates('social-media');
  });

  it('useUpdateSocialMedia patches with dynamic path and invalidates detail', () => {
    renderHook(() => useUpdateSocialMedia(), { wrapper });
    const [, pathFn] = mockUseApiMutation.mock.lastCall as [string, (v: { id: string }) => string];
    expect(pathFn({ id: '40' })).toBe('/api/v1/social-media/40');
    assertUpdateDetailInvalidatesFn('social-media', '40');
  });

  it('useDeleteSocialMedia deletes with dynamic path and invalidates detail', () => {
    renderHook(() => useDeleteSocialMedia(), { wrapper });
    const [, pathFn] = mockUseApiMutation.mock.lastCall as [string, (id: string) => string];
    expect(pathFn('41')).toBe('/api/v1/social-media/41');
    assertDeleteDetailInvalidatesFn('social-media', '41');
  });
});
