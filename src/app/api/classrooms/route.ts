import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getAllClassrooms } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const url = new URL(req.url);
    const subjectId = url.searchParams.get('subjectId') || undefined;

    const classrooms = getAllClassrooms(subjectId, false);
    return NextResponse.json({ success: true, classrooms });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error al consultar aulas' }, { status: 500 });
  }
}
