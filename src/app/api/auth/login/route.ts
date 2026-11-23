import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getUserByDni, logSecurityEvent } from '@/lib/db/queries';
import { verifyPassword } from '@/lib/auth/crypto';
import { setSessionCookie } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/auth/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`login:${ip}`, 15, 60 * 1000);
    if (!rateCheck.allowed) {
      logSecurityEvent({
        eventType: 'RATE_LIMIT_TRIGGERED',
        ipAddress: ip,
        severity: 'WARNING',
        details: `Exceso de intentos de autenticación desde IP ${ip}.`,
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

    if (!user) {
      logSecurityEvent({
        eventType: 'AUTH_FAILED',
        ipAddress: ip,
        severity: 'WARNING',
        details: `Intento de acceso con identificador inexistente: ${cleanIdentifier.substring(0, 20)}.`,
      });
      return NextResponse.json(
        { error: 'Credenciales incorrectas. Verifica tu usuario/DNI o contraseña.' },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordSalt, user.passwordHash);
    if (!isValid) {
      logSecurityEvent({
        eventType: 'AUTH_FAILED',
        ipAddress: ip,
        userId: user.id,
        severity: 'WARNING',
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
      eventType: 'AUTH_SUCCESS',
      ipAddress: ip,
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
