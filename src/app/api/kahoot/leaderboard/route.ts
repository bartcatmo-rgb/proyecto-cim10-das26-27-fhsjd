import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getKahootLeaderboard } from '@/lib/db/queries';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'No autorizado. Se requiere inicio de sesión en AulaCIM-10.' },
      { status: 401 }
    );
  }

  const leaderboard = getKahootLeaderboard(undefined, 20);
  return NextResponse.json({
    leaderboard,
    podium: leaderboard.slice(0, 3),
  });
}
