export const PHONE_LENGTH = 10;

export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, PHONE_LENGTH);
}

export function isValidPhone(value: string): boolean {
  return new RegExp(`^\\d{${PHONE_LENGTH}}$`).test(value);
}
