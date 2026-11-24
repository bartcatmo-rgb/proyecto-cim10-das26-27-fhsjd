import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { exportUserData, logSecurityEvent } from '@/lib/db/queries';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin();
    const { id } = await params;

    const data = exportUserData(id);
    if (!data) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    logSecurityEvent({
      eventType: 'RGPD_EXPORT',
      route: `/api/admin/users/${id}/export`,
      userId: adminUser.id,
      severity: 'INFO',
      details: `Exportación de datos personales efectuada para el expediente ${id} por el docente ${adminUser.id}.`
    });

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="portabilidad-rgpd-${id}.json"`
      }
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado: se requieren privilegios docentes' }, { status: 403 });
    }
    console.error('Error en GET /api/admin/users/[id]/export:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
