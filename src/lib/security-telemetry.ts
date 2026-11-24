import crypto from 'crypto';
import { getSessionSecret } from './auth/crypto';

/**
 * Defensive Telemetry & Security Utilities
 * Zero-Trust & RGPD/LOPDGDD/APDCAT Compliant
 */

/**
 * Extract client IP from Request or Headers safely
 */
export function extractClientIp(reqOrHeaders?: Request | Headers | { headers: Headers } | null): string {
  if (!reqOrHeaders) return '127.0.0.1';

  let headers: Headers;
  if ('headers' in reqOrHeaders && typeof (reqOrHeaders.headers as any).get === 'function') {
    headers = reqOrHeaders.headers;
  } else if (typeof (reqOrHeaders as any).get === 'function') {
    headers = reqOrHeaders as Headers;
  } else {
    return '127.0.0.1';
  }

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = headers.get('x-real-ip');
  if (realIp && realIp.trim()) return realIp.trim();

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp && cfConnectingIp.trim()) return cfConnectingIp.trim();

  return '127.0.0.1';
}

/**
 * Cryptographic pseudonymization of IP addresses using HMAC-SHA256
 * Produces a stable, irreversible pseudonymous identifier 'ip_xxxx' per IP
 */
export function hashIp(ip?: string): string {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return 'ip_local_loopback';
  }
  try {
    const secret = getSessionSecret();
    const digest = crypto
      .createHmac('sha256', secret)
      .update(`aulacim10_ip_salt:${ip.trim()}`)
      .digest('hex')
      .substring(0, 12);
    return `ip_${digest}`;
  } catch {
    return 'ip_anon';
  }
}

/**
 * Mask IP address for display without storing or revealing full address
 * e.g. 192.168.1.45 -> 192.168.***.***
 * e.g. 2001:0db8:85a3:0000:0000:8a2e:0370:7334 -> 2001:0db8:****
 */
export function maskIp(ip?: string): string {
  if (!ip) return '***.***.***.***';
  const clean = ip.trim();
  if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost') {
    return '127.0.***.***';
  }

  if (clean.includes('.')) {
    // IPv4
    const parts = clean.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.***`;
    }
  }

  if (clean.includes(':')) {
    // IPv6
    const parts = clean.split(':');
    return `${parts.slice(0, 2).join(':')}:****:****`;
  }

  return '***.***.***.***';
}

/**
 * Summarize User Agent string into high-level browser and OS without tracking fingerprint
 */
export function summarizeUserAgent(ua?: string | null): string {
  if (!ua || typeof ua !== 'string') return 'Navegador Estándar';

  const clean = ua.toLowerCase();

  // OS Detection
  let os = 'Dispositivo';
  if (clean.includes('windows')) os = 'Windows';
  else if (clean.includes('macintosh') || clean.includes('mac os')) os = 'macOS';
  else if (clean.includes('android')) os = 'Android';
  else if (clean.includes('iphone') || clean.includes('ipad') || clean.includes('ios')) os = 'iOS';
  else if (clean.includes('linux')) os = 'Linux';

  // Browser Detection
  let browser = 'Web';
  if (clean.includes('edg/')) browser = 'Edge';
  else if (clean.includes('chrome/') && !clean.includes('edg/')) browser = 'Chrome';
  else if (clean.includes('firefox/')) browser = 'Firefox';
  else if (clean.includes('safari/') && !clean.includes('chrome/')) browser = 'Safari';
  else if (clean.includes('curl/') || clean.includes('postman') || clean.includes('node-fetch')) browser = 'API Client';

  return `${browser} (${os})`;
}

/**
 * Sanitize security event details: removes passwords, tokens, cookies, emails, DNIs, and phones
 */
export function sanitizeSecurityDetails(text: string): string {
  if (!text || typeof text !== 'string') return '';

  let sanitized = text;

  // Redact passwords in JSON or key-value pairs
  sanitized = sanitized.replace(/(["']?password["']?\s*[:=]\s*["']?)[^"',\s}]+/gi, '$1[PASSWORD_REDACTADO]');
  sanitized = sanitized.replace(/(["']?token["']?\s*[:=]\s*["']?)[^"',\s}]+/gi, '$1[TOKEN_REDACTADO]');
  sanitized = sanitized.replace(/(["']?secret["']?\s*[:=]\s*["']?)[^"',\s}]+/gi, '$1[SECRET_REDACTADO]');

  // Redact Bearer tokens & Session cookie values
  sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [TOKEN_REDACTADO]');
  sanitized = sanitized.replace(/aulacim10_session=[A-Za-z0-9._~+/-]+=*/gi, 'aulacim10_session=[REDACTADO]');

  // Redact DNI / NIE (e.g. 12345678A, X1234567B)
  sanitized = sanitized.replace(/\b[0-9XYZxyz]\d{7}[A-Za-z]\b/g, '[DNI_REDACTADO]');

  // Redact Emails
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTADO]');

  // Redact Spanish Phones (9 digits starting with 6, 7, 8, 9)
  sanitized = sanitized.replace(/\b[6789]\d{8}\b/g, '[TLF_REDACTADO]');

  return sanitized.substring(0, 1000);
}
