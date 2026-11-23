import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { generateCaseWithLLMOrFallback } from '@/lib/cim10/case-generator';
import { insertCustomQuestion, logSecurityEvent } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { clinicalDescription, discipline, level, objectiveCode, normativeCriteria, academicYear, batchId } = body;

    if (!clinicalDescription || typeof clinicalDescription !== 'string' || clinicalDescription.trim().length < 10) {
      return NextResponse.json({ error: 'Debes proporcionar una descripción clínica de al menos 10 caracteres.' }, { status: 400 });
    }

    const generatedCase = await generateCaseWithLLMOrFallback({
      clinicalDescription,
      discipline: discipline || 'urgencias',
      level: Number(level) || 1,
      objectiveCode: objectiveCode ? String(objectiveCode).trim() : undefined,
      normativeCriteria: normativeCriteria ? String(normativeCriteria).trim() : undefined,
      academicYear: academicYear || 'DAS-26-27',
      batchId: batchId || 'profesor_manual',
    });

    const savedQuestion = insertCustomQuestion(generatedCase);

    logSecurityEvent({
      eventType: 'CUSTOM_CASE_CREATED',
      userId: admin.id,
      severity: 'INFO',
      details: `Docente ${admin.username} creó caso personalizado: '${savedQuestion.caseTitle}' (${savedQuestion.discipline}, Nivel ${savedQuestion.level}).`,
    });

    return NextResponse.json({
      success: true,
      message: 'Caso MEAP estructurado y añadido al repertorio con éxito.',
      question: savedQuestion,
      engineUsed: generatedCase.engineUsed,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso no autorizado: requiere rol docente.' }, { status: 403 });
    }
    return NextResponse.json({ error: `Error al generar el caso clínico: ${err.message}` }, { status: 500 });
  }
}
