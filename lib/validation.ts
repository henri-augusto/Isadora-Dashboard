/** Máscara de telefone: (XX) 9XXXX-XXXX */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 7)
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 11 && digits[2] === '9';
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
