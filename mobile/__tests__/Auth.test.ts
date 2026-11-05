describe('Auth Flow & Validation', () => {
  it('memvalidasi format email kampus yang diizinkan', () => {
    const isCampusEmail = (email: string) => {
      const trimmed = email.trim().toLowerCase();
      return (
        trimmed.includes('@') &&
        (trimmed.endsWith('.ac.id') || trimmed.includes('@student.'))
      );
    };

    expect(isCampusEmail('nadia.aulia@student.nusantara.ac.id')).toBe(true);
    expect(isCampusEmail('budi.santoso@student.nusantara.ac.id')).toBe(true);
    expect(isCampusEmail('mahasiswa@univ.ac.id')).toBe(true);

    expect(isCampusEmail('nadia')).toBe(false);
    expect(isCampusEmail('test@gmail.com')).toBe(false);
    expect(isCampusEmail('')).toBe(false);
  });
});
