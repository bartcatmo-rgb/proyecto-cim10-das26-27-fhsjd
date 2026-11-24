import { cookies } from 'next/headers';
import { User } from '@/types';
import { signSessionToken, verifySessionToken } from './crypto';
import { getUserById, logSecurityEvent, getGlobalSessionVersion } from '../db/queries';

export const SESSION_COOKIE_NAME = 'aulacim10_session';

export interface SessionPayload {
  userId: string;
  role: 'student' | 'admin';
  activeRole: 'student' | 'admin';
  canSwitchRole?: boolean;
  sessionVersion?: number;
  exp: number; // Unix timestamp
}

export async function setSessionCookie(
  user: User,
  preferredActiveRole?: 'student' | 'admin'
): Promise<void> {
  const cookieStore = await cookies();
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days

  // If user has canSwitchRole enabled, respect preferredActiveRole, otherwise default to user.role
  const activeRole: 'student' | 'admin' =
    user.canSwitchRole && preferredActiveRole
      ? preferredActiveRole
      : user.activeRole || user.role;

  const currentVersion = getGlobalSessionVersion();

  const token = signSessionToken({
    userId: user.id,
    role: user.role,
    activeRole,
    canSwitchRole: Boolean(user.canSwitchRole),
    sessionVersion: currentVersion,
    exp,
  });

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifySessionToken<SessionPayload>(token);
    if (!payload || !payload.userId) return null;

    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }

    // Check revocation against global session version
    const currentGlobalVersion = getGlobalSessionVersion();
    const tokenVersion = typeof payload.sessionVersion === 'number' ? payload.sessionVersion : 1;
    if (tokenVersion < currentGlobalVersion) {
      return null;
    }

    const user = getUserById(payload.userId);
    if (!user) return null;

    // Assign activeRole from the signed JWT payload
    user.activeRole = payload.activeRole || user.role;
    user.canSwitchRole = Boolean(payload.canSwitchRole || user.canSwitchRole);

    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  // Role isolation: activeRole MUST be 'admin'
  if (user.activeRole !== 'admin') {
    logSecurityEvent({
      eventType: 'PRIVILEGE_ESCALATION_ATTEMPT',
      userId: user.id,
      severity: 'CRITICAL',
      details: `Usuario ${user.username} (rol activo: ${user.activeRole}) intentó acceder a un endpoint de administración.`,
    });
    throw new Error('FORBIDDEN');
  }
  return user;
}
