import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getAttemptById, logSecurityEvent } from '@/lib/db/queries';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const { id } = await params;
    const attemptData = getAttemptById(id);

    if (!attemptData) {
      return NextResponse.json({ error: 'Intento no encontrado.' }, { status: 404 });
    }

    // Strict IDOR Protection: Only admin active role or the student who performed the attempt can see it
    if (user.activeRole !== 'admin' && attemptData.attempt.userId !== user.id) {
      logSecurityEvent({
        eventType: 'IDOR_VIOLATION_ATTEMPT',
        userId: user.id,
        severity: 'WARNING',
        details: `Usuario ${user.username} intentó acceder indebidamente al intento ${id} perteneciente a otro usuario.`,
      });
      return NextResponse.json({ error: 'Acceso no autorizado a este intento.' }, { status: 403 });
    }

    return NextResponse.json({ success: true, ...attemptData });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error al recuperar intento.' }, { status: 500 });
  }
}
