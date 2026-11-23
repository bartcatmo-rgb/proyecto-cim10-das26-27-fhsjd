import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { saveKahootResult, getKahootLeaderboard } from '@/lib/db/queries';
import { ServiceArea } from '@/types';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { roundId, discipline, totalQuestions, correctCount, totalScore, streakMax, participants } = body;

    const count = Number(totalQuestions);
    if (isNaN(count) || count < 10 || count > 20) {
      return NextResponse.json({ error: 'La ronda debe tener entre 10 y 20 preguntas.' }, { status: 400 });
    }

    // Determine ranking position among provided participants or global leaderboard
    let rank = 1;
    if (Array.isArray(participants)) {
      const sorted = [...participants].sort((a, b) => b.score - a.score);
      const userIndex = sorted.findIndex(p => p.id === user.id || p.isCurrentUser);
      if (userIndex !== -1) {
        rank = userIndex + 1;
      }
    }

    const savedResult = saveKahootResult({
      roundId: String(roundId || `rnd_${Date.now()}`),
      userId: user.id,
      userName: user.fullName || user.username,
      academicGroup: user.academicGroup,
      discipline: (discipline as ServiceArea) || 'simulacro_integral',
      totalQuestions: count,
      correctCount: Number(correctCount) || 0,
      totalScore: Number(totalScore) || 0,
      rankPosition: rank,
      streakMax: Number(streakMax) || 0,
    });

    const leaderboard = getKahootLeaderboard(undefined, 10);

    return NextResponse.json({
      success: true,
      result: savedResult,
      leaderboard,
    });
  } catch (err: any) {
    return NextResponse.json({ error: `Error al guardar ronda: ${err.message}` }, { status: 500 });
  }
}
