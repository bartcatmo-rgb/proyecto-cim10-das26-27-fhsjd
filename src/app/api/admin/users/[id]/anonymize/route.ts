import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { anonymizeUser, logSecurityEvent, getUserById } from '@/lib/db/queries';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin();
    const { id } = await params;

    const targetUser = getUserById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (targetUser.role === 'admin' || targetUser.username.toLowerCase() === 'admin') {
      return NextResponse.json({ error: 'No es posible anonimizar una cuenta con privilegios administrativos.' }, { status: 400 });
    }

    const success = anonymizeUser(id);
    if (!success) {
      return NextResponse.json({ error: 'No se pudo completar la anonimización' }, { status: 500 });
    }

    logSecurityEvent({
      eventType: 'RGPD_ANONYMIZE',
      route: `/api/admin/users/${id}/anonymize`,
      userId: adminUser.id,
      severity: 'CRITICAL',
      details: `Supresión y anonimización irreversible ejecutada para el usuario ${id} por el docente ${adminUser.id}.`
    });

    return NextResponse.json({
      success: true,
      message: 'Expediente del alumno anonimizado irreversiblemente conforme al Art. 17 RGPD.',
      userId: id
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado: se requieren privilegios docentes' }, { status: 403 });
    }
    console.error('Error en POST /api/admin/users/[id]/anonymize:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
