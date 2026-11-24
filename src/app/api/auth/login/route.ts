import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getUserByDni, logSecurityEvent } from '@/lib/db/queries';
import { getDb } from '@/lib/db';
import { ensureCoreAccountsInDb } from '@/lib/auth/core-accounts';
import { verifyPassword } from '@/lib/auth/crypto';
import { setSessionCookie } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { extractClientIp } from '@/lib/security-telemetry';

export async function POST(req: NextRequest) {
  try {
    const ip = extractClientIp(req);
    const ua = req.headers.get('user-agent') || undefined;

    const rateCheck = checkRateLimit(`login:${ip}`, 15, 60 * 1000);
    if (!rateCheck.allowed) {
      logSecurityEvent({
        eventType: 'RATE_LIMIT_BLOCKED',
        route: '/api/auth/login',
        ipAddress: ip,
        userAgent: ua,
        severity: 'WARN',
        details: 'Exceso de intentos de autenticación. Bloqueo temporal por rate limiting.',
      });
      return NextResponse.json(
        { error: `Demasiados intentos. Por favor espera ${rateCheck.resetInSeconds} segundos.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Por favor, introduce tu usuario o DNI y la contraseña.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = String(identifier).trim();
    // Try username first, then DNI
    let user = getUserByUsername(cleanIdentifier);
    if (!user) {
      const byDni = getUserByDni(cleanIdentifier);
      if (byDni) {
        user = getUserByUsername(byDni.username);
      }
    }

    // Si no se encuentra, asegurar idempotentemente las cuentas maestras institucionales y reintentar
    if (!user) {
      try {
        ensureCoreAccountsInDb(getDb());
        user = getUserByUsername(cleanIdentifier);
        if (!user) {
          const byDni = getUserByDni(cleanIdentifier);
          if (byDni) {
            user = getUserByUsername(byDni.username);
          }
        }
      } catch (coreSeedErr) {
        console.warn('Fallback core accounts check notice:', coreSeedErr);
      }
    }

    if (!user) {
      logSecurityEvent({
        eventType: 'LOGIN_FAILED',
        route: '/api/auth/login',
        ipAddress: ip,
        userAgent: ua,
        severity: 'WARN',
        details: 'Intento de acceso con identificador no existente en el sistema.',
      });
      return NextResponse.json(
        { error: 'Credenciales incorrectas. Verifica tu usuario/DNI o contraseña.' },
        { status: 401 }
      );
    }

    let isValid = verifyPassword(password, user.passwordSalt, user.passwordHash);
    if (!isValid) {
      // Reintento defensivo: re-sincronizar cuentas institucionales por si hubo actualización reciente de credenciales
      try {
        ensureCoreAccountsInDb(getDb());
        const byName = getUserByUsername(user.username);
        let recheckUser = byName;
        if (!recheckUser && user.dniNie) {
          const byDni = getUserByDni(user.dniNie);
          if (byDni) {
            recheckUser = getUserByUsername(byDni.username);
          }
        }
        if (recheckUser && verifyPassword(password, recheckUser.passwordSalt, recheckUser.passwordHash)) {
          user = recheckUser;
          isValid = true;
        }
      } catch {
        // Ignorar fallo de reintento
      }
    }

    if (!isValid) {
      logSecurityEvent({
        eventType: 'LOGIN_FAILED',
        route: '/api/auth/login',
        ipAddress: ip,
        userAgent: ua,
        userId: user.id,
        severity: 'WARN',
        details: `Contraseña incorrecta para usuario: ${user.username}.`,
      });
      return NextResponse.json(
        { error: 'Credenciales incorrectas. Verifica tu usuario/DNI o contraseña.' },
        { status: 401 }
      );
    }

    // Set cookie
    await setSessionCookie(user);

    logSecurityEvent({
      eventType: 'LOGIN_SUCCESS',
      route: '/api/auth/login',
      ipAddress: ip,
      userAgent: ua,
      userId: user.id,
      severity: 'INFO',
      details: `Acceso concedido a ${user.username} (rol base: ${user.role}, doble rol: ${user.canSwitchRole ? 'sí' : 'no'}).`,
    });

    return NextResponse.json({
      success: true,
      mustChangePassword: Boolean(user.mustChangePassword),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        activeRole: user.role,
        canSwitchRole: Boolean(user.canSwitchRole),
        mustChangePassword: Boolean(user.mustChangePassword),
        academicGroup: user.academicGroup,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Error interno en el servidor de autenticación.' },
      { status: 500 }
    );
  }
}
