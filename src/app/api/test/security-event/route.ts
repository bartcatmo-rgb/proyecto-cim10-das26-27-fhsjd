import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { logSecurityEvent } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    const body = await req.json();
    const { eventType, details, examCode } = body;

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    logSecurityEvent({
      eventType: eventType || 'CLIENT_EXAM_ANOMALY',
      ipAddress: ip,
      userId: user?.id,
      severity: 'WARNING',
      details: `[Examen ${examCode || 'N/A'}] Alumno: ${user?.username || 'Anónimo'} - ${details || 'Evento anómalo de navegador.'}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error al registrar evento.' }, { status: 500 });
  }
}
