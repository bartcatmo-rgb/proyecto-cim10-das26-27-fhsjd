import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { extractTextFromPdfBuffer } from '@/lib/pdf/extractor';
import { executeThreeTierGeneration } from '@/lib/ai/three-tier-engine';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const customTitle = (formData.get('title') as string | null)?.trim();
    const customCategory = (formData.get('category') as string | null)?.trim() || 'Documentación Sanitaria';
    const isPublished = formData.get('is_published') === '0' ? 0 : 1;

    if (!file) {
      return NextResponse.json({ error: 'No se ha adjuntado ningún archivo PDF.' }, { status: 400 });
    }

    // Strict MIME & Size validation
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo excede el límite máximo permitido (25 MB).' }, { status: 413 });
    }

    if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Debe ser un documento PDF oficial.' }, { status: 415 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Verify %PDF- magic bytes header
    if (!buffer.subarray(0, 5).toString('latin1').startsWith('%PDF-')) {
      return NextResponse.json({ error: 'Cabecera no válida: el archivo no contiene la firma binaria %PDF-.' }, { status: 422 });
    }

    // 1. Extract text natively using Node.js zlib
    let extracted;
    try {
      extracted = extractTextFromPdfBuffer(buffer);
    } catch (parseErr: any) {
      return NextResponse.json({
        error: `Error al procesar el archivo PDF: ${parseErr.message || 'Formato no compatible'}`
      }, { status: 422 });
    }

    if (!extracted.rawText || extracted.rawText.length < 50) {
      return NextResponse.json({
        error: 'El PDF no contiene texto legible (posible documento escaneado como imagen pura o protegido por contraseña).'
      }, { status: 422 });
    }

    const title = customTitle || extracted.titleCandidate || file.name.replace(/\.pdf$/i, '');
    const slugBase = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 40) || 'tema-importado';

    const db = getDb();

    // Check unique slug
    let slug = slugBase;
    let slugSuffix = 1;
    while (db.prepare('SELECT id FROM topics WHERE slug = ?').get(slug)) {
      slug = `${slugBase}-${slugSuffix++}`;
    }

    const topicId = `topic_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 2. Process extracted content through Three-Tier Generation Engine
    const snippetForAi = extracted.sections.map((s) => `### ${s.title}\n${s.content.substring(0, 800)}`).join('\n\n').substring(0, 3500);

    interface TopicGenerationOutput {
      description: string;
      sections: Array<{
        title: string;
        summary: string;
        keyConcepts: string[];
        clinicalRules: string[];
      }>;
      questions: Array<{
        questionType: 'multiple_choice' | 'reverse_coding' | 'kahoot';
        title: string;
        scenario: string;
        options: Array<{ id: string; text: string }>;
        correctOptionId: string;
        explanation: string;
        difficultyLevel: number;
      }>;
    }

    const offlineFallback: TopicGenerationOutput = {
      description: `Temario técnico oficial sobre ${title.substring(0, 60)} para el ciclo formativo DAS 26/27.`,
      sections: extracted.sections.slice(0, 5).map((s, idx) => ({
        title: s.title || `Sección ${idx + 1}: Directrices y Casuística`,
        summary: s.content.substring(0, 400) + '...',
        keyConcepts: [
          'Normativa y estándares clínicos',
          'Identificación de documentación hospitalaria',
          'Buenas prácticas de registro clínico'
        ],
        clinicalRules: [
          'Verificar siempre la coherencia del informe de alta hospitalaria',
          'Aplicar las directrices de codificación oficiales vigentes'
        ]
      })),
      questions: [
        {
          questionType: 'multiple_choice',
          title: `Evaluación de Fundamentos: ${title.substring(0, 50)}`,
          scenario: `En el contexto del estudio de la unidad temática "${title}", el equipo de documentación y codificación clínica debe establecer las pautas prioritarias de registro.`,
          options: [
            { id: 'A', text: 'Aplicar la normativa técnica oficial y las notas de exclusión de forma jerárquica.' },
            { id: 'B', text: 'Priorizar siempre el diagnóstico secundario sobre el motivo de ingreso.' },
            { id: 'C', text: 'Omitir la codificación de secuelas y complicaciones agudas.' },
            { id: 'D', text: 'Registrar únicamente diagnósticos sin códigos de procedimiento.' }
          ],
          correctOptionId: 'A',
          explanation: 'La normativa técnica oficial y la jerarquía diagnóstica rigen la clasificación clínica sin excepciones.',
          difficultyLevel: 1
        },
        {
          questionType: 'reverse_coding',
          title: `Auditoría Clínica de Caso: ${title.substring(0, 50)}`,
          scenario: `Revisión de informe clínico donde se detecta una asignación contradictoria de códigos en relación con las directrices del temario.`,
          options: [
            { id: 'A', text: 'Corregir la secuencia asignando el diagnóstico causal en primera posición.' },
            { id: 'B', text: 'Mantener la propuesta errónea para no alterar la estadística.' },
            { id: 'C', text: 'Eliminar el registro de antecedentes clínicos.' },
            { id: 'D', text: 'Codificar un síntoma aislado en lugar de la afección confirmada.' }
          ],
          correctOptionId: 'A',
          explanation: 'La auditoría de codificación exige rectificar la jerarquía situando la afección causal según la normativa.',
          difficultyLevel: 2
        }
      ]
    };

    const prompt = `Analiza este temario sanitario oficial para el ciclo de Documentación Sanitaria (DAS 26/27):
TITULO: "${title}"
FRAGMENTOS TEMÁTICOS:
${snippetForAi}

Devuelve ÚNICAMENTE un JSON con este formato exacto:
{
  "description": "Resumen conciso del contenido del tema (máx 150 caracteres)",
  "sections": [
    {
      "title": "Título de la sección",
      "summary": "Resumen didáctico del contenido (100-250 palabras)",
      "keyConcepts": ["Concepto 1", "Concepto 2", "Concepto 3"],
      "clinicalRules": ["Regla o directriz 1", "Regla o directriz 2"]
    }
  ],
  "questions": [
    {
      "questionType": "multiple_choice",
      "title": "Pregunta de examen sobre el temario",
      "scenario": "Escenario clínico o contexto normativo",
      "options": [
        {"id": "A", "text": "Opción A"},
        {"id": "B", "text": "Opción B"},
        {"id": "C", "text": "Opción C"},
        {"id": "D", "text": "Opción D"}
      ],
      "correctOptionId": "A",
      "explanation": "Justificación fundamentada en la normativa o clínica",
      "difficultyLevel": 1
    }
  ]
}`;

    const aiResult = await executeThreeTierGeneration<TopicGenerationOutput>({
      prompt,
      offlineGenerator: () => offlineFallback
    });

    const parsedData = aiResult.data || offlineFallback;
    const now = new Date().toISOString();

    // 3. Insert topic transactionally into SQLite
    const insertTx = db.transaction(() => {
      // Topic
      db.prepare(`
        INSERT INTO topics (id, slug, title, description, category, is_core, is_published, sort_order, icon, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 0, ?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM topics), 'document-text', ?, ?, ?)
      `).run(
        topicId,
        slug,
        title,
        parsedData.description || `Temario oficial sobre ${title}`,
        customCategory,
        isPublished,
        session.id,
        now,
        now
      );

      // Summaries
      const insertSum = db.prepare(`
        INSERT INTO topic_summaries (id, topic_id, section_title, summary_content, key_concepts_json, clinical_rules_json, sort_order, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const sections = Array.isArray(parsedData.sections) && parsedData.sections.length > 0
        ? parsedData.sections
        : offlineFallback.sections;

      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        insertSum.run(
          `sum_${topicId}_${i + 1}`,
          topicId,
          sec.title || `Sección ${i + 1}`,
          sec.summary || '',
          JSON.stringify(sec.keyConcepts || []),
          JSON.stringify(sec.clinicalRules || []),
          i + 1,
          now
        );
      }

      // Questions
      const insertQ = db.prepare(`
        INSERT INTO topic_questions (id, topic_id, question_type, title, scenario, options_json, correct_option_id, explanation, difficulty_level, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const questions = Array.isArray(parsedData.questions) && parsedData.questions.length > 0
        ? parsedData.questions
        : offlineFallback.questions;

      for (let j = 0; j < questions.length; j++) {
        const q = questions[j];
        insertQ.run(
          `tq_${topicId}_${j + 1}`,
          topicId,
          q.questionType || 'multiple_choice',
          q.title || `Pregunta ${j + 1}`,
          q.scenario || '',
          JSON.stringify(q.options || []),
          q.correctOptionId || 'A',
          q.explanation || '',
          q.difficultyLevel || 1,
          now
        );
      }
    });

    insertTx();

    return NextResponse.json({
      success: true,
      topic: {
        id: topicId,
        slug,
        title,
        category: customCategory,
        summariesCount: parsedData.sections?.length || offlineFallback.sections.length,
        questionsCount: parsedData.questions?.length || offlineFallback.questions.length,
        estimatedPages: extracted.estimatedPages
      },
      engineUsed: aiResult.engineUsed
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado: se requieren privilegios docentes' }, { status: 403 });
    }
    console.error('Error en POST /api/admin/topics/import-pdf:', err);
    return NextResponse.json({ error: 'Error interno al procesar el temario' }, { status: 500 });
  }
}
