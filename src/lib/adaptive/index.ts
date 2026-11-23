import { getDb } from '../db';
import { getQuestionsByDisciplineAndLevel, getAllQuestions } from '../db/queries';
import { Question, ServiceArea } from '@/types';

export interface StudentErrorPattern {
  errorCategory: string;
  count: number;
  failureRate: number;
}

export interface AdaptiveProfile {
  weakCategories: string[];
  weakDisciplines: string[];
  averageAccuracy: number;
  suggestedLevel: number;
  patternsSummary: string;
}

/**
 * Analyzes the student's historical attempts and error details
 */
export function analyzeStudentPerformance(userId: string): AdaptiveProfile {
  const db = getDb();

  // 1. Get error categories distribution from failed attempt details
  const errorStats = db.prepare(`
    SELECT 
      ad.error_category as errorCategory,
      COUNT(*) as count,
      SUM(CASE WHEN ad.is_correct = 0 THEN 1 ELSE 0 END) as failures,
      ROUND(SUM(CASE WHEN ad.is_correct = 0 THEN 1.0 ELSE 0.0 END) / COUNT(*), 2) as failureRate
    FROM attempt_details ad
    JOIN test_attempts ta ON ad.attempt_id = ta.id
    WHERE ta.user_id = ?
    GROUP BY ad.error_category
    ORDER BY failures DESC, failureRate DESC
  `).all(userId) as any[];

  // 2. Get discipline accuracy
  const disciplineStats = db.prepare(`
    SELECT 
      discipline,
      average_score as avgScore,
      current_level as currentLevel,
      highest_unlocked_level as highestLevel
    FROM discipline_progress
    WHERE user_id = ?
  `).all(userId) as any[];

  // 3. Overall average
  const overall = db.prepare(`
    SELECT 
      AVG(score) as avgScore,
      COUNT(*) as totalAttempts
    FROM test_attempts
    WHERE user_id = ?
  `).get(userId) as any;

  const weakCategories = errorStats
    .filter(e => e.failures > 0)
    .slice(0, 3)
    .map(e => e.errorCategory);

  const weakDisciplines = disciplineStats
    .filter(d => d.avgScore < 70)
    .map(d => d.discipline);

  const avgLevel = disciplineStats.length > 0
    ? Math.round(disciplineStats.reduce((acc, d) => acc + d.currentLevel, 0) / disciplineStats.length)
    : 1;

  let patternsSummary = 'Nivel inicial de evaluación';
  if (weakCategories.length > 0) {
    patternsSummary = `Áreas prioritarias detectadas: ${weakCategories.map(c => c.replace(/_/g, ' ')).join(', ')}`;
  } else if (overall?.totalAttempts > 0) {
    patternsSummary = 'Dominio consolidado en niveles previos. Apto para retos de nivel superior.';
  }

  return {
    weakCategories,
    weakDisciplines,
    averageAccuracy: overall?.avgScore || 100,
    suggestedLevel: Math.max(1, Math.min(5, avgLevel)),
    patternsSummary,
  };
}

/**
 * Generates an adaptive session with the Golden Formula:
 * - 60% Reinforcement of weak error categories / low scoring areas
 * - 25% Challenge progression (+1 level)
 * - 15% Consolidation of mastered fundamentals
 */
