import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { upsertLiveSession } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { examId, currentQuestionIndex, totalQuestions, correctCount, status } = body;

    if (!examId) {
      return NextResponse.json({ ok: false, message: 'No examId provided' });
    }

    upsertLiveSession({
      examId: String(examId),
      userId: user.id,
      userName: user.fullName || user.username,
      currentQuestionIndex: Number(currentQuestionIndex) || 0,
      totalQuestions: Number(totalQuestions) || 10,
      correctCount: Number(correctCount) || 0,
      status: status === 'submitted' ? 'submitted' : 'in_progress',
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
