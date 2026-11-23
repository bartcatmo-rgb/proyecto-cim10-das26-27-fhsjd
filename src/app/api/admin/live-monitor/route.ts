import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getLiveMonitorSummary } from '@/lib/db/queries';

export async function GET() {
  try {
    await requireAdmin();
    const summary = getLiveMonitorSummary();

    return NextResponse.json({
      ...summary,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Acceso denegado. Se requiere rol de profesor.' }, { status: 403 });
  }
}
