import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { updateUserProfile, logSecurityEvent, getUserById } from '@/lib/db/queries';

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { fullName, email, phone, academicGroup } = body;

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Nombre completo y correo electrónico son obligatorios.' }, { status: 400 });
    }

    updateUserProfile(user.id, {
      fullName,
      email,
      phone,
      academicGroup,
    });

    logSecurityEvent({
      eventType: 'PROFILE_UPDATED',
      userId: user.id,
      severity: 'INFO',
      details: `Usuario ${user.username} actualizó sus datos personales de perfil.`,
    });

    const updatedUser = getUserById(user.id);

    return NextResponse.json({
      success: true,
      message: 'Ficha personal actualizada correctamente.',
      user: updatedUser,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error al actualizar el perfil.' }, { status: 500 });
  }
}
