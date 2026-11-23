import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getPublishedTopicsWithProgress } from '@/lib/db/topics';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const topics = getPublishedTopicsWithProgress(session.id);
    return NextResponse.json({ topics });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    console.error('Error en GET /api/topics:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
