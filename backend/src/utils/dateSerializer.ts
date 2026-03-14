export const serializeDate = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  try {
    const d = date instanceof Date ? date : new Date(date);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
};

export const serializeDates = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return serializeDate(obj);
  if (Array.isArray(obj)) return obj.map(serializeDates);
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      result[key] = value instanceof Date ? serializeDate(value)
        : value && typeof value === 'object' ? serializeDates(value)
        : value;
    }
  }
  return result;
};
