import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getStudentLearningMetrics } from '@/lib/db/topics';

export async function GET(req: NextRequest) {
  try {
    // Strictly Anti-IDOR: session userId is taken directly from the server cookie
    const session = await requireAuth();

    const url = new URL(req.url);
    const subjectId = url.searchParams.get('subjectId') || undefined;

    const metrics = getStudentLearningMetrics(session.id, subjectId);

    return NextResponse.json({
      success: true,
      metrics
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    console.error('Error en GET /api/student/learning-chart:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
