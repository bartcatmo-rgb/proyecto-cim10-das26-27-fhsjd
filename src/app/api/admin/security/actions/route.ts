import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { rotateGlobalSessionVersion, exportSecurityAuditLogs, logSecurityEvent } from '@/lib/db/queries';
import { extractClientIp, summarizeUserAgent } from '@/lib/security-telemetry';

export async function POST(req: NextRequest) {
  const ip = extractClientIp(req);
  const ua = req.headers.get('user-agent');

  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: 'Acción no especificada.' }, { status: 400 });
    }

    if (action === 'REVOKE_SESSIONS') {
      const newVersion = rotateGlobalSessionVersion(admin.id, admin.username);
      return NextResponse.json({
        success: true,
        message: 'Todas las sesiones activas en el centro han sido revocadas exitosamente.',
        newSessionVersion: newVersion,
        revokedAt: new Date().toISOString(),
      });
    }

    if (action === 'EXPORT_AUDIT_LOGS') {
      const exportData = exportSecurityAuditLogs();

      logSecurityEvent({
        eventType: 'RGPD_EXPORT',
        severity: 'INFO',
        userId: admin.id,
        route: '/api/admin/security/actions',
        ipAddress: ip,
        userAgent: ua || undefined,
        details: `Exportación de logs de auditoría DPD por ${admin.username} (${exportData.count} registros, SHA-256: ${exportData.sha256Checksum.substring(0, 12)}...).`,
      });

      return NextResponse.json({
        success: true,
        ...exportData,
      });
    }

    return NextResponse.json({ error: `Acción '${action}' no reconocida.` }, { status: 400 });
  } catch (err: any) {
    if (err.message === 'FORBIDDEN') {
      logSecurityEvent({
        eventType: 'FORBIDDEN_403',
        severity: 'CRITICAL',
        route: '/api/admin/security/actions',
        ipAddress: ip,
        userAgent: ua || undefined,
        details: 'Intento no autorizado de ejecutar acciones administrativas SOC.',
      });
      return NextResponse.json(
        { error: 'Acceso denegado: se requieren permisos de administrador.' },
        { status: 403 }
      );
    }

    logSecurityEvent({
      eventType: 'UNAUTHORIZED_401',
      severity: 'WARN',
      route: '/api/admin/security/actions',
      ipAddress: ip,
      userAgent: ua || undefined,
      details: 'Petición no autenticada a /api/admin/security/actions.',
    });

    return NextResponse.json(
      { error: 'No autorizado.' },
      { status: 401 }
    );
  }
}
