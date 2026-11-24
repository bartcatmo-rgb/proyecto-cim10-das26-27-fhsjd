import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getSecurityAuditLogs, logSecurityEvent } from '@/lib/db/queries';
import { extractClientIp } from '@/lib/security-telemetry';

export async function GET(req: NextRequest) {
  const ip = extractClientIp(req);
  try {
    await requireAdmin();
    const logs = getSecurityAuditLogs(100);
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    if (err.message === 'FORBIDDEN') {
      logSecurityEvent({
        eventType: 'FORBIDDEN_403',
        severity: 'CRITICAL',
        route: '/api/admin/security-logs',
        ipAddress: ip,
        details: 'Intento de acceso a registros de seguridad sin rol administrativo.',
      });
      return NextResponse.json({ error: 'Acceso denegado: se requieren permisos de administrador.' }, { status: 403 });
    }
    logSecurityEvent({
      eventType: 'UNAUTHORIZED_401',
      severity: 'WARN',
      route: '/api/admin/security-logs',
      ipAddress: ip,
      details: 'Petición no autenticada a /api/admin/security-logs.',
    });
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
}
