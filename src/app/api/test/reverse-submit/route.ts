import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { saveTestAttemptTx, getReverseCodingCaseById } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { discipline, timeSpentSeconds, answers } = body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'No se recibieron respuestas para evaluar.' }, { status: 400 });
    }

    let correctCount = 0;
    const evaluatedDetails: any[] = [];

    for (const ans of answers) {
      const revCase = getReverseCodingCaseById(ans.caseId);
      if (!revCase) continue;

      const isCorrect = revCase.correctOptionId === ans.selectedOptionId;
      if (isCorrect) correctCount++;

      evaluatedDetails.push({
        questionId: revCase.id,
        selectedOptionId: ans.selectedOptionId || '',
        isCorrect,
        questionSnapshot: {
          id: revCase.id,
          discipline: revCase.discipline,
          level: revCase.level,
          caseTitle: revCase.caseTitle,
          clinicalScenario: revCase.clinicalScenario,
          serviceContext: revCase.serviceContext,
          options: revCase.options,
          correctOptionId: revCase.correctOptionId,
          reasonedResolution: {
            clinicalAnalysis: `${revCase.reasonedResolution.flawDetected} - ${revCase.reasonedResolution.clinicalAnalysis}`,
            cim10Path: revCase.reasonedResolution.cim10Path,
            ruleCheck: revCase.reasonedResolution.ruleCheck,
            distractorExplanations: revCase.reasonedResolution.distractorExplanations,
          },
          errorCategory: revCase.auditFlawType === 'lateralidad_incorrecta' || revCase.auditFlawType === 'septimo_caracter_erroneo'
            ? 'especificidad_lateralidad'
            : revCase.auditFlawType === 'excluye1_ignorado'
            ? 'normativa_excluye'
            : revCase.auditFlawType === 'diagnostico_principal_mal_asignado'
            ? 'jerarquia_diagnostica'
            : 'codigos_combinados',
        },
      });
    }

    const totalCases = evaluatedDetails.length || answers.length;
    const score = totalCases > 0 ? Math.round((correctCount / totalCases) * 100) : 0;
    const passed = score >= 80;

    const savedAttempt = saveTestAttemptTx({
      userId: user.id,
      discipline: discipline || 'simulacro_integral',
      level: 3, // Audit level
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      answers: answers.map((a: any) => ({
        questionId: a.caseId,
        selectedOptionId: a.selectedOptionId || '',
      })),
    });

    return NextResponse.json({
      success: true,
      result: {
        attemptId: savedAttempt.attemptId,
        score: savedAttempt.score,
        passed: savedAttempt.passed,
        correctCount: savedAttempt.correctCount,
        totalQuestions: savedAttempt.totalQuestions,
        details: evaluatedDetails,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: `Error al procesar auditoría: ${error.message}` }, { status: 500 });
  }
}