export function generateAdaptiveQuestions(
  userId: string,
  discipline?: ServiceArea,
  count: number = 10
): { questions: Question[]; profile: AdaptiveProfile } {
  const profile = analyzeStudentPerformance(userId);
  const allQuestions = getAllQuestions();

  // Filter pool by discipline if specified (or all if simulacro/unspecified)
  const pool: Question[] = discipline && discipline !== 'simulacro_integral'
    ? allQuestions.filter((q: Question) => q.discipline === discipline)
    : allQuestions;

  const selectedQuestions: Question[] = [];
  const selectedIds = new Set<string>();

  const targetReinforcement = Math.max(1, Math.round(count * 0.60)); // ~6 questions
  const targetChallenge = Math.max(1, Math.round(count * 0.25));     // ~2-3 questions
  const targetConsolidation = count - targetReinforcement - targetChallenge; // ~1-2 questions

  // 1. REINFORCEMENT (60%): questions matching weakCategories or error-prone types
  const reinforcementPool = pool.filter((q: Question) => {
    if (profile.weakCategories.length > 0) {
      return profile.weakCategories.includes(q.errorCategory);
    }
    // If no prior errors, reinforce level 1-2 standard questions
    return q.level <= 2;
  });

  const shuffledReinforcement = shuffleArray<Question>(reinforcementPool);
  for (const q of shuffledReinforcement) {
    if (selectedQuestions.length >= targetReinforcement) break;
    if (!selectedIds.has(q.id)) {
      selectedQuestions.push(q);
      selectedIds.add(q.id);
    }
  }

  // 2. CHALLENGE (25%): higher level questions (target = suggestedLevel + 1 or level >= 3)
  const challengeTargetLevel = Math.min(5, profile.suggestedLevel + 1);
  const challengePool = pool.filter((q: Question) => q.level >= challengeTargetLevel || q.level >= 3);
  const shuffledChallenge = shuffleArray<Question>(challengePool);
  for (const q of shuffledChallenge) {
    if (selectedQuestions.length >= targetReinforcement + targetChallenge) break;
    if (!selectedIds.has(q.id)) {
      selectedQuestions.push(q);
      selectedIds.add(q.id);
    }
  }

  // 3. CONSOLIDATION (15%): standard foundational questions (level 1-2)
  const consolidationPool = pool.filter((q: Question) => q.level <= 2);
  const shuffledConsolidation = shuffleArray<Question>(consolidationPool);
  for (const q of shuffledConsolidation) {
    if (selectedQuestions.length >= count) break;
    if (!selectedIds.has(q.id)) {
      selectedQuestions.push(q);
      selectedIds.add(q.id);
    }
  }

  // 4. Fill up to `count` if pools were small or overlapping
  if (selectedQuestions.length < count) {
    const remainingPool = shuffleArray<Question>(pool.filter((q: Question) => !selectedIds.has(q.id)));
    for (const q of remainingPool) {
      if (selectedQuestions.length >= count) break;
      selectedQuestions.push(q);
      selectedIds.add(q.id);
    }
  }

  // Final shuffle of the selected batch
  return {
    questions: shuffleArray(selectedQuestions.slice(0, count)),
    profile,
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

import { executeThreeTierGeneration, EngineUsed } from '../ai/three-tier-engine';

/**
 * Generates a new MEAP clinical case using Three-Tier Resilient Architecture:
 * 1. Local Ollama (timeout: 2000ms, skipped on Vercel)
 * 2. Cloud AI (Gemini or Groq with 6000ms timeout)
 * 3. Deterministic Offline Clinical Template Generator
 */
export async function generateMeapWithAi(params: {
  discipline: ServiceArea;
  level: number;
  topic?: string;
  cim10Code?: string;
}): Promise<Omit<Question, 'id'> & { engineUsed: EngineUsed }> {
  const { discipline, level, topic, cim10Code } = params;

  const prompt = `Actúa como Codificador Clínico CIM-10 experto. Genera un caso MEAP para la especialidad ${discipline}, Nivel ${level}${topic ? `, sobre el tema "${topic}"` : ''}${cim10Code ? ` con código CIM-10 de referencia "${cim10Code}"` : ''}.
Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:
{
  "discipline": "${discipline}",
  "level": ${level},
  "caseTitle": "Título descriptivo del caso",
  "clinicalScenario": "Enunciado clínico con edad, antecedentes, hallazgos y pruebas.",
  "serviceContext": "Ámbito asistencial específico",
  "patientAge": "ej. 58 años",
  "patientGender": "ej. Varón",
  "options": [
    {"id": "A", "code": "CÓDIGO_1", "text": "Descripción opción A"},
    {"id": "B", "code": "CÓDIGO_2", "text": "Descripción opción B"},
    {"id": "C", "code": "CÓDIGO_3", "text": "Descripción opción C"},
    {"id": "D", "code": "CÓDIGO_4", "text": "Descripción opción D"}
  ],
  "correctOptionId": "A",
  "reasonedResolution": {
    "clinicalAnalysis": "Interpretación diagnóstica y motivo de consulta",
    "cim10Path": "Camino de codificación por capítulo y categoría",
    "ruleCheck": "Notas Excluye/Incluye o verificación de 7º carácter",
    "distractorExplanations": {
      "A": "Por qué es correcta",
      "B": "Por qué falla la opción B",
      "C": "Por qué falla la opción C",
      "D": "Por qué falla la opción D"
    }
  },
  "errorCategory": "especificidad"
}`;

  const offlineGenerator = () => generateOfflineClinicalTemplate(discipline, level, topic, cim10Code);

  const { data: parsed, engineUsed } = await executeThreeTierGeneration({
    prompt,
    systemPrompt: 'Eres un docente y codificador clínico experto de la Fundación Hospital San Juan de Dios. Responde exclusivamente con un objeto JSON.',
    offlineGenerator,
  });

  const res = parsed as any;
  const offline = offlineGenerator();

  return {
    discipline: res.discipline || discipline,
    level: Number(res.level) || level,
    caseTitle: res.caseTitle || offline.caseTitle,
    clinicalScenario: res.clinicalScenario || offline.clinicalScenario,
    serviceContext: res.serviceContext || offline.serviceContext,
    patientAge: res.patientAge || offline.patientAge,
    patientGender: res.patientGender || offline.patientGender,
    options: Array.isArray(res.options) && res.options.length === 4 ? res.options : offline.options,
    correctOptionId: res.correctOptionId || 'A',
    reasonedResolution: res.reasonedResolution || offline.reasonedResolution,
    errorCategory: res.errorCategory || 'especificidad',
    engineUsed,
  };
}

function generateOfflineClinicalTemplate(
  discipline: ServiceArea,
  level: number,
  topic?: string,
  cim10Code?: string
): Omit<Question, 'id'> {
  const disciplineNames: Record<ServiceArea, string> = {
    atencion_primaria: 'Atención Primaria - Consulta Médica',
    urgencias: 'Servicio de Urgencias Hospitalarias',
    especializada_medica: 'Hospitalización de Medicina Interna / CCEE',
    especializada_quirurgica: 'Cirugía General y Traumatología',
    laboratorio_ap: 'Anatomía Patológica y Biopsias',
    salud_mental: 'Salud Mental y Adicciones',
    simulacro_integral: 'Auditoría Clínica Multidisciplinar',
  };

  const code = cim10Code || (discipline === 'urgencias' ? 'S82.851A' : discipline === 'atencion_primaria' ? 'I10' : 'K80.00');
  const title = topic || `Caso Clínico MEAP de ${discipline.replace(/_/g, ' ')} (Nivel ${level})`;

  return {
    discipline,
    level,
    caseTitle: title,
    clinicalScenario: `Paciente que acude a ${disciplineNames[discipline]}. Presenta sintomatología compatible con proceso codificable de nivel ${level}. Tras exploración clínica y pruebas complementarias protocolizadas, se concluye juicio clínico que precisa aplicación estricta de las normas de codificación CIM-10-ES.`,
    serviceContext: disciplineNames[discipline],
    patientAge: '62 años',
    patientGender: 'Mujer',
    options: [
      { id: 'A', code: code, text: `Codificación principal exacta conforme a normativa oficial CIM-10 (${code})` },
      { id: 'B', code: `${code.slice(0, 3)}.9`, text: `Código no especificado genérico sin desglose de gravedad o lateralidad` },
      { id: 'C', code: 'R68.89', text: 'Código de síntoma o signo general inespecífico descartable' },
      { id: 'D', code: 'Z00.00', text: 'Código de examen de salud o contacto administrativo erróneo' },
    ],
    correctOptionId: 'A',
    reasonedResolution: {
      clinicalAnalysis: 'Se identifica el diagnóstico principal establecido tras el estudio y se determina su jerarquía asistencial.',
      cim10Path: `Búsqueda en índice alfabético, localización del término principal y confirmación en lista tabular (${code}).`,
      ruleCheck: 'Verificación estricta de notas de exclusión (Excluye 1/Excluye 2) y requerimiento de caracteres adicionales.',
      distractorExplanations: {
        A: 'Opción correcta: Refleja el diagnóstico con máxima especificidad y acorde a normativa.',
        B: 'Incorrecta: Emplea código residual (.9) existiendo información clínica suficiente para codificar con detalle.',
        C: 'Incorrecta: No debe codificarse un síntoma cuando ya se dispone de diagnóstico etiológico confirmado.',
        D: 'Incorrecta: No procede código Z preventivo en un proceso patológico activo diagnosticado.',
      },
    },
    errorCategory: level >= 3 ? 'especificidad_lateralidad' : 'jerarquia_diagnostica',
  };
}
