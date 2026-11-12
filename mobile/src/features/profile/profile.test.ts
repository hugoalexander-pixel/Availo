import { validateName, validateEmail, validateProfile } from './validation';

describe('Profile Validation', () => {
  test('validateName works', () => {
    expect(validateName('')).toBe('Nama lengkap wajib diisi.');
    expect(validateName('A')).toBe('Nama minimal 2 karakter.');
    expect(validateName('Valid Name')).toBeNull();
  });

  test('validateEmail works', () => {
    expect(validateEmail('')).toBe('Email wajib diisi.');
    expect(validateEmail('invalid')).toBe('Format email tidak valid.');
    expect(validateEmail('test@example.com')).toBeNull();
  });

  test('validateProfile aggregates errors', () => {
    const errors = validateProfile('', 'bad');
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
  });
});
