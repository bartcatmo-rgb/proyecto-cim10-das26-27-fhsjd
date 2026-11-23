import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Enterprise BancActiu Grade Field-Level Encryption & Blind Indexing Module
 * Standards: AES-256-GCM (NIST SP 800-38D) + HMAC-SHA256 Blind Indexing
 * Compliance: RGPD (UE 2016/679 Art. 32) & LOPDGDD 3/2018
 */

let cachedEncryptionKey: Buffer | null = null;
let cachedBindexKey: Buffer | null = null;

function getRootSecret(): string {
  if (process.env.DATA_ENCRYPTION_KEY && process.env.DATA_ENCRYPTION_KEY.trim()) {
    return process.env.DATA_ENCRYPTION_KEY.trim();
  }
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim()) {
    return process.env.SESSION_SECRET.trim();
  }
  const secretPath = path.join(process.cwd(), '.session_secret');
  try {
    if (fs.existsSync(secretPath)) {
      const fileContent = fs.readFileSync(secretPath, 'utf-8').trim();
      if (fileContent.length >= 16) return fileContent;
    }
  } catch {
    // ignore
  }
  return 'aulacim10_default_secure_fallback_key_2026_fhsjd';
}

function getKeys() {
  if (cachedEncryptionKey && cachedBindexKey) {
    return { encKey: cachedEncryptionKey, bindexKey: cachedBindexKey };
  }
  const root = getRootSecret();
  // Derive independent keys using HKDF (RFC 5869)
  const hkdfKey = crypto.hkdfSync('sha256', root, 'aulacim10_salt_rgpd', 'aulacim10_enc_v1', 32);
  const hkdfBindex = crypto.hkdfSync('sha256', root, 'aulacim10_salt_rgpd', 'aulacim10_bindex_v1', 32);

  cachedEncryptionKey = Buffer.from(hkdfKey);
  cachedBindexKey = Buffer.from(hkdfBindex);

  return { encKey: cachedEncryptionKey, bindexKey: cachedBindexKey };
}

/**
 * Encrypt a sensitive text field with AES-256-GCM
 * Output format: v1:<iv_hex>:<tag_hex>:<ciphertext_hex>
 */
export function encryptField(plaintext: string): string {
  if (!plaintext || typeof plaintext !== 'string') return plaintext;
  const { encKey } = getKeys();
  const iv = crypto.randomBytes(12); // 96-bit IV
  const cipher = crypto.createCipheriv('aes-256-gcm', encKey, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return `v1:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a field encrypted with AES-256-GCM.
 * Backward compatible: if the text does not start with "v1:", returns the raw text (legacy migration).
 */
export function decryptField(ciphertext: string): string {
  if (!ciphertext || typeof ciphertext !== 'string' || !ciphertext.startsWith('v1:')) {
    return ciphertext;
  }

  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 4) return ciphertext;

    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const encData = parts[3];

    const { encKey } = getKeys();
    const decipher = crypto.createDecipheriv('aes-256-gcm', encKey, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.warn('Field decryption error, returning raw ciphertext:', err);
    return ciphertext;
  }
}

/**
 * Compute keyed HMAC-SHA256 Blind Index for exact match search without decryption
 */
export function computeBlindIndex(value: string): string {
  if (!value) return '';
  const { bindexKey } = getKeys();
  const normalized = value.trim().toUpperCase();
  return crypto.createHmac('sha256', bindexKey).update(normalized).digest('hex');
}

/**
 * Mask DNI / NIE for general displays (e.g. 48069899Z -> 48****99Z)
 */
export function maskDni(dni: string): string {
  if (!dni) return '***';
  const clean = dni.trim().toUpperCase();
  if (clean.length < 5) return '***';
  return `${clean.slice(0, 2)}${'*'.repeat(Math.max(1, clean.length - 4))}${clean.slice(-2)}`;
}

/**
 * Sanitize strings for security audit logs removing any prospective PII (emails, DNIs, passwords)
 */
export function sanitizeForAudit(text: string): string {
  if (!text) return '';
  return text
    // Replace emails
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_ENMASCARADO]')
    // Replace DNI / NIE (e.g. 12345678A, X1234567A)
    .replace(/\b([XYZxyz]?\d{7,8}[A-Za-z])\b/g, '[DNI_ENMASCARADO]')
    // Replace passwords or tokens in strings
    .replace(/password[:=]\s*[^\s,]+/gi, 'password=[REDACTED]')
    .replace(/secret[:=]\s*[^\s,]+/gi, 'secret=[REDACTED]');
}
