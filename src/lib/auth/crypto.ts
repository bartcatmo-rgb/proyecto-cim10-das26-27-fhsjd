import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export { validateDniNie, maskDni } from './validation';

// Load or generate a persistent session secret
let cachedSessionSecret: string | null = null;

export function getSessionSecret(): string {
  if (cachedSessionSecret) return cachedSessionSecret;

  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length >= 32) {
    cachedSessionSecret = process.env.SESSION_SECRET.trim();
    return cachedSessionSecret;
  }

  // Fallback to local secure secret file outside git
  const secretPath = path.join(process.cwd(), '.session_secret');
  try {
    if (fs.existsSync(secretPath)) {
      const fileSecret = fs.readFileSync(secretPath, 'utf8').trim();
      if (fileSecret.length >= 32) {
        cachedSessionSecret = fileSecret;
        return cachedSessionSecret;
      }
    }
  } catch {
    // Ignore read error, fallback to generating
  }

  // Generate new 64-byte cryptographic secret
  const generated = crypto.randomBytes(64).toString('hex');
  try {
    fs.writeFileSync(secretPath, generated, { mode: 0o600 });
  } catch {
    // In read-only serverless environment, maintain in-memory
  }
  cachedSessionSecret = generated;
  return cachedSessionSecret;
}

/**
 * Hash password with scrypt and unique salt
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    salt,
    hash: derivedKey.toString('hex'),
  };
}

/**
 * Verify password with constant-time equality check
 */
export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');

    if (keyBuffer.length !== storedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(keyBuffer, storedBuffer);
  } catch {
    return false;
  }
}

/**
 * Sign session token using HMAC-SHA256
 */
export function signSessionToken(payload: object): string {
  const secret = getSessionSecret();
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadStr)
    .digest('base64url');
  return `${payloadStr}.${signature}`;
}

/**
 * Verify and parse session token
 */
export function verifySessionToken<T = any>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadStr, signature] = parts;
    const secret = getSessionSecret();
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(payloadStr)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const json = Buffer.from(payloadStr, 'base64url').toString('utf8');
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
