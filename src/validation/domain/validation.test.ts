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
    expect(e.title).toContain('validation.minLength');
    expect(e.title).not.toMatch(/must contain at least/i);
  });

  it('reports invalid category with Portuguese key (no enum exposure)', () => {
    const e = validatePressRelease({ ...emptyPressReleaseForm, title: 'Título válido', content: 'Conteúdo suficiente aqui', category: 'invalid' as any }, t);
    expect(e.category).toContain('validation.invalidEnum');
    expect(e.category).not.toMatch(/Invalid enum value/i);
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
      { ...emptyAppointmentForm, citizenName: 'João Silva', service: 'Atendimento', scheduledAt: '2099-12-31T10:00' },
      t,
    );
    expect(e).toEqual({});
  });

  it('rejects invalid CPF', () => {
    const e = validateAppointment(
      { ...emptyAppointmentForm, citizenName: 'João', service: 'S', scheduledAt: '2099-12-31T10:00', citizenCpf: 'abc' },
      t,
    );
    expect(e.citizenCpf).toContain('validation.invalidCpf');
  });

  it('accepts valid formatted CPF', () => {
    const e = validateAppointment(
      { ...emptyAppointmentForm, citizenName: 'João', service: 'S', scheduledAt: '2099-12-31T10:00', citizenCpf: '529.982.247-25' },
      t,
    );
    expect(e.citizenCpf).toBeUndefined();
  });

  it('accepts empty CPF (optional field)', () => {
    const e = validateAppointment(
      { ...emptyAppointmentForm, citizenName: 'João', service: 'S', scheduledAt: '2099-12-31T10:00' },
      t,
    );
    expect(e.citizenCpf).toBeUndefined();
  });

  it('rejects invalid phone', () => {
    const e = validateAppointment(
      { ...emptyAppointmentForm, citizenName: 'João', service: 'S', scheduledAt: '2099-12-31T10:00', citizenPhone: '123' },
      t,
    );
    expect(e.citizenPhone).toContain('validation.invalidPhone');
  });

  it('accepts valid phone', () => {
    const e = validateAppointment(
      { ...emptyAppointmentForm, citizenName: 'João', service: 'S', scheduledAt: '2099-12-31T10:00', citizenPhone: '(11) 99999-9999' },
      t,
    );
    expect(e.citizenPhone).toBeUndefined();
  });

  it('accepts empty phone (optional)', () => {
    const e = validateAppointment(
      { ...emptyAppointmentForm, citizenName: 'João', service: 'S', scheduledAt: '2099-12-31T10:00', citizenPhone: '' },
      t,
    );
    expect(e.citizenPhone).toBeUndefined();
  });

  it('rejects past scheduledAt', () => {
    const e = validateAppointment(
      { ...emptyAppointmentForm, citizenName: 'João', service: 'S', scheduledAt: '2000-01-01T10:00' },
      t,
    );
    expect(e.scheduledAt).toContain('validation.scheduledInFuture');
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

  it('rejects invalid URL', () => {
    const e = validateClipping({ ...emptyClippingForm, title: 'Título', source: 'G1', sourceUrl: 'notaurl' }, t);
    expect(e.sourceUrl).toContain('validation.invalidUrl');
  });

  it('accepts valid URL', () => {
    const e = validateClipping({ ...emptyClippingForm, title: 'Título', source: 'G1', sourceUrl: 'https://g1.com/noticia' }, t);
    expect(e.sourceUrl).toBeUndefined();
  });

  it('accepts empty URL (optional)', () => {
    const e = validateClipping({ ...emptyClippingForm, title: 'Título', source: 'G1', sourceUrl: '' }, t);
    expect(e.sourceUrl).toBeUndefined();
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
      { ...emptyEventForm, title: 'Evento válido', startsAt: '2099-12-31T09:00' },
      t,
    );
    expect(e).toEqual({});
  });

  it('rejects endsAt before startsAt', () => {
    const e = validateEvent(
      { ...emptyEventForm, title: 'Evento', startsAt: '2099-12-31T10:00', endsAt: '2099-12-31T09:00' },
      t,
    );
    expect(e.endsAt).toContain('validation.endsAfterStarts');
  });

  it('rejects endsAt equal to startsAt', () => {
    const e = validateEvent(
      { ...emptyEventForm, title: 'Evento', startsAt: '2099-12-31T10:00', endsAt: '2099-12-31T10:00' },
      t,
    );
    expect(e.endsAt).toContain('validation.endsAfterStarts');
  });

  it('accepts valid date range', () => {
    const e = validateEvent(
      { ...emptyEventForm, title: 'Evento', startsAt: '2099-12-31T09:00', endsAt: '2099-12-31T11:00' },
      t,
    );
    expect(e.endsAt).toBeUndefined();
  });

  it('skips date range check when endsAt is empty', () => {
    const e = validateEvent(
      { ...emptyEventForm, title: 'Evento', startsAt: '2099-12-31T09:00', endsAt: '' },
      t,
    );
    expect(e.endsAt).toBeUndefined();
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

  it('rejects invalid email', () => {
    const e = validateMediaContact({ ...emptyMediaContactForm, name: 'Ana', outlet: 'Folha', email: 'bad' }, t);
    expect(e.email).toContain('validation.invalidEmail');
  });

  it('accepts valid email', () => {
    const e = validateMediaContact({ ...emptyMediaContactForm, name: 'Ana', outlet: 'Folha', email: 'ana@folha.com' }, t);
    expect(e.email).toBeUndefined();
  });

  it('accepts empty email (optional)', () => {
    const e = validateMediaContact({ ...emptyMediaContactForm, name: 'Ana', outlet: 'Folha', email: '' }, t);
    expect(e.email).toBeUndefined();
  });

  it('rejects invalid phone', () => {
    const e = validateMediaContact({ ...emptyMediaContactForm, name: 'Ana', outlet: 'Folha', phone: '99' }, t);
    expect(e.phone).toContain('validation.invalidPhone');
  });

  it('accepts valid phone', () => {
    const e = validateMediaContact({ ...emptyMediaContactForm, name: 'Ana', outlet: 'Folha', phone: '(11) 3333-4444' }, t);
    expect(e.phone).toBeUndefined();
  });

  it('accepts empty phone (optional)', () => {
    const e = validateMediaContact({ ...emptyMediaContactForm, name: 'Ana', outlet: 'Folha', phone: '' }, t);
    expect(e.phone).toBeUndefined();
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

  it('rejects invalid CPF', () => {
    const e = validateCitizen({ ...emptyCitizenForm, userId: 'u1', fullName: 'Maria', cpf: '11111111111' }, false, t);
    expect(e.cpf).toContain('validation.invalidCpf');
  });

  it('accepts valid CPF', () => {
    const e = validateCitizen({ ...emptyCitizenForm, userId: 'u1', fullName: 'Maria', cpf: '529.982.247-25' }, false, t);
    expect(e.cpf).toBeUndefined();
  });

  it('rejects invalid email', () => {
    const e = validateCitizen({ ...emptyCitizenForm, userId: 'u1', fullName: 'Maria', email: 'notanemail' }, false, t);
    expect(e.email).toContain('validation.invalidEmail');
  });

  it('accepts valid email', () => {
    const e = validateCitizen({ ...emptyCitizenForm, userId: 'u1', fullName: 'Maria', email: 'a@b.com' }, false, t);
    expect(e.email).toBeUndefined();
  });

  it('accepts empty email (optional)', () => {
    const e = validateCitizen({ ...emptyCitizenForm, userId: 'u1', fullName: 'Maria', email: '' }, false, t);
    expect(e.email).toBeUndefined();
  });

  it('rejects invalid phone', () => {
    const e = validateCitizen({ ...emptyCitizenForm, userId: 'u1', fullName: 'Maria', phone: '99' }, false, t);
    expect(e.phone).toContain('validation.invalidPhone');
  });

  it('accepts valid phone', () => {
    const e = validateCitizen({ ...emptyCitizenForm, userId: 'u1', fullName: 'Maria', phone: '11999999999' }, false, t);
    expect(e.phone).toBeUndefined();
  });

  it('accepts empty phone (optional)', () => {
    const e = validateCitizen({ ...emptyCitizenForm, userId: 'u1', fullName: 'Maria', phone: '' }, false, t);
    expect(e.phone).toBeUndefined();
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

  it('rejects invalid media URL', () => {
    const e = validateSocialMedia({ ...emptySocialMediaForm, content: 'Post', mediaUrl: 'notaurl' }, t);
    expect(e.mediaUrl).toContain('validation.invalidUrl');
  });

  it('accepts valid media URL', () => {
    const e = validateSocialMedia({ ...emptySocialMediaForm, content: 'Post', mediaUrl: 'https://cdn.example.com/img.jpg' }, t);
    expect(e.mediaUrl).toBeUndefined();
  });

  it('accepts empty media URL (optional)', () => {
    const e = validateSocialMedia({ ...emptySocialMediaForm, content: 'Post', mediaUrl: '' }, t);
    expect(e.mediaUrl).toBeUndefined();
  });
});
