import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { hashPassword, verifyPassword } from '@/lib/auth/crypto';
import { getUserByUsername, updateUserPassword, logSecurityEvent } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Por favor, introduce la contraseña actual y la nueva contraseña.' },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 8) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener un mínimo de 8 caracteres.' },
        { status: 400 }
      );
    }

    const fullUser = getUserByUsername(currentUser.username);
    if (!fullUser) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    const isValid = verifyPassword(currentPassword, fullUser.passwordSalt, fullUser.passwordHash);
    if (!isValid) {
      logSecurityEvent({
        eventType: 'PASSWORD_CHANGE_FAILED',
        userId: currentUser.id,
        severity: 'WARNING',
        details: `Intento fallido de cambio de contraseña para ${currentUser.username}: contraseña actual incorrecta.`,
      });
      return NextResponse.json({ error: 'La contraseña actual no es correcta.' }, { status: 400 });
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'La nueva contraseña no puede ser idéntica a la contraseña temporal o actual.' },
        { status: 400 }
      );
    }

    const { hash, salt } = hashPassword(newPassword);
    updateUserPassword(currentUser.id, hash, salt);

    logSecurityEvent({
      eventType: 'PASSWORD_CHANGED',
      userId: currentUser.id,
      severity: 'INFO',
      details: `Usuario ${currentUser.username} actualizó su contraseña con éxito. Flag must_change_password desactivado.`,
    });

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada y robustecida con éxito.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error al actualizar la contraseña.' }, { status: 500 });
  }
}
