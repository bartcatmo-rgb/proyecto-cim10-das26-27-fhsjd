import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getActiveExam, setActiveExam, deactivateExam } from '@/lib/db/queries';
import { ServiceArea } from '@/types';

export async function GET() {
  try {
    await requireAdmin();
    const activeExam = getActiveExam();
    return NextResponse.json({
      activeExam,
      serverTime: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Acceso denegado. Se requiere rol docente o administrador.' }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { title, discipline, level, questionCount, timeLimitMinutes } = body;

    if (!title || !discipline) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios (title, discipline).' }, { status: 400 });
    }

    const exam = setActiveExam({
      title: String(title).trim(),
      discipline: discipline as ServiceArea,
      level: Number(level) || 1,
      questionCount: Math.max(1, Math.min(50, Number(questionCount) || 10)),
      timeLimitMinutes: Math.max(0, Math.min(180, Number(timeLimitMinutes) || 0)),
    });

    return NextResponse.json({
      success: true,
      message: 'Examen del Día configurado y activado correctamente.',
      exam,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: `Error al configurar examen: ${err.message}` }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await requireAdmin();
    deactivateExam();
    return NextResponse.json({
      success: true,
      message: 'Examen activo desactivado correctamente.',
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
  }
}
