import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getReverseCodingCases } from '@/lib/db/queries';
import { ServiceArea } from '@/types';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const discipline = (searchParams.get('discipline') as ServiceArea) || undefined;
  const limit = Math.max(1, Math.min(20, Number(searchParams.get('limit')) || 10));

  const cases = getReverseCodingCases(discipline, limit);

  return NextResponse.json({
    cases,
    count: cases.length,
  });
}
