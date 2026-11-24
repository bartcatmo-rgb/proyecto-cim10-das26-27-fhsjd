import { getDb } from './index';

export interface Topic {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  is_core: number;
  is_published: number;
  sort_order: number;
  icon: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TopicSummary {
  id: string;
  topic_id: string;
  section_title: string;
  summary_content: string;
  key_concepts: string[];
  clinical_rules: string[];
  sort_order: number;
  created_at: string;
  completed?: boolean;
}

export interface TopicQuestion {
  id: string;
  topic_id: string;
  question_type: 'multiple_choice' | 'reverse_coding' | 'kahoot';
  title: string;
  scenario: string;
  options: Array<{ id: string; text: string }>;
  correct_option_id: string;
  explanation: string;
  difficulty_level: number;
  created_at: string;
}

export interface TopicWithProgress extends Topic {
  summariesCount: number;
  completedSummariesCount: number;
  progressPercentage: number;
  averageScore?: number;
  attemptsCount?: number;
}

export interface SubjectMetricSummary {
  id: string;
  code: string;
  name: string;
  color?: string;
  icon?: string;
  totalTopics: number;
  completedTopics: number;
  totalTests: number;
  averageScore: number;
}

export interface StudentLearningMetrics {
  totalTopics: number;
  totalSummariesRead: number;
  totalSummariesAvailable: number;
  globalStudyPercentage: number;
  totalTestsTaken: number;
  averageScore: number;
  chronologicalCurve: Array<{ date: string; score: number; label: string; mode: string; subjectId?: string }>;
  topicsPerformance: Array<{
    slug: string;
    title: string;
    category: string;
    studyPercentage: number;
    averageScore: number;
    attemptsCount: number;
    status: 'need_reinforcement' | 'in_progress' | 'mastered';
    subjectId?: string;
  }>;
  priorityReinforcements: Array<{
    topicTitle: string;
    reason: string;
    recommendation: string;
  }>;
  subjects?: SubjectMetricSummary[];
  selectedSubjectId?: string;
}

/**
 * Returns all published topics with student progress (if userId provided)
 */
export function getPublishedTopicsWithProgress(userId?: string): TopicWithProgress[] {
  const db = getDb();
  const topics = db.prepare(`
    SELECT * FROM topics
    WHERE is_published = 1
    ORDER BY sort_order ASC, created_at ASC
  `).all() as Topic[];

  return topics.map((t) => {
    const sumCountRow = db.prepare('SELECT COUNT(*) as count FROM topic_summaries WHERE topic_id = ?').get(t.id) as { count: number };
    const summariesCount = sumCountRow?.count || 0;

    let completedSummariesCount = 0;
    if (userId) {
      const compRow = db.prepare('SELECT COUNT(*) as count FROM topic_study_progress WHERE user_id = ? AND topic_id = ? AND completed = 1').get(userId, t.id) as { count: number };
      completedSummariesCount = compRow?.count || 0;
    }

    const progressPercentage = summariesCount > 0 ? Math.min(100, Math.round((completedSummariesCount / summariesCount) * 100)) : 0;

    let averageScore: number | undefined;
    let attemptsCount: number | undefined;

    if (userId) {
      if (t.is_core === 1) {
        // Core topic links to general test_attempts
        const attStats = db.prepare(`
          SELECT COUNT(*) as count, AVG(score) as avgScore
          FROM test_attempts
          WHERE user_id = ?
        `).get(userId) as { count: number; avgScore: number | null };
        attemptsCount = attStats?.count || 0;
        averageScore = attStats?.avgScore ? Math.round(attStats.avgScore * 10) / 10 : undefined;
      } else {
        const topStats = db.prepare(`
          SELECT COUNT(*) as count, AVG(score) as avgScore
          FROM topic_test_attempts
          WHERE user_id = ? AND topic_id = ?
        `).get(userId, t.id) as { count: number; avgScore: number | null };
        attemptsCount = topStats?.count || 0;
        averageScore = topStats?.avgScore ? Math.round(topStats.avgScore * 10) / 10 : undefined;
      }
    }

    return {
      ...t,
      summariesCount,
      completedSummariesCount,
      progressPercentage,
      averageScore,
      attemptsCount
    };
  });
}

/**
 * Returns all topics for admin management
 */
export function getAllTopicsAdmin(): (Topic & { summariesCount: number; questionsCount: number })[] {
  const db = getDb();
  const topics = db.prepare('SELECT * FROM topics ORDER BY sort_order ASC, created_at ASC').all() as Topic[];
  return topics.map((t) => {
    const sCount = (db.prepare('SELECT COUNT(*) as c FROM topic_summaries WHERE topic_id = ?').get(t.id) as any)?.c || 0;
    const qCount = (db.prepare('SELECT COUNT(*) as c FROM topic_questions WHERE topic_id = ?').get(t.id) as any)?.c || 0;
    return {
      ...t,
      summariesCount: sCount,
      questionsCount: qCount
    };
  });
}

/**
 * Returns a single topic by slug with its summaries and progress
 */
export function getTopicBySlug(slug: string, userId?: string) {
  const db = getDb();
  const topic = db.prepare('SELECT * FROM topics WHERE slug = ?').get(slug) as Topic | undefined;
  if (!topic) return null;

  const rawSummaries = db.prepare('SELECT * FROM topic_summaries WHERE topic_id = ? ORDER BY sort_order ASC, created_at ASC').all(topic.id) as any[];

  let completedSummaryIds = new Set<string>();
  if (userId) {
    const rows = db.prepare('SELECT summary_id FROM topic_study_progress WHERE user_id = ? AND topic_id = ? AND completed = 1').all(userId, topic.id) as Array<{ summary_id: string }>;
    completedSummaryIds = new Set(rows.map((r) => r.summary_id));
  }

  const summaries: TopicSummary[] = rawSummaries.map((s) => ({
    id: s.id,
    topic_id: s.topic_id,
    section_title: s.section_title,
    summary_content: s.summary_content,
    key_concepts: s.key_concepts_json ? JSON.parse(s.key_concepts_json) : [],
    clinical_rules: s.clinical_rules_json ? JSON.parse(s.clinical_rules_json) : [],
    sort_order: s.sort_order,
    created_at: s.created_at,
    completed: completedSummaryIds.has(s.id)
  }));

  const rawQuestions = db.prepare('SELECT * FROM topic_questions WHERE topic_id = ? ORDER BY difficulty_level ASC, created_at ASC').all(topic.id) as any[];
  const questions: TopicQuestion[] = rawQuestions.map((q) => ({
    id: q.id,
    topic_id: q.topic_id,
    question_type: q.question_type,
    title: q.title,
    scenario: q.scenario,
    options: q.options_json ? JSON.parse(q.options_json) : [],
    correct_option_id: q.correct_option_id,
    explanation: q.explanation,
    difficulty_level: q.difficulty_level,
    created_at: q.created_at
  }));

  return {
    topic,
    summaries,
    questions
  };
}

/**
 * Mark a summary section as read/completed by a student
 */
export function recordTopicSectionProgress(userId: string, topicId: string, summaryId: string, completed: boolean = true): boolean {
  const db = getDb();
  const id = `prog_${userId.replace(/[^a-zA-Z0-9]/g, '')}_${summaryId}`;
  const now = new Date().toISOString();

  if (completed) {
    db.prepare(`
      INSERT INTO topic_study_progress (id, user_id, topic_id, summary_id, completed, read_at)
      VALUES (?, ?, ?, ?, 1, ?)
      ON CONFLICT(user_id, topic_id, summary_id) DO UPDATE SET completed = 1, read_at = ?
    `).run(id, userId, topicId, summaryId, now, now);
  } else {
    db.prepare(`
      DELETE FROM topic_study_progress
      WHERE user_id = ? AND topic_id = ? AND summary_id = ?
    `).run(userId, topicId, summaryId);
  }

  return true;
}

/**
 * Record a topic test attempt
 */
export function recordTopicTestAttempt(
  userId: string,
  topicId: string,
  mode: 'exam' | 'reverse' | 'kahoot',
  score: number,
  totalQuestions: number,
  correctCount: number,
  detailsJson?: string
): string {
  const db = getDb();
  const id = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO topic_test_attempts (id, user_id, topic_id, mode, score, total_questions, correct_count, details_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, topicId, mode, score, totalQuestions, correctCount, detailsJson || null, now);

  return id;
}

/**
 * Calculate full student learning performance metrics for the SVG learning chart
 * Anti-IDOR: strictly derived from userId
 */
export function getStudentLearningMetrics(userId: string, subjectId?: string): StudentLearningMetrics {
  const db = getDb();

  // 0. Query all course subjects for per-subject and overall aggregation
  let dbSubjects: Array<{ id: string; code: string; name: string; color?: string; icon?: string }> = [];
  try {
    dbSubjects = db.prepare('SELECT id, code, name, icon, color FROM course_subjects WHERE is_active = 1 ORDER BY name ASC').all() as any[];
  } catch {
    dbSubjects = [];
  }
  if (dbSubjects.length === 0) {
    dbSubjects = [{ id: 'subj_cim10_default', code: 'CIM10-DAS', name: 'Codificación Clínica CIM-10 · MEAP', color: '#2563eb', icon: 'book' }];
  }

  const effectiveSubjectFilter = subjectId && subjectId !== 'all' ? subjectId : null;

  // 1. Topics and Summaries (filtered by subject if selected)
  let topicsQuery = 'SELECT * FROM topics WHERE is_published = 1';
  const topicsParams: any[] = [];
  if (effectiveSubjectFilter) {
    topicsQuery += ' AND (subject_id = ? OR (subject_id IS NULL AND ? = \'subj_cim10_default\'))';
    topicsParams.push(effectiveSubjectFilter, effectiveSubjectFilter);
  }
  topicsQuery += ' ORDER BY sort_order ASC';

  const topics = db.prepare(topicsQuery).all(...topicsParams) as Topic[];
  const totalTopics = topics.length;

  let totalSummariesAvailable = 0;
  let totalSummariesRead = 0;

  const topicsPerformance: StudentLearningMetrics['topicsPerformance'] = [];

  for (const t of topics) {
    const avail = (db.prepare('SELECT COUNT(*) as c FROM topic_summaries WHERE topic_id = ?').get(t.id) as any)?.c || 0;
    const read = (db.prepare('SELECT COUNT(*) as c FROM topic_study_progress WHERE user_id = ? AND topic_id = ? AND completed = 1').get(userId, t.id) as any)?.c || 0;

    totalSummariesAvailable += avail;
    totalSummariesRead += read;

    const studyPct = avail > 0 ? Math.min(100, Math.round((read / avail) * 100)) : 0;

    let avgScore = 0;
    let attemptsCount = 0;

    if (t.is_core === 1) {
      const stats = db.prepare('SELECT COUNT(*) as c, AVG(score) as a FROM test_attempts WHERE user_id = ?').get(userId) as any;
      attemptsCount = stats?.c || 0;
      avgScore = stats?.a ? Math.round(stats.a * 10) / 10 : 0;
    } else {
      const stats = db.prepare('SELECT COUNT(*) as c, AVG(score) as a FROM topic_test_attempts WHERE user_id = ? AND topic_id = ?').get(userId, t.id) as any;
      attemptsCount = stats?.c || 0;
      avgScore = stats?.a ? Math.round(stats.a * 10) / 10 : 0;
    }

    let status: 'need_reinforcement' | 'in_progress' | 'mastered' = 'in_progress';
    if (studyPct >= 80 && avgScore >= 7.0) {
      status = 'mastered';
    } else if (studyPct < 40 || (attemptsCount > 0 && avgScore < 5.0)) {
      status = 'need_reinforcement';
    }

    topicsPerformance.push({
      slug: t.slug,
      title: t.title,
      category: t.category,
      studyPercentage: studyPct,
      averageScore: avgScore,
      attemptsCount,
      status,
      subjectId: (t as any).subject_id || 'subj_cim10_default',
    });
  }

  const globalStudyPercentage = totalSummariesAvailable > 0
    ? Math.min(100, Math.round((totalSummariesRead / totalSummariesAvailable) * 100))
    : 0;

  // 2. Chronological accuracy curve from student attempts
  const curveRows: Array<{ created_at: string; score: number; label: string; mode: string; subjectId?: string }> = [];

  // Core attempts from test_attempts (filtered by subject if specified)
  let generalAttemptsQuery = 'SELECT score, created_at, discipline, subject_id FROM test_attempts WHERE user_id = ?';
  const generalParams: any[] = [userId];
  if (effectiveSubjectFilter) {
    generalAttemptsQuery += ' AND (subject_id = ? OR (subject_id IS NULL AND ? = \'subj_cim10_default\'))';
    generalParams.push(effectiveSubjectFilter, effectiveSubjectFilter);
  }
  generalAttemptsQuery += ' ORDER BY created_at ASC';

  const generalAttempts = db.prepare(generalAttemptsQuery).all(...generalParams) as Array<{ score: number; created_at: string; discipline: string; subject_id?: string }>;

  for (const a of generalAttempts) {
    curveRows.push({
      created_at: a.created_at,
      score: Math.min(10, Math.max(0, a.score)),
      label: a.discipline.replace('_', ' ').toUpperCase(),
      mode: 'Prueba MEAP',
      subjectId: a.subject_id || 'subj_cim10_default',
    });
  }

  // Topic attempts from topic_test_attempts (filtered by subject if specified)
  let topicAttemptsQuery = `
    SELECT tta.score, tta.created_at, tta.mode, t.title, tta.subject_id
    FROM topic_test_attempts tta
    JOIN topics t ON tta.topic_id = t.id
    WHERE tta.user_id = ?
  `;
  const topicParams: any[] = [userId];
  if (effectiveSubjectFilter) {
    topicAttemptsQuery += ' AND (tta.subject_id = ? OR t.subject_id = ? OR (tta.subject_id IS NULL AND ? = \'subj_cim10_default\'))';
    topicParams.push(effectiveSubjectFilter, effectiveSubjectFilter, effectiveSubjectFilter);
  }
  topicAttemptsQuery += ' ORDER BY tta.created_at ASC';

  const topicAttempts = db.prepare(topicAttemptsQuery).all(...topicParams) as Array<{ score: number; created_at: string; mode: string; title: string; subject_id?: string }>;

  for (const ta of topicAttempts) {
    curveRows.push({
      created_at: ta.created_at,
      score: Math.min(10, Math.max(0, ta.score)),
      label: ta.title,
      mode: ta.mode === 'exam' ? 'Examen Tema' : ta.mode === 'reverse' ? 'Auditoría' : 'Kahoot',
      subjectId: ta.subject_id || 'subj_cim10_default',
    });
  }

  // Sort chronological
  curveRows.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const chronologicalCurve = curveRows.slice(-15).map((r) => ({
    date: r.created_at.split('T')[0] || r.created_at,
    score: Math.round(r.score * 10) / 10,
    label: r.label,
    mode: r.mode,
    subjectId: r.subjectId,
  }));

  const totalTestsTaken = curveRows.length;
  const averageScore = totalTestsTaken > 0
    ? Math.round((curveRows.reduce((acc, c) => acc + c.score, 0) / totalTestsTaken) * 10) / 10
    : 0;

  // 3. Calculate per-subject breakdown for student selector tabs
  const subjectsBreakdown: SubjectMetricSummary[] = dbSubjects.map((s) => {
    // Topic count for subject
    const subjTopics = db.prepare('SELECT id FROM topics WHERE is_published = 1 AND (subject_id = ? OR (subject_id IS NULL AND ? = \'subj_cim10_default\'))').all(s.id, s.id) as Array<{ id: string }>;
    const totalSubjTopics = subjTopics.length;

    let completedSubjTopics = 0;
    for (const st of subjTopics) {
      const avail = (db.prepare('SELECT COUNT(*) as c FROM topic_summaries WHERE topic_id = ?').get(st.id) as any)?.c || 0;
      const read = (db.prepare('SELECT COUNT(*) as c FROM topic_study_progress WHERE user_id = ? AND topic_id = ? AND completed = 1').get(userId, st.id) as any)?.c || 0;
      if (avail > 0 && read >= avail) completedSubjTopics++;
    }

    // Attempts for subject
    const directAttempts = db.prepare('SELECT score FROM test_attempts WHERE user_id = ? AND (subject_id = ? OR (subject_id IS NULL AND ? = \'subj_cim10_default\'))').all(userId, s.id, s.id) as Array<{ score: number }>;
    const topicSubjAttempts = db.prepare(`
      SELECT tta.score 
      FROM topic_test_attempts tta 
      JOIN topics t ON tta.topic_id = t.id 
      WHERE tta.user_id = ? AND (tta.subject_id = ? OR t.subject_id = ? OR (tta.subject_id IS NULL AND ? = \'subj_cim10_default\'))
    `).all(userId, s.id, s.id, s.id) as Array<{ score: number }>;

    const allSubjScores = [...directAttempts.map((d) => d.score), ...topicSubjAttempts.map((t) => t.score)];
    const totalTests = allSubjScores.length;
    const avgSubjScore = totalTests > 0
      ? Math.round((allSubjScores.reduce((acc, val) => acc + val, 0) / totalTests) * 10) / 10
      : 0;

    return {
      id: s.id,
      code: s.code,
      name: s.name,
      color: s.color || '#2563eb',
      icon: s.icon || 'book',
      totalTopics: totalSubjTopics,
      completedTopics: completedSubjTopics,
      totalTests,
      averageScore: avgSubjScore,
    };
  });

  // 4. Priority Reinforcements
  const priorityReinforcements: StudentLearningMetrics['priorityReinforcements'] = [];
  for (const tp of topicsPerformance) {
    if (tp.status === 'need_reinforcement') {
      let reason = 'Progreso de estudio o rendimiento inferior al umbral recomendado.';
      let recommendation = 'Revisar resúmenes teóricos y realizar el examen de autoevaluación.';
      if (tp.studyPercentage < 30) {
        reason = `Solo has completado el ${tp.studyPercentage}% de la lectura guiada.`;
        recommendation = 'Accede a la sección de Temario y marca los conceptos clave estudiados.';
      } else if (tp.attemptsCount > 0 && tp.averageScore < 5.0) {
        reason = `Calificación media de ${tp.averageScore}/10 en evaluaciones realizadas.`;
        recommendation = 'Repasa las reglas clínicas del tema y ejercita la práctica activa.';
      }
      priorityReinforcements.push({
        topicTitle: tp.title,
        reason,
        recommendation,
      });
    }
  }

  if (priorityReinforcements.length === 0 && topicsPerformance.length > 0) {
    const nextTopic = topicsPerformance.find((t) => t.studyPercentage < 100) || topicsPerformance[0];
    priorityReinforcements.push({
      topicTitle: nextTopic.title,
      reason: 'Ritmo de aprendizaje excelente. Mantén tu regularidad.',
      recommendation: `Continúa avanzando en "${nextTopic.title}" para consolidar tu certificación.`,
    });
  }

  return {
    totalTopics,
    totalSummariesRead,
    totalSummariesAvailable,
    globalStudyPercentage,
    totalTestsTaken,
    averageScore,
    chronologicalCurve,
    topicsPerformance,
    priorityReinforcements: priorityReinforcements.slice(0, 3),
    subjects: subjectsBreakdown,
    selectedSubjectId: effectiveSubjectFilter || 'all',
  };
}
