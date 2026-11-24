import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { moderateChatMessage, logSecurityEvent } from '@/lib/db/queries';
import { extractClientIp } from '@/lib/security-telemetry';

export async function POST(req: NextRequest) {
  const ip = extractClientIp(req);
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { messageId, action } = body;

    if (!messageId || !action || !['hide', 'unhide', 'pin', 'unpin'].includes(action)) {
      return NextResponse.json(
        { error: 'Parámetros inválidos: messageId y action ("hide" | "unhide" | "pin" | "unpin") requeridos.' },
        { status: 400 }
      );
    }

    const success = moderateChatMessage(messageId, action, admin.id);
    if (!success) {
      return NextResponse.json({ error: 'Mensaje no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Acción de moderación '${action}' aplicada correctamente al mensaje ${messageId}.`,
    });
  } catch (err: any) {
    if (err.message === 'FORBIDDEN') {
      logSecurityEvent({
        eventType: 'FORBIDDEN_403',
        severity: 'CRITICAL',
        route: '/api/chat/moderate',
        ipAddress: ip,
        details: 'Intento no autorizado de moderar mensajes de chat sin privilegios de administrador.',
      });
      return NextResponse.json(
        { error: 'Acceso denegado: se requieren permisos docentes de moderación.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'No autorizado. Se requiere inicio de sesión administrativo.' },
      { status: 401 }
    );
  }
}
