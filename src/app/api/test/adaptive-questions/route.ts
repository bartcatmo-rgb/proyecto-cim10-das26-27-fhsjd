import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { generateAdaptiveQuestions } from '@/lib/adaptive';
import { ServiceArea } from '@/types';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const discipline = (searchParams.get('discipline') as ServiceArea) || undefined;
  const count = Math.max(5, Math.min(30, Number(searchParams.get('count')) || 10));

  const { questions, profile } = generateAdaptiveQuestions(user.id, discipline, count);

  return NextResponse.json({
    questions,
    profile,
    count: questions.length,
  });
}
