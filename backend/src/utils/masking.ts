export function maskEmail(email: string | undefined | null): string {
  if (!email || !email.includes('@')) return '***@***';
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***';
  return `${local.slice(0, 2)}***@${domain}`;
}

export function maskPhone(phone: string | undefined | null): string {
  if (!phone) return '(**) ****-****';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return '(**) ****-****';
  return `(**) ****-${cleaned.slice(-4)}`;
}

export function maskSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const masked = Array.isArray(data) ? [...data] : { ...data };
  for (const key in masked) {
    if (key === 'email') {
      masked[key] = maskEmail(masked[key]);
    } else if (key === 'phone' || key === 'phoneNumber') {
      masked[key] = maskPhone(masked[key]);
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }
  return masked;
}
