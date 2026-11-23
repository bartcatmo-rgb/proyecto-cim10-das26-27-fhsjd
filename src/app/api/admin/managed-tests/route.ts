import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getCurrentUser } from '@/lib/auth/session';
import { getManagedTests, createManagedTest, updateManagedTestStatus, getManagedTestByIdOrCode } from '@/lib/db/queries';
import { TestType, TestStatus, ServiceArea } from '@/types';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId') || undefined;
    const status = (searchParams.get('status') as TestStatus) || undefined;

    const tests = getManagedTests(courseId, status);
    return NextResponse.json({ tests });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error al consultar pruebas programadas.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const {
      title,
      testType,
      discipline,
      level,
      questionCount,
      timeLimitMinutes,
      status,
      courseId,
      code,
      scheduledAt,
    } = body;

    if (!title || !testType) {
      return NextResponse.json({ error: 'El título y el tipo de prueba son obligatorios.' }, { status: 400 });
    }

    let parsedQuestionCount = Number(questionCount) || 10;
    if (testType === 'kahoot_round') {
      if (parsedQuestionCount < 10) parsedQuestionCount = 10;
      if (parsedQuestionCount > 20) parsedQuestionCount = 20;
    }

    const test = createManagedTest({
      title: String(title).trim(),
      testType: testType as TestType,
      discipline: (discipline as ServiceArea) || 'simulacro_integral',
      level: Number(level) || 2,
      questionCount: parsedQuestionCount,
      timeLimitMinutes: Number(timeLimitMinutes) || 0,
      status: (status as TestStatus) || 'prepared',
      courseId: courseId ? String(courseId).trim() : 'DAS-26-27',
      code: code ? String(code).trim().toUpperCase() : undefined,
      scheduledAt: scheduledAt ? String(scheduledAt) : undefined,
      createdBy: admin.fullName || admin.username,
    });

    return NextResponse.json({ success: true, test }, { status: 201 });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: err.message || 'Error al programar prueba.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { testId, status } = body;

    if (!testId || !status) {
      return NextResponse.json({ error: 'Se requiere testId y nuevo status.' }, { status: 400 });
    }

    const validStatuses: TestStatus[] = ['prepared', 'live', 'scheduled', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Estado inválido: ${status}` }, { status: 400 });
    }

    const success = updateManagedTestStatus(testId, status);
    if (!success) {
      return NextResponse.json({ error: 'Prueba no encontrada o no se pudo actualizar.' }, { status: 404 });
    }

    const updated = getManagedTestByIdOrCode(testId);
    return NextResponse.json({ success: true, test: updated });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error al cambiar estado de la prueba.' }, { status: 500 });
  }
}
