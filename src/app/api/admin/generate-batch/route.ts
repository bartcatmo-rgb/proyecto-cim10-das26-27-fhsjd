import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getDb } from '@/lib/db';
import { insertCustomQuestion, logSecurityEvent, createManagedTest } from '@/lib/db/queries';
import { generateCaseWithLLMOrFallback } from '@/lib/cim10/case-generator';
import { ALL_SERVICE_AREAS } from '@/lib/cim10/disciplines';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { academicYear, batchName, count, discipline, createManagedExam } = body;

    const safeYear = academicYear || 'DAS-26-27';
    const safeBatch = (batchName || `Lote_${Date.now().toString(36).toUpperCase()}`).trim().replace(/\s+/g, '_');
    const safeCount = Math.max(5, Math.min(30, Number(count) || 10));

    const selectedDiscipline = discipline && discipline !== 'ALL' ? discipline : 'simulacro_integral';

    const SAMPLE_CLINICAL_PROMPTS = [
      'Paciente de 72 años con insuficiencia cardíaca descompensada y fibrilación auricular.',
      'Varón de 45 años ingresado por pancreatitis aguda de origen litiásico.',
      'Mujer de 28 años que consulta por crisis asmática moderada persistente.',
      'Paciente de 81 años con fractura pertrocantérea de fémur derecho tras caída accidental.',
      'Lactante de 8 meses con bronquiolitis aguda por virus respiratorio sincitial.',
      'Varón de 54 años con apendicitis aguda gangrenosa con peritonitis localizada.',
      'Mujer de 63 años con cólico nefrítico litiásico complicado con urosepsis por E. coli.',
      'Paciente de 39 años con neumonía adquirida en la comunidad por neumococo en lóbulo inferior derecho.',
      'Varón de 67 años con accidente cerebrovascular isquémico de arteria cerebral media izquierda.',
      'Mujer de 50 años con hemorragia digestiva alta secundaria a úlcera gástrica sangrante.',
    ];

    const createdQuestions: any[] = [];

    for (let i = 0; i < safeCount; i++) {
      const prompt = SAMPLE_CLINICAL_PROMPTS[i % SAMPLE_CLINICAL_PROMPTS.length];
      const disc = selectedDiscipline === 'simulacro_integral'
        ? ALL_SERVICE_AREAS[i % (ALL_SERVICE_AREAS.length - 1)]
        : selectedDiscipline;
      const level = (i % 5) + 1;

      const generated = await generateCaseWithLLMOrFallback({
        clinicalDescription: `${prompt} (Variante de examen ${safeBatch} #${i + 1})`,
        discipline: disc as any,
        level,
        academicYear: safeYear,
        batchId: safeBatch,
      });

      const saved = insertCustomQuestion(generated);
      createdQuestions.push(saved);
    }

    let managedExam = null;
    if (createManagedExam) {
      const examCode = `BAT-${safeYear.replace('DAS-', '')}-${Math.floor(100 + Math.random() * 900)}`;
      managedExam = createManagedTest({
        code: examCode,
        courseId: safeYear,
        title: `Batería Oficial ${safeBatch} (${safeYear})`,
        testType: 'standard_meap',
        discipline: selectedDiscipline as any,
        level: 1,
        questionCount: safeCount,
        timeLimitMinutes: safeCount * 3,
        status: 'prepared',
        createdBy: admin.id,
      });
    }

    logSecurityEvent({
      eventType: 'QUESTION_BATCH_GENERATED',
      userId: admin.id,
      severity: 'INFO',
      details: `Generado lote '${safeBatch}' con ${createdQuestions.length} casos MEAP para curso ${safeYear}.`,
    });

    return NextResponse.json({
      success: true,
      batchId: safeBatch,
      academicYear: safeYear,
      questionsCount: createdQuestions.length,
      managedExam,
      engineUsed: (createdQuestions[0] as any)?.engineUsed || 'offline-clinical-engine',
      message: `Nueva batería '${safeBatch}' generada con ${createdQuestions.length} casos inéditos.`,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso no autorizado: requiere rol docente.' }, { status: 403 });
    }
    return NextResponse.json({ error: `Error al generar la batería de casos: ${err.message}` }, { status: 500 });
  }
}
