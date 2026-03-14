import { emailTemplates } from '../../../src/services/external/templates/emailTemplates';

describe('emailTemplates', () => {
  it('welcome returns subject and HTML with name', () => {
    const result = emailTemplates.welcome('Alice');
    expect(result.subject).toContain('Bem-vindo');
    expect(result.html).toContain('Alice');
    expect(result.html).toContain('</html>');
  });

  it('passwordReset returns HTML with token link', () => {
    const result = emailTemplates.passwordReset('Bob', 'abc123');
    expect(result.subject).toContain('senha');
    expect(result.html).toContain('token=abc123');
    expect(result.html).toContain('Bob');
  });

  it('accountLocked returns HTML with name', () => {
    const result = emailTemplates.accountLocked('Carol');
    expect(result.subject).toContain('bloqueada');
    expect(result.html).toContain('Carol');
    expect(result.html).toContain('forgot-password');
  });

  it('invite returns HTML with inviter, tenant, token, and role', () => {
    const result = emailTemplates.invite('Dave', 'Acme Corp', 'tok456', 'manager');
    expect(result.subject).toContain('Acme Corp');
    expect(result.html).toContain('Dave');
    expect(result.html).toContain('Acme Corp');
    expect(result.html).toContain('token=tok456');
    expect(result.html).toContain('manager');
  });
});
