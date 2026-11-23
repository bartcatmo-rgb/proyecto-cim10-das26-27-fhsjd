import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getTopicBySlug, recordTopicTestAttempt } from '@/lib/db/topics';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAuth();
    const { slug } = await params;

    const data = getTopicBySlug(slug, session.id);
    if (!data) {
      return NextResponse.json({ error: 'Temario no encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const { mode = 'exam', score, totalQuestions, correctCount, details } = body;

    if (typeof score !== 'number' || typeof totalQuestions !== 'number' || typeof correctCount !== 'number') {
      return NextResponse.json({ error: 'Parámetros numéricos de evaluación incompletos' }, { status: 400 });
    }

    const attemptId = recordTopicTestAttempt(
      session.id,
      data.topic.id,
      mode,
      score,
      totalQuestions,
      correctCount,
      details ? JSON.stringify(details) : undefined
    );

    return NextResponse.json({ success: true, attemptId, score, passed: score >= 5.0 });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    console.error('Error en POST /api/topics/[slug]/attempt:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
