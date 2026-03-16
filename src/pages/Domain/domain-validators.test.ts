import { describe, it, expect } from 'vitest';
import { validatePressRelease, emptyPressReleaseForm } from './PressReleases/PressReleaseForm';
import { validateAppointment, emptyAppointmentForm } from './Appointments/AppointmentForm';
import { validateEvent, emptyEventForm } from './Events/EventForm';
import { validateMediaContact, emptyMediaContactForm } from './MediaContacts/MediaContactForm';
import { validateClipping, emptyClippingForm } from './Clippings/ClippingForm';
import { validateCitizen, emptyCitizenForm } from './CitizenPortal/CitizenPortalForm';
import { validateSocialMedia, emptySocialMediaForm } from './SocialMedia/SocialMediaForm';

const t = (k: string) => k;

// ── PressRelease ──────────────────────────────────────────────────────────────
describe('validatePressRelease', () => {
  it('returns no errors for valid input', () => {
    const form = { ...emptyPressReleaseForm, title: 'Valid title', content: 'Valid content here' };
    expect(validatePressRelease(form, t)).toEqual({});
  });

  it('errors when title < 5 chars', () => {
    const form = { ...emptyPressReleaseForm, title: 'Hi', content: 'Valid content here' };
    const errs = validatePressRelease(form, t);
    expect(errs.title).toBeDefined();
    expect(errs.content).toBeUndefined();
  });

  it('errors when content < 10 chars', () => {
    const form = { ...emptyPressReleaseForm, title: 'Valid title', content: 'Short' };
    const errs = validatePressRelease(form, t);
    expect(errs.content).toBeDefined();
    expect(errs.title).toBeUndefined();
  });

  it('returns both errors when both fields are invalid', () => {
    const errs = validatePressRelease(emptyPressReleaseForm, t);
    expect(Object.keys(errs)).toHaveLength(2);
  });
});

// ── Appointment ───────────────────────────────────────────────────────────────
describe('validateAppointment', () => {
  it('returns no errors for valid input', () => {
    const form = { ...emptyAppointmentForm, citizenName: 'João Silva', service: 'Atendimento', scheduledAt: '2025-12-01T10:00' };
    expect(validateAppointment(form, t)).toEqual({});
  });

  it('errors when citizenName < 2 chars', () => {
    const form = { ...emptyAppointmentForm, citizenName: 'J', service: 'Atendimento', scheduledAt: '2025-12-01T10:00' };
    expect(validateAppointment(form, t).citizenName).toBeDefined();
  });

  it('errors when service is empty', () => {
    const form = { ...emptyAppointmentForm, citizenName: 'João', service: '', scheduledAt: '2025-12-01T10:00' };
    expect(validateAppointment(form, t).service).toBeDefined();
  });

  it('errors when scheduledAt is empty', () => {
    const form = { ...emptyAppointmentForm, citizenName: 'João', service: 'Atendimento', scheduledAt: '' };
    expect(validateAppointment(form, t).scheduledAt).toBeDefined();
  });

  it('returns all errors for empty form', () => {
    expect(Object.keys(validateAppointment(emptyAppointmentForm, t))).toHaveLength(3);
  });
});

// ── Event ─────────────────────────────────────────────────────────────────────
describe('validateEvent', () => {
  it('returns no errors for valid input', () => {
    const form = { ...emptyEventForm, title: 'Evento público', startsAt: '2025-12-01T10:00' };
    expect(validateEvent(form, t)).toEqual({});
  });

  it('errors when title < 3 chars', () => {
    const form = { ...emptyEventForm, title: 'Ev', startsAt: '2025-12-01T10:00' };
    expect(validateEvent(form, t).title).toBeDefined();
  });

  it('errors when startsAt is empty', () => {
    const form = { ...emptyEventForm, title: 'Evento público', startsAt: '' };
    expect(validateEvent(form, t).startsAt).toBeDefined();
  });

  it('returns both errors for empty form', () => {
    expect(Object.keys(validateEvent(emptyEventForm, t))).toHaveLength(2);
  });
});

// ── MediaContact ──────────────────────────────────────────────────────────────
describe('validateMediaContact', () => {
  it('returns no errors for valid input', () => {
    const form = { ...emptyMediaContactForm, name: 'Maria Jornalista', outlet: 'Folha' };
    expect(validateMediaContact(form, t)).toEqual({});
  });

  it('errors when name < 2 chars', () => {
    const form = { ...emptyMediaContactForm, name: 'M', outlet: 'Folha' };
    expect(validateMediaContact(form, t).name).toBeDefined();
  });

  it('errors when outlet < 2 chars', () => {
    const form = { ...emptyMediaContactForm, name: 'Maria', outlet: 'F' };
    expect(validateMediaContact(form, t).outlet).toBeDefined();
  });

  it('returns both errors for empty form', () => {
    expect(Object.keys(validateMediaContact(emptyMediaContactForm, t))).toHaveLength(2);
  });
});

// ── Clipping ──────────────────────────────────────────────────────────────────
describe('validateClipping', () => {
  it('returns no errors for valid input', () => {
    const form = { ...emptyClippingForm, title: 'Notícia importante', source: 'G1' };
    expect(validateClipping(form, t)).toEqual({});
  });

  it('errors when title < 3 chars', () => {
    const form = { ...emptyClippingForm, title: 'No', source: 'G1' };
    expect(validateClipping(form, t).title).toBeDefined();
  });

  it('errors when source < 2 chars', () => {
    const form = { ...emptyClippingForm, title: 'Notícia', source: 'G' };
    expect(validateClipping(form, t).source).toBeDefined();
  });

  it('returns both errors for empty form', () => {
    expect(Object.keys(validateClipping(emptyClippingForm, t))).toHaveLength(2);
  });
});

// ── CitizenPortal ─────────────────────────────────────────────────────────────
describe('validateCitizen', () => {
  it('returns no errors for valid create input', () => {
    const form = { ...emptyCitizenForm, userId: 'user-123', fullName: 'Carlos Cidadão' };
    expect(validateCitizen(form, false, t)).toEqual({});
  });

  it('errors when userId is empty on create', () => {
    const form = { ...emptyCitizenForm, fullName: 'Carlos Cidadão' };
    expect(validateCitizen(form, false, t).userId).toBeDefined();
  });

  it('does not error on userId when editing', () => {
    const form = { ...emptyCitizenForm, fullName: 'Carlos Cidadão' };
    expect(validateCitizen(form, true, t).userId).toBeUndefined();
  });

  it('errors when fullName < 2 chars', () => {
    const form = { ...emptyCitizenForm, userId: 'user-123', fullName: 'C' };
    expect(validateCitizen(form, false, t).fullName).toBeDefined();
  });

  it('returns both errors for empty create form', () => {
    expect(Object.keys(validateCitizen(emptyCitizenForm, false, t))).toHaveLength(2);
  });
});

// ── SocialMedia ───────────────────────────────────────────────────────────────
describe('validateSocialMedia', () => {
  it('returns no errors for valid input', () => {
    const form = { ...emptySocialMediaForm, content: 'Conteúdo da publicação' };
    expect(validateSocialMedia(form, t)).toEqual({});
  });

  it('errors when content is empty', () => {
    expect(validateSocialMedia(emptySocialMediaForm, t).content).toBeDefined();
  });

  it('errors when content is only whitespace', () => {
    const form = { ...emptySocialMediaForm, content: '   ' };
    expect(validateSocialMedia(form, t).content).toBeDefined();
  });
});
