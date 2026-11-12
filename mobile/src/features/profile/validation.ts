export interface ProfileErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return 'Nama lengkap wajib diisi.';
  if (name.trim().length < 2) return 'Nama minimal 2 karakter.';
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email wajib diisi.';
  if (!email.includes('@') || !email.includes('.')) return 'Format email tidak valid.';
  return null;
}

export function validateProfile(name: string, email: string): ProfileErrors {
  const errors: ProfileErrors = {};
  const nameError = validateName(name);
  if (nameError) errors.name = nameError;
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  return errors;
}
