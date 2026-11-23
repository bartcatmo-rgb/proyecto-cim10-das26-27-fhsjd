import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import {
  getManagedTestByIdOrCode,
  getQuestionsByDisciplineAndLevel,
  getReverseCodingCases,
  getKahootQuestions,
  logSecurityEvent,
} from '@/lib/db/queries';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión para acceder a la prueba.' }, { status: 401 });
    }

    const { code } = await params;
    const test = getManagedTestByIdOrCode(code);

    if (!test) {
      return NextResponse.json({ error: 'Prueba no encontrada con el código proporcionado.' }, { status: 404 });
    }

    // Role check: Only admin can see non-live tests (preview)
    if (user.activeRole !== 'admin' && test.status !== 'live') {
      logSecurityEvent({
        eventType: 'EXAM_ACCESS_DENIED',
        userId: user.id,
        severity: 'INFO',
        details: `Alumno ${user.username} intentó acceder a prueba ${test.code} con estado '${test.status}'.`,
      });
      return NextResponse.json({
        error: test.status === 'closed'
          ? 'Esta prueba ya ha finalizado y se encuentra cerrada.'
          : 'Esta prueba aún no ha sido activada en directo por el docente.',
      }, { status: 400 });
    }

    // Load appropriate questions depending on testType
    let questions: any[] = [];
    if (test.testType === 'reverse_coding') {
      questions = getReverseCodingCases(test.discipline, test.questionCount || 10);
    } else if (test.testType === 'kahoot_round') {
      questions = getKahootQuestions(test.discipline, test.questionCount || 10);
    } else {
      // standard_meap or adaptive_ai or review
      questions = getQuestionsByDisciplineAndLevel(test.discipline, test.level, test.questionCount || 10);
    }

    // Strict Anti-Cheat: Strip correct answers and explanations before exam submission for non-admin active role
    const sanitizedQuestions = questions.map((q) => {
      if (user.activeRole === 'admin') return q;
      if (test.testType === 'reverse_coding') {
        const { correctOptionId, flawDetected, clinicalAnalysis, cim10Path, ruleCheck, distractorExplanations, ...rest } = q;
        return rest;
      }
      const { correctOptionId, reasonedResolution, ...rest } = q;
      return rest;
    });

    logSecurityEvent({
      eventType: 'EXAM_STARTED',
      userId: user.id,
      severity: 'INFO',
      details: `Alumno ${user.username} inició prueba ${test.code} (${test.testType}) con ${sanitizedQuestions.length} preguntas sanitizadas.`,
    });

    return NextResponse.json({
      success: true,
      test,
      questions: sanitizedQuestions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error al cargar la prueba convocada.' }, { status: 500 });
  }
}
