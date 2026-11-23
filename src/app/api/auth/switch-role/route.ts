import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, setSessionCookie } from '@/lib/auth/session';
import { logSecurityEvent } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    if (!user.canSwitchRole) {
      logSecurityEvent({
        eventType: 'UNAUTHORIZED_ROLE_SWITCH',
        userId: user.id,
        severity: 'WARNING',
        details: `Usuario ${user.username} intentó alternar rol sin autorización.`,
      });
      return NextResponse.json({ error: 'Tu cuenta no tiene concedido el privilegio de doble rol.' }, { status: 403 });
    }

    const body = await req.json();
    const { targetRole } = body;
    if (targetRole !== 'student' && targetRole !== 'admin') {
      return NextResponse.json({ error: 'Rol destino no válido.' }, { status: 400 });
    }

    await setSessionCookie(user, targetRole);
    user.activeRole = targetRole;

    logSecurityEvent({
      eventType: 'ROLE_SWITCHED',
      userId: user.id,
      severity: 'INFO',
      details: `Usuario ${user.username} cambió su rol activo a: ${targetRole}.`,
    });

    return NextResponse.json({
      success: true,
      activeRole: targetRole,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        activeRole: targetRole,
        canSwitchRole: true,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error al conmutar de rol.' }, { status: 500 });
  }
}
