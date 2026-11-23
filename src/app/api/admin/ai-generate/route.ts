import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { generateMeapWithAi } from '@/lib/adaptive';
import { getDb } from '@/lib/db';
import { ServiceArea } from '@/types';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { discipline, level, topic, cim10Code, saveDirectly } = body;

    if (!discipline || !level) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios (discipline, level).' }, { status: 400 });
    }

    const generatedCase = await generateMeapWithAi({
      discipline: discipline as ServiceArea,
      level: Number(level),
      topic: topic ? String(topic).trim() : undefined,
      cim10Code: cim10Code ? String(cim10Code).trim() : undefined,
    });

    let savedId: string | null = null;
    if (saveDirectly) {
      const db = getDb();
      savedId = `q_ai_${crypto.randomUUID().slice(0, 8)}`;
      db.prepare(`
        INSERT INTO questions (id, discipline, level, case_title, clinical_scenario, service_context, patient_age, patient_gender, options_json, correct_option_id, clinical_analysis, cim10_path, rule_check, distractor_explanations_json, error_category, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        savedId,
        generatedCase.discipline,
        generatedCase.level,
        generatedCase.caseTitle,
        generatedCase.clinicalScenario,
        generatedCase.serviceContext,
        generatedCase.patientAge || null,
        generatedCase.patientGender || null,
        JSON.stringify(generatedCase.options),
        generatedCase.correctOptionId,
        generatedCase.reasonedResolution.clinicalAnalysis,
        generatedCase.reasonedResolution.cim10Path,
        generatedCase.reasonedResolution.ruleCheck,
        JSON.stringify(generatedCase.reasonedResolution.distractorExplanations),
        generatedCase.errorCategory,
        new Date().toISOString()
      );
    }

    return NextResponse.json({
      success: true,
      case: generatedCase,
      savedId,
      engineUsed: generatedCase.engineUsed,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: `Error al generar caso: ${error.message}` }, { status: 500 });
  }
}
