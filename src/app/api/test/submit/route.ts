import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { saveTestAttemptTx, getManagedTestByIdOrCode, logSecurityEvent } from '@/lib/db/queries';
import { ServiceArea } from '@/types';
import { ALL_SERVICE_AREAS } from '@/lib/cim10/disciplines';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión para guardar tus resultados.' }, { status: 401 });
    }

    const body = await req.json();
    const { discipline, level, timeSpentSeconds, answers, courseId, testId } = body;

    if (!discipline || !ALL_SERVICE_AREAS.includes(discipline as ServiceArea)) {
      return NextResponse.json({ error: 'Ámbito asistencial / disciplina no válida.' }, { status: 400 });
    }

    const parsedLevel = Number(level);
    if (isNaN(parsedLevel) || parsedLevel < 1 || parsedLevel > 5) {
      return NextResponse.json({ error: 'Nivel no válido (debe ser del 1 al 5).' }, { status: 400 });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Debes responder al menos a una pregunta.' }, { status: 400 });
    }

    // Server-side check if submitting to a managed test
    if (testId) {
      const managedTest = getManagedTestByIdOrCode(testId);
      if (managedTest) {
        if (managedTest.status === 'prepared' && user.activeRole !== 'admin') {
          logSecurityEvent({
            eventType: 'EXAM_PREMATURE_SUBMIT',
            userId: user.id,
            severity: 'WARNING',
            details: `Alumno ${user.username} intentó entregar examen ${managedTest.code} antes de su activación.`,
          });
          return NextResponse.json({ error: 'Esta prueba aún no ha sido activada oficialmente.' }, { status: 400 });
        }
      }
    }

    const result = saveTestAttemptTx({
      userId: user.id,
      discipline: discipline as ServiceArea,
      level: parsedLevel,
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      answers,
      courseId: courseId ? String(courseId) : user.courseId || 'DAS-26-27',
      testId: testId ? String(testId) : undefined,
    });

    logSecurityEvent({
      eventType: 'EXAM_SUBMITTED',
      userId: user.id,
      severity: 'INFO',
      details: `Intento completado por ${user.username}: Nota ${result.score}%, aciertos ${result.correctCount}/${result.totalQuestions}.`,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error al procesar el intento de test.' }, { status: 500 });
  }
}
