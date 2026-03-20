import { describe, it, expect } from 'vitest';
import {
  validatePressRelease, emptyPressReleaseForm,
} from './pressRelease';
import {
  validateAppointment, emptyAppointmentForm,
} from './appointment';
import {
  validateClipping, emptyClippingForm,
} from './clipping';
import {
  validateEvent, emptyEventForm,
} from './event';
import {
  validateMediaContact, emptyMediaContactForm,
} from './mediaContact';
import {
  validateCitizen, emptyCitizenForm,
} from './citizenPortal';
import {
  validateSocialMedia, emptySocialMediaForm,
} from './socialMedia';

// Identity t() — returns the key so error messages are predictable in tests
const t = (k: string) => k;

// ── PressRelease ──────────────────────────────────────────────────────────────

describe('validatePressRelease', () => {
  it('returns errors for empty form', () => {
    const e = validatePressRelease(emptyPressReleaseForm, t);
    expect(e.title).toBeDefined();
    expect(e.content).toBeDefined();
  });

  it('returns no errors for valid form', () => {
    const e = validatePressRelease(
      { ...emptyPressReleaseForm, title: 'Título válido', content: 'Conteúdo suficiente aqui' },
      t,
    );
    expect(e).toEqual({});
  });

  it('reports title too short', () => {
    const e = validatePressRelease({ ...emptyPressReleaseForm, title: 'abc', content: 'conteúdo longo o suficiente' }, t);
    expect(e.title).toContain('domain.pressReleases.fields.title');
  });
});

// ── Appointment ───────────────────────────────────────────────────────────────

describe('validateAppointment', () => {
  it('returns errors for empty form', () => {
    const e = validateAppointment(emptyAppointmentForm, t);
    expect(e.citizenName).toBeDefined();
    expect(e.service).toBeDefined();
    expect(e.scheduledAt).toBeDefined();
  });

  it('returns no errors for valid form', () => {
    const e = validateAppointment(
      { ...emptyAppointmentForm, citizenName: 'João Silva', service: 'Atendimento', scheduledAt: '2025-01-01T10:00' },
      t,
    );
    expect(e).toEqual({});
  });
});

// ── Clipping ──────────────────────────────────────────────────────────────────

describe('validateClipping', () => {
  it('returns errors for empty form', () => {
    const e = validateClipping(emptyClippingForm, t);
    expect(e.title).toBeDefined();
    expect(e.source).toBeDefined();
  });

  it('returns no errors for valid form', () => {
    const e = validateClipping(
      { ...emptyClippingForm, title: 'Título ok', source: 'Folha' },
      t,
    );
    expect(e).toEqual({});
  });
});

// ── Event ─────────────────────────────────────────────────────────────────────

describe('validateEvent', () => {
  it('returns errors for empty form', () => {
    const e = validateEvent(emptyEventForm, t);
    expect(e.title).toBeDefined();
    expect(e.startsAt).toBeDefined();
  });

  it('returns no errors for valid form', () => {
    const e = validateEvent(
      { ...emptyEventForm, title: 'Evento válido', startsAt: '2025-06-01T09:00' },
      t,
    );
    expect(e).toEqual({});
  });
});

// ── MediaContact ──────────────────────────────────────────────────────────────

describe('validateMediaContact', () => {
  it('returns errors for empty form', () => {
    const e = validateMediaContact(emptyMediaContactForm, t);
    expect(e.name).toBeDefined();
    expect(e.outlet).toBeDefined();
  });

  it('returns no errors for valid form', () => {
    const e = validateMediaContact(
      { ...emptyMediaContactForm, name: 'Ana Lima', outlet: 'Folha de SP' },
      t,
    );
    expect(e).toEqual({});
  });
});

// ── CitizenPortal ─────────────────────────────────────────────────────────────

describe('validateCitizen', () => {
  it('requires userId when creating', () => {
    const e = validateCitizen(emptyCitizenForm, false, t);
    expect(e.userId).toBeDefined();
  });

  it('does not require userId when editing', () => {
    const e = validateCitizen({ ...emptyCitizenForm, fullName: 'Maria Souza' }, true, t);
    expect(e.userId).toBeUndefined();
  });

  it('returns errors for short fullName', () => {
    const e = validateCitizen({ ...emptyCitizenForm, userId: 'u1', fullName: 'A' }, false, t);
    expect(e.fullName).toBeDefined();
  });

  it('returns no errors for valid create form', () => {
    const e = validateCitizen(
      { ...emptyCitizenForm, userId: 'user-123', fullName: 'Maria Souza' },
      false,
      t,
    );
    expect(e).toEqual({});
  });
});

// ── SocialMedia ───────────────────────────────────────────────────────────────

describe('validateSocialMedia', () => {
  it('returns error for empty content', () => {
    const e = validateSocialMedia(emptySocialMediaForm, t);
    expect(e.content).toBeDefined();
  });

  it('returns no errors for valid form', () => {
    const e = validateSocialMedia(
      { ...emptySocialMediaForm, content: 'Publicação válida' },
      t,
    );
    expect(e).toEqual({});
  });
});
