import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getAllTopicsAdmin } from '@/lib/db/topics';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const topics = getAllTopicsAdmin();
    return NextResponse.json({ topics });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado: se requieren privilegios docentes' }, { status: 403 });
    }
    console.error('Error en GET /api/admin/topics:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
