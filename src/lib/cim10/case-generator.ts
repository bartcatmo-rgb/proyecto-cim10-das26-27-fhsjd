import { Question, ServiceArea, CIM10Code } from '@/types';
import { searchCim10Codes } from '../db/queries';
import { executeThreeTierGeneration, EngineUsed } from '../ai/three-tier-engine';

interface GenerateCaseInput {
  clinicalDescription: string;
  discipline: ServiceArea;
  level: number;
  objectiveCode?: string;
  normativeCriteria?: string;
  academicYear?: string;
  batchId?: string;
}

export type GeneratedCaseResult = Omit<Question, 'id'> & {
  batchId: string;
  academicYear: string;
  engineUsed: EngineUsed;
};

export async function generateCaseWithLLMOrFallback(input: GenerateCaseInput): Promise<GeneratedCaseResult> {
  const {
    clinicalDescription,
    discipline,
    level,
    objectiveCode,
    normativeCriteria,
    academicYear = 'DAS-26-27',
    batchId = 'profesor_manual',
  } = input;

  const prompt = `Actúa como especialista en codificación clínica CIM-10 (CIE-10-ES Diagnósticos) y educación médica en España.
A partir de este supuesto clínico aportado por el docente:
"${clinicalDescription}"
Ámbito: ${discipline}, Nivel: ${level}${objectiveCode ? `, Código objetivo: ${objectiveCode}` : ''}${normativeCriteria ? `, Criterio normativo: ${normativeCriteria}` : ''}.

Genera estrictamente un objeto JSON con:
{
  "caseTitle": "Título conciso del caso",
  "clinicalScenario": "Descripción clínica ampliada con antecedentes, constantes y hallazgos diagnósticos",
  "serviceContext": "Contexto asistencial hospitalario o ambulatorio",
  "patientAge": "Edad",
  "patientGender": "Hombre/Mujer",
  "options": [
    {"id": "A", "code": "Código CIM-10", "text": "Descripción oficial"},
    {"id": "B", "code": "Código CIM-10", "text": "Descripción oficial"},
    {"id": "C", "code": "Código CIM-10", "text": "Descripción oficial"},
    {"id": "D", "code": "Código CIM-10", "text": "Descripción oficial"}
  ],
  "correctOptionId": "A",
  "clinicalAnalysis": "Análisis clínico detallado",
  "cim10Path": "Ruta en índice alfabético y lista tabular",
  "ruleCheck": "Verificación de notas de inclusión, exclusión o 7º carácter",
  "distractorExplanations": {
    "A": "Explicación",
    "B": "Explicación",
    "C": "Explicación",
    "D": "Explicación"
  },
  "errorCategory": "jerarquia_diagnostica"
}`;

  // Deterministic Tier 3 Offline Clinical Generator
  const offlineGenerator = () => {
    const catalog = searchCim10Codes('', undefined, 20);
    let targetCode = catalog.find((c: CIM10Code) => c.code.toLowerCase() === (objectiveCode || '').toLowerCase().trim());
    if (!targetCode && catalog.length > 0) {
      targetCode = catalog[Math.floor(Math.random() * catalog.length)];
    }

    const validCode = targetCode?.code || 'I21.09';
    const validDesc = targetCode?.description || 'Infarto agudo de miocardio con elevación del ST de arteria coronaria descendente anterior';

    const distractors = [
      { id: 'B', code: 'I21.9', text: 'Infarto agudo de miocardio, no especificado' },
      { id: 'C', code: 'I20.0', text: 'Angina inestable' },
      { id: 'D', code: 'I25.2', text: 'Infarto de miocardio antiguo' },
    ];

    const caseTitle = clinicalDescription.length > 50
      ? clinicalDescription.substring(0, 48) + '...'
      : `Caso Asistencial: ${clinicalDescription}`;

    return {
      discipline,
      level,
      caseTitle,
      clinicalScenario: clinicalDescription.trim(),
      serviceContext: `Ámbito Clínico · ${discipline.replace(/_/g, ' ').toUpperCase()}`,
      patientAge: '64 años',
      patientGender: 'Hombre',
      options: [
        { id: 'A', code: validCode, text: validDesc },
        { id: 'B', code: distractors[0].code, text: distractors[0].text },
        { id: 'C', code: distractors[1].code, text: distractors[1].text },
        { id: 'D', code: distractors[2].code, text: distractors[2].text },
      ],
      correctOptionId: 'A',
      reasonedResolution: {
        clinicalAnalysis: `El paciente presenta un cuadro agudo claramente documentado que motiva el contacto asistencial. Tras estudio clínico y analítico, el diagnóstico principal corresponde inequívocamente a ${validDesc} (${validCode}).`,
        cim10Path: `1) Índice Alfabético: Localizar término principal. 2) Lista Tabular: Cotejar subcategoría ${validCode}. Verificar carácter de lateralidad y subtipo anatómico específico.`,
        ruleCheck: normativeCriteria || 'Normativa Oficial de Codificación: Cumple el principio fundamental de Diagnóstico Principal. No aplican notas Excluye 1 que impidan su codificación única.',
        distractorExplanations: {
          A: 'RESPUESTA CORRECTA. Especifica con máxima precisión la etiología y localización documentadas.',
          B: 'INCORRECTA. Es un código inespecífico no admisible cuando la historia clínica detalla la localización.',
          C: 'INCORRECTA. La angina inestable queda englobada por la necrosis miocárdica sobrevenida (código combinado/jerarquía).',
          D: 'INCORRECTA. Representa un antecedente o secuela cicatrizal, no el episodio agudo que motivó la atención médica.',
        },
      },
      errorCategory: 'jerarquia_diagnostica',
      batchId,
      academicYear,
    };
  };

  const { data: rawParsed, engineUsed } = await executeThreeTierGeneration({
    prompt,
    systemPrompt: 'Eres un docente y codificador clínico experto de la Fundación Hospital San Juan de Dios. Responde exclusivamente con un objeto JSON.',
    offlineGenerator,
  });

  const parsed = rawParsed as any;

  return {
    discipline,
    level,
    caseTitle: parsed.caseTitle || `Caso Asistencial: ${clinicalDescription.substring(0, 30)}`,
    clinicalScenario: parsed.clinicalScenario || clinicalDescription,
    serviceContext: parsed.serviceContext || `Servicio asistencial de ${discipline}`,
    patientAge: parsed.patientAge || '62 años',
    patientGender: parsed.patientGender || 'Mujer',
    options: parsed.options || offlineGenerator().options,
    correctOptionId: parsed.correctOptionId || 'A',
    reasonedResolution: {
      clinicalAnalysis: parsed.reasonedResolution?.clinicalAnalysis || parsed.clinicalAnalysis || 'Análisis de la patología principal causante del ingreso.',
      cim10Path: parsed.reasonedResolution?.cim10Path || parsed.cim10Path || 'Búsqueda por término principal en Índice Alfabético y comprobación Tabular.',
      ruleCheck: parsed.reasonedResolution?.ruleCheck || parsed.ruleCheck || 'Normativa general de selección de diagnóstico principal.',
      distractorExplanations: parsed.reasonedResolution?.distractorExplanations || parsed.distractorExplanations || {
        A: 'Opción evaluada en la normativa.',
        B: 'Código alternativo que no cumple el criterio de afección principal.',
        C: 'Código con lateralidad o especificidad no justificada.',
        D: 'Código que omite la afección causal directa.',
      },
    },
    errorCategory: parsed.errorCategory || 'jerarquia_diagnostica',
    batchId,
    academicYear,
    engineUsed,
  };
}
