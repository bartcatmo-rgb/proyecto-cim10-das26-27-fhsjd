import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getSecurityOverview, logSecurityEvent } from '@/lib/db/queries';
import { extractClientIp, hashIp, summarizeUserAgent } from '@/lib/security-telemetry';

export async function GET(req: NextRequest) {
  const ip = extractClientIp(req);
  const ua = req.headers.get('user-agent');

  try {
    const admin = await requireAdmin();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const severity = searchParams.get('severity') || undefined;
    const eventType = searchParams.get('eventType') || undefined;
    const search = searchParams.get('search') || undefined;

    const overview = getSecurityOverview({
      page,
      limit,
      severity,
      eventType,
      search,
    });

    return NextResponse.json({
      success: true,
      ...overview,
    });
  } catch (err: any) {
    if (err.message === 'FORBIDDEN') {
      logSecurityEvent({
        eventType: 'FORBIDDEN_403',
        severity: 'CRITICAL',
        route: '/api/admin/security/overview',
        ipAddress: ip,
        userAgent: ua || undefined,
        details: 'Intento de acceso a métricas SOC por usuario sin privilegios de administrador.',
      });
      return NextResponse.json(
        { error: 'Acceso denegado: se requieren privilegios de Administrador SOC.' },
        { status: 403 }
      );
    }

    logSecurityEvent({
      eventType: 'UNAUTHORIZED_401',
      severity: 'WARN',
      route: '/api/admin/security/overview',
      ipAddress: ip,
      userAgent: ua || undefined,
      details: 'Petición no autenticada a /api/admin/security/overview.',
    });

    return NextResponse.json(
      { error: 'No autorizado. Se requiere inicio de sesión administrativo.' },
      { status: 401 }
    );
  }
}
