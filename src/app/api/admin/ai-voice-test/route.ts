import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { generateMeapWithAi } from '@/lib/adaptive';
import { bulkInsertQuestions, createManagedTest, updateManagedTestStatus } from '@/lib/db/queries';
import { ServiceArea, TestType, Question } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const {
      prompt,
      title,
      discipline,
      level,
      questionCount,
      timeLimitMinutes,
      testType,
      courseId,
      autoPublish,
    } = body;

    const rawPrompt = String(prompt || '').trim();
    if (!rawPrompt) {
      return NextResponse.json({ error: 'El dictado por voz o texto de la prueba es obligatorio.' }, { status: 400 });
    }

    // Infer parameters if not explicitly provided
    let targetDiscipline: ServiceArea = discipline || 'simulacro_integral';
    const lowerPrompt = rawPrompt.toLowerCase();

    if (lowerPrompt.includes('urgencia')) targetDiscipline = 'urgencias';
    else if (lowerPrompt.includes('primaria') || lowerPrompt.includes('centro de salud')) targetDiscipline = 'atencion_primaria';
    else if (lowerPrompt.includes('quirúrg') || lowerPrompt.includes('cirugía') || lowerPrompt.includes('trauma')) targetDiscipline = 'especializada_quirurgica';
    else if (lowerPrompt.includes('médica') || lowerPrompt.includes('interna') || lowerPrompt.includes('digestiv')) targetDiscipline = 'especializada_medica';
    else if (lowerPrompt.includes('mental') || lowerPrompt.includes('psiquiatr')) targetDiscipline = 'salud_mental';
    else if (lowerPrompt.includes('biopsia') || lowerPrompt.includes('patolog') || lowerPrompt.includes('laboratorio')) targetDiscipline = 'laboratorio_ap';

    let targetLevel = Number(level) || 2;
    if (lowerPrompt.includes('nivel 1') || lowerPrompt.includes('fácil') || lowerPrompt.includes('básico')) targetLevel = 1;
    if (lowerPrompt.includes('nivel 3') || lowerPrompt.includes('avanzado') || lowerPrompt.includes('difícil')) targetLevel = 3;
    if (lowerPrompt.includes('nivel 4') || lowerPrompt.includes('experto')) targetLevel = 4;

    const count = Math.min(Math.max(Number(questionCount) || 5, 1), 10);
    const targetTestType: TestType = testType || 'standard_meap';
    const targetCourse = courseId || 'DAS-26-27';

    // Generate N MEAP cases
    const generatedQuestions: Omit<Question, 'id'>[] = [];
    for (let i = 0; i < count; i++) {
      const casePrompt = `${rawPrompt} (Caso ${i + 1} de ${count})`;
      const meapCase = await generateMeapWithAi({
        discipline: targetDiscipline,
        level: targetLevel,
        topic: `${title || 'Caso Asistido por Voz'} #${i + 1}: ${rawPrompt.slice(0, 50)}`,
      });
      generatedQuestions.push(meapCase);
    }

    // Bulk insert into DB
    const { inserted } = bulkInsertQuestions(generatedQuestions);

    // Auto-create managed test
    const codeSuffix = Math.floor(1000 + Math.random() * 9000);
    const testCode = `VOZ-${codeSuffix}`;
    const testTitle = title?.trim() || `Prueba IA: ${rawPrompt.slice(0, 45)}...`;

    const createdTest = createManagedTest({
      title: testTitle,
      testType: targetTestType,
      discipline: targetDiscipline,
      level: targetLevel,
      questionCount: count,
      timeLimitMinutes: Number(timeLimitMinutes) || 20,
      status: autoPublish ? 'live' : 'prepared',
      courseId: targetCourse,
      code: testCode,
      createdBy: `Voz/IA (${admin.fullName || admin.username})`,
    });

    return NextResponse.json({
      success: true,
      message: `Generada prueba con ${inserted} casos clínicos MEAP e implementada en el curso ${targetCourse}.`,
      test: createdTest,
      insertedCount: inserted,
      sampleQuestion: generatedQuestions[0],
    }, { status: 201 });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: err.message || 'Error al generar casos mediante voz/IA.' }, { status: 500 });
  }
}
