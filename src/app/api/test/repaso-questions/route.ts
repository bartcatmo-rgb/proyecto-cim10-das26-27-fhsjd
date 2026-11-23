import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getFailedQuestionsForStudent } from '@/lib/db/queries';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const failedQuestions = getFailedQuestionsForStudent(user.id, 20);

  return NextResponse.json({
    questions: failedQuestions,
    count: failedQuestions.length,
  });
}
