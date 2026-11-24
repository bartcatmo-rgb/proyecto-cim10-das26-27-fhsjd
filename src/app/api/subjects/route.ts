import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getAllCourseSubjects } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const subjects = getAllCourseSubjects(false);
    return NextResponse.json({ success: true, subjects });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error al consultar materias' }, { status: 500 });
  }
}
