import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getSecurityAuditLogs } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const logs = getSecurityAuditLogs(100);
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado: se requieren permisos de administrador.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
}
