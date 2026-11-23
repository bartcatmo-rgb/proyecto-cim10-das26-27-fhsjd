/**
 * Validate Spanish DNI or NIE according to official checksum algorithm
 * NIE prefixes: X -> 0, Y -> 1, Z -> 2
 */
export function validateDniNie(documentNumber: string): { valid: boolean; formatted: string; error?: string } {
  if (!documentNumber || typeof documentNumber !== 'string') {
    return { valid: false, formatted: '', error: 'El documento no puede estar vacío.' };
  }

  // Remove whitespace and hyphens, uppercase
  const clean = documentNumber.trim().toUpperCase().replace(/[\s-]/g, '');

  const DNI_REGEX = /^(\d{8})([A-Z])$/;
  const NIE_REGEX = /^([XYZ])(\d{7})([A-Z])$/;
  const LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

  if (DNI_REGEX.test(clean)) {
    const match = clean.match(DNI_REGEX)!;
    const num = parseInt(match[1], 10);
    const expectedLetter = LETTERS[num % 23];
    if (match[2] === expectedLetter) {
      return { valid: true, formatted: clean };
    }
    return { valid: false, formatted: clean, error: `Letra de DNI incorrecta (esperada: ${expectedLetter}).` };
  }

  if (NIE_REGEX.test(clean)) {
    const match = clean.match(NIE_REGEX)!;
    let prefixNum = '0';
    if (match[1] === 'Y') prefixNum = '1';
    if (match[1] === 'Z') prefixNum = '2';

    const fullNum = parseInt(prefixNum + match[2], 10);
    const expectedLetter = LETTERS[fullNum % 23];
    if (match[3] === expectedLetter) {
      return { valid: true, formatted: clean };
    }
    return { valid: false, formatted: clean, error: `Letra de NIE incorrecta (esperada: ${expectedLetter}).` };
  }

  return { valid: false, formatted: clean, error: 'Formato no válido. Debe ser DNI (8 dígitos + letra) o NIE (X/Y/Z + 7 dígitos + letra).' };
}

/**
 * Mask DNI/NIE for privacy in public/shared listings
 * e.g. "12345678Z" -> "****5678Z"
 */
export function maskDni(dni: string): string {
  if (!dni) return '********';
  const clean = dni.trim().toUpperCase();
  if (clean.length < 5) return '****';
  return '****' + clean.slice(-5);
}
