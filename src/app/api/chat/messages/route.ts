import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getChatMessages, postChatMessage, logSecurityEvent } from '@/lib/db/queries';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { extractClientIp } from '@/lib/security-telemetry';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = req.nextUrl;
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json({ error: 'Parámetro channelId requerido.' }, { status: 400 });
    }

    const messages = getChatMessages(channelId, 100, user.activeRole === 'admin');
    return NextResponse.json({ success: true, messages });
  } catch {
    return NextResponse.json(
      { error: 'No autorizado. Se requiere sesión activa en AulaCIM-10.' },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  const ip = extractClientIp(req);
  try {
    const user = await requireAuth();

    // Anti-flood rate limiting: max 5 messages per 10 seconds per user
    const rateCheck = checkRateLimit(`chat:${user.id}`, 5, 10 * 1000);
    if (!rateCheck.allowed) {
      logSecurityEvent({
        eventType: 'RATE_LIMIT_BLOCKED',
        severity: 'WARN',
        userId: user.id,
        route: '/api/chat/messages',
        ipAddress: ip,
        details: `Usuario ${user.username} bloqueado temporalmente por exceso de mensajes de chat (anti-flood).`,
      });
      return NextResponse.json(
        { error: `Envío demasiado rápido. Espera ${rateCheck.resetInSeconds} segundos antes de enviar otro mensaje.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { channelId, content } = body;

    if (!channelId || !content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'channelId y contenido del mensaje son obligatorios.' },
        { status: 400 }
      );
    }

    // Strict Anti-IDOR: Derives sender from authenticated server session
    const newMessage = postChatMessage({
      channelId: String(channelId).trim(),
      userId: user.id,
      userName: user.fullName,
      userRole: (user.activeRole === 'admin' ? 'admin' : user.role) as 'student' | 'admin',
      content: content.trim(),
    });

    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere sesión activa en AulaCIM-10.' },
        { status: 401 }
      );
    }

    if (err.message && err.message.includes('Solo los profesores')) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: err.message || 'Error al publicar el mensaje en el canal.' },
      { status: 400 }
    );
  }
}
