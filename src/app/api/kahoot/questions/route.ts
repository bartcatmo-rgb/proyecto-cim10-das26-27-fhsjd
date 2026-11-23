import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getKahootQuestions } from '@/lib/db/queries';
import { ServiceArea } from '@/types';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const discipline = (searchParams.get('discipline') as ServiceArea) || undefined;
  
  // Strictly enforce 10 to 20 questions
  const requestedCount = parseInt(searchParams.get('count') || '10', 10);
  if (isNaN(requestedCount) || requestedCount < 10 || requestedCount > 20) {
    return NextResponse.json({
      error: 'El número de preguntas de la ronda Kahoot debe estar estrictamente comprendido entre 10 y 20.',
    }, { status: 400 });
  }

  const questions = getKahootQuestions(discipline, requestedCount);

  return NextResponse.json({
    questions,
    count: questions.length,
    roundConfig: {
      questionCount: requestedCount,
      timePerQuestionSeconds: 25,
      discipline: discipline || 'simulacro_integral',
    },
  });
}
