import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { searchCim10Codes } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'No autorizado. Se requiere inicio de sesión en AulaCIM-10.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const chapter = searchParams.get('chapter') || '';
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);

  const codes = searchCim10Codes(q, chapter, limit);
  return NextResponse.json({ codes, total: codes.length });
}
