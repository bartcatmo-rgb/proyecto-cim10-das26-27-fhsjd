import { getDb } from './index';
import {
  User,
  CIM10Code,
  Question,
  TestAttempt,
  AttemptDetail,
  DisciplineProgress,
  Notice,
  StudentReport,
  ServiceArea,
  ActiveExam,
  LiveSession,
  ReverseCodingCase,
  KahootRoundResult,
  AcademicCourse,
  ManagedTest,
  TestType,
  TestStatus,
  HistoricalAuditFilter,
  HistoricalAttemptRecord,
} from '@/types';
import { maskDni } from '../auth/crypto';
import crypto from 'crypto';

// -------------------------------------------------------------
// USER QUERIES
// -------------------------------------------------------------

export function getUserByUsername(username: string): (User & { passwordHash: string; passwordSalt: string }) | null {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)')
    .get(username.trim()) as any;

  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    dniNie: row.dni_nie,
    email: row.email,
    phone: row.phone || undefined,
    academicGroup: row.academic_group,
    role: row.role as 'student' | 'admin',
    courseId: row.course_id || 'DAS-26-27',
    status: (row.status || 'active') as 'active' | 'inactive',
    enrolledAt: row.enrolled_at || row.created_at,
    unregisteredAt: row.unregistered_at || undefined,
    createdAt: row.created_at,
    canSwitchRole: Boolean(row.can_switch_role),
    mustChangePassword: Boolean(row.must_change_password),
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
  };
}

export function getUserById(id: string): User | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    dniNie: row.dni_nie,
    email: row.email,
    phone: row.phone || undefined,
    academicGroup: row.academic_group,
    role: row.role as 'student' | 'admin',
    courseId: row.course_id || 'DAS-26-27',
    status: (row.status || 'active') as 'active' | 'inactive',
    enrolledAt: row.enrolled_at || row.created_at,
    unregisteredAt: row.unregistered_at || undefined,
    createdAt: row.created_at,
    canSwitchRole: Boolean(row.can_switch_role),
    mustChangePassword: Boolean(row.must_change_password),
  };
}

export function getUserByDni(dniNie: string): User | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE UPPER(dni_nie) = UPPER(?)').get(dniNie.trim()) as any;
  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    dniNie: row.dni_nie,
    email: row.email,
    phone: row.phone || undefined,
    academicGroup: row.academic_group,
    role: row.role as 'student' | 'admin',
    courseId: row.course_id || 'DAS-26-27',
    status: (row.status || 'active') as 'active' | 'inactive',
    enrolledAt: row.enrolled_at || row.created_at,
    unregisteredAt: row.unregistered_at || undefined,
    createdAt: row.created_at,
    canSwitchRole: Boolean(row.can_switch_role),
    mustChangePassword: Boolean(row.must_change_password),
  };
}

export function updateUserPassword(userId: string, passwordHash: string, passwordSalt: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE users
    SET password_hash = ?, password_salt = ?, must_change_password = 0
    WHERE id = ?
  `).run(passwordHash, passwordSalt, userId);
}

export function logSecurityEvent(event: {
  eventType: string;
  ipAddress?: string;
  userId?: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
}): void {
  try {
    const db = getDb();
    const id = `sec_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    db.prepare(`
      INSERT INTO security_audit_logs (id, timestamp, event_type, ip_address, user_id, severity, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      new Date().toISOString(),
      event.eventType,
      event.ipAddress || null,
      event.userId || null,
      event.severity || 'INFO',
      event.details.substring(0, 500)
    );
  } catch (err) {
    console.warn('Failed to log security event:', err);
  }
}

export function getSecurityAuditLogs(limit = 100): any[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM security_audit_logs ORDER BY timestamp DESC LIMIT ?
  `).all(limit) as any[];

  return rows.map((r) => ({
    id: r.id,
    timestamp: r.timestamp,
    eventType: r.event_type,
    ipAddress: r.ip_address || undefined,
    userId: r.user_id || undefined,
    severity: r.severity as 'INFO' | 'WARNING' | 'CRITICAL',
    details: r.details,
  }));
}



export function createUser(userData: {
  username: string;
  passwordHash: string;
  passwordSalt: string;
  fullName: string;
  dniNie: string;
  email: string;
  phone?: string;
  academicGroup: string;
  role?: 'student' | 'admin';
  courseId?: string;
}): User {
  const db = getDb();
  const id = `usr_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const role = userData.role || 'student';
  const courseId = userData.courseId || 'DAS-26-27';

  db.prepare(`
    INSERT INTO users (id, username, password_hash, password_salt, full_name, dni_nie, email, phone, academic_group, role, course_id, status, enrolled_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `).run(
    id,
    userData.username.trim().toLowerCase(),
    userData.passwordHash,
    userData.passwordSalt,
    userData.fullName.trim(),
    userData.dniNie.trim().toUpperCase(),
    userData.email.trim().toLowerCase(),
    userData.phone ? userData.phone.trim() : null,
    userData.academicGroup.trim(),
    role,
    courseId,
    now,
    now
  );

  return {
    id,
    username: userData.username.trim().toLowerCase(),
    fullName: userData.fullName.trim(),
    dniNie: userData.dniNie.trim().toUpperCase(),
    email: userData.email.trim().toLowerCase(),
    phone: userData.phone ? userData.phone.trim() : undefined,
    academicGroup: userData.academicGroup.trim(),
    role,
    courseId,
    status: 'active',
    enrolledAt: now,
    createdAt: now,
  };
}

export function updateUserProfile(
  id: string,
  data: { fullName?: string; email?: string; phone?: string; academicGroup?: string }
): void {
  const db = getDb();
  const updates: string[] = [];
  const params: any[] = [];

  if (data.fullName !== undefined) {
    updates.push('full_name = ?');
    params.push(data.fullName.trim());
  }
  if (data.email !== undefined) {
    updates.push('email = ?');
    params.push(data.email.trim().toLowerCase());
  }
  if (data.phone !== undefined) {
    updates.push('phone = ?');
    params.push(data.phone.trim());
  }
  if (data.academicGroup !== undefined) {
    updates.push('academic_group = ?');
    params.push(data.academicGroup.trim());
  }

  if (updates.length === 0) return;

  params.push(id);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
}

export function getAllStudents(mask: boolean = true, courseId?: string): Array<User & { maskedDni: string; totalAttempts: number; avgScore: number }> {
  const db = getDb();
  let sql = `
    SELECT u.*, 
      COUNT(t.id) as total_attempts, 
      COALESCE(AVG(t.score), 0) as avg_score
    FROM users u
    LEFT JOIN test_attempts t ON u.id = t.user_id
    WHERE u.role = 'student'
  `;
  const params: any[] = [];

  if (courseId && courseId !== 'ALL') {
    sql += ' AND u.course_id = ?';
    params.push(courseId);
  }

  sql += `
    GROUP BY u.id
    ORDER BY u.full_name ASC
  `;

  const rows = db.prepare(sql).all(...params) as any[];

  return rows.map((r) => ({
    id: r.id,
    username: r.username,
    fullName: r.full_name,
    dniNie: mask ? maskDni(r.dni_nie) : r.dni_nie,
    maskedDni: maskDni(r.dni_nie),
    email: r.email,
    phone: r.phone || undefined,
    academicGroup: r.academic_group,
    role: r.role as 'student' | 'admin',
    courseId: r.course_id || 'DAS-26-27',
    status: (r.status || 'active') as 'active' | 'inactive',
    enrolledAt: r.enrolled_at || r.created_at,
    unregisteredAt: r.unregistered_at || undefined,
    createdAt: r.created_at,
    totalAttempts: Number(r.total_attempts || 0),
    avgScore: Math.round(Number(r.avg_score || 0) * 10) / 10,
  }));
}

// -------------------------------------------------------------
// CIM-10 CATALOG QUERIES
// -------------------------------------------------------------

export function searchCim10Codes(query?: string, chapter?: string, limit: number = 50): CIM10Code[] {
  const db = getDb();
  let sql = 'SELECT * FROM cim10_codes WHERE 1=1';
  const params: any[] = [];

  if (chapter && chapter.trim()) {
    sql += ' AND chapter LIKE ?';
    params.push(`%${chapter.trim()}%`);
  }

  if (query && query.trim()) {
    const q = `%${query.trim()}%`;
    sql += ' AND (code LIKE ? OR description LIKE ? OR includes_notes LIKE ? OR rules_notes LIKE ?)';
    params.push(q, q, q, q);
  }

  sql += ' ORDER BY code ASC LIMIT ?';
  params.push(limit);

  const rows = db.prepare(sql).all(...params) as any[];

  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    description: r.description,
    chapter: r.chapter,
    category: r.category,
    subcategory: r.subcategory || undefined,
    includesNotes: r.includes_notes || undefined,
    excludes1Notes: r.excludes1_notes || undefined,
    excludes2Notes: r.excludes2_notes || undefined,
    rulesNotes: r.rules_notes || undefined,
    lateralitySeventhChar: r.laterality_seventh_char || undefined,
    isBillable: Boolean(r.is_billable),
  }));
}

export function bulkInsertCim10Codes(codes: Omit<CIM10Code, 'id'>[]): { inserted: number; errors: number } {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO cim10_codes (id, code, description, chapter, category, subcategory, includes_notes, excludes1_notes, excludes2_notes, rules_notes, laterality_seventh_char, is_billable, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(code) DO UPDATE SET
      description = excluded.description,
      chapter = excluded.chapter,
      category = excluded.category,
      subcategory = excluded.subcategory,
      includes_notes = excluded.includes_notes,
      excludes1_notes = excluded.excludes1_notes,
      excludes2_notes = excluded.excludes2_notes,
      rules_notes = excluded.rules_notes,
      laterality_seventh_char = excluded.laterality_seventh_char,
      is_billable = excluded.is_billable
  `);

  let inserted = 0;
  let errors = 0;

  const tx = db.transaction(() => {
    for (const c of codes) {
      try {
        const id = `c10_${crypto.randomUUID().slice(0, 8)}`;
        insert.run(
          id,
          c.code.trim().toUpperCase(),
          c.description.trim(),
          c.chapter.trim(),
          c.category.trim().toUpperCase(),
          c.subcategory ? c.subcategory.trim().toUpperCase() : null,
          c.includesNotes ? c.includesNotes.trim() : null,
          c.excludes1Notes ? c.excludes1Notes.trim() : null,
          c.excludes2Notes ? c.excludes2Notes.trim() : null,
          c.rulesNotes ? c.rulesNotes.trim() : null,
          c.lateralitySeventhChar ? c.lateralitySeventhChar.trim() : null,
          c.isBillable ? 1 : 0,
          new Date().toISOString()
        );
        inserted++;
      } catch {
        errors++;
      }
    }
  });

  tx();
  return { inserted, errors };
}

// -------------------------------------------------------------
// QUESTIONS & TEST REVIEWS
// -------------------------------------------------------------

function mapQuestionRow(r: any): Question {
  let parsedOptions: any = [];
  try {
    parsedOptions = JSON.parse(r.options_json);
  } catch {
    parsedOptions = [];
  }

  let parsedDistractors: any = {};
  try {
    parsedDistractors = JSON.parse(r.distractor_explanations_json);
  } catch {
    parsedDistractors = {};
  }

  return {
    id: r.id,
    discipline: r.discipline as ServiceArea,
    level: Number(r.level),
    caseTitle: r.case_title,
    clinicalScenario: r.clinical_scenario,
    serviceContext: r.service_context,
    patientAge: r.patient_age || undefined,
    patientGender: r.patient_gender || undefined,
    options: parsedOptions,
    correctOptionId: r.correct_option_id as 'A' | 'B' | 'C' | 'D',
    reasonedResolution: {
      clinicalAnalysis: r.clinical_analysis,
      cim10Path: r.cim10_path,
      ruleCheck: r.rule_check,
      distractorExplanations: parsedDistractors,
    },
    errorCategory: r.error_category,
    batchId: r.batch_id || 'seed_initial',
    academicYear: r.academic_year || 'DAS-26-27',
  };
}

export function insertCustomQuestion(data: Omit<Question, 'id'> & { id?: string; batchId?: string; academicYear?: string }): Question {
  const db = getDb();
  const id = data.id || `q_custom_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO questions (
      id, discipline, level, case_title, clinical_scenario, service_context,
      patient_age, patient_gender, options_json, correct_option_id,
      clinical_analysis, cim10_path, rule_check, distractor_explanations_json,
      error_category, batch_id, academic_year, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.discipline,
    data.level,
    data.caseTitle,
    data.clinicalScenario,
    data.serviceContext,
    data.patientAge || null,
    data.patientGender || null,
    JSON.stringify(data.options),
    data.correctOptionId,
    data.reasonedResolution.clinicalAnalysis,
    data.reasonedResolution.cim10Path,
    data.reasonedResolution.ruleCheck,
    JSON.stringify(data.reasonedResolution.distractorExplanations),
    data.errorCategory || 'jerarquia_diagnostica',
    data.batchId || 'profesor_manual',
    data.academicYear || 'DAS-26-27',
    now
  );

  return {
    ...data,
    id,
    batchId: data.batchId || 'profesor_manual',
    academicYear: data.academicYear || 'DAS-26-27',
  };
}

export function getQuestionBatches(academicYear?: string): { batchId: string; academicYear: string; count: number }[] {
  const db = getDb();
  let sql = 'SELECT batch_id, academic_year, COUNT(*) as count FROM questions';
  const params: any[] = [];
  if (academicYear && academicYear !== 'ALL') {
    sql += ' WHERE academic_year = ?';
    params.push(academicYear);
  }
  sql += ' GROUP BY batch_id, academic_year ORDER BY batch_id ASC';

  const rows = db.prepare(sql).all(...params) as any[];
  return rows.map((r) => ({
    batchId: r.batch_id,
    academicYear: r.academic_year,
    count: r.count,
  }));
}

export function getManagedTestAnswerKey(testIdOrCode: string) {
  const test = getManagedTestByIdOrCode(testIdOrCode);
  if (!test) return null;

  const db = getDb();
  let questions: any[] = [];
  if (test.testType === 'reverse_coding') {
    questions = getReverseCodingCases(test.discipline, test.questionCount || 10);
  } else if (test.testType === 'kahoot_round') {
    questions = getKahootQuestions(test.discipline, test.questionCount || 10);
  } else {
    questions = getQuestionsByDisciplineAndLevel(test.discipline, test.level, test.questionCount || 10);
  }

  const answerKey = questions.map((q, idx) => {
    const correctOpt = q.options?.find((o: any) => o.id === q.correctOptionId);
    return {
      index: idx + 1,
      questionId: q.id,
      caseTitle: q.caseTitle,
      correctOptionId: q.correctOptionId,
      correctCode: correctOpt?.code || '',
      correctDescription: correctOpt?.text || '',
      reasonedResolution: q.reasonedResolution,
    };
  });

  return {
    test,
    totalQuestions: answerKey.length,
    answerKey,
  };
}

export function getQuestionsByDisciplineAndLevel(discipline: ServiceArea, level: number, limit: number = 10): Question[] {
  const db = getDb();
  let sql = 'SELECT * FROM questions WHERE level = ?';
  const params: any[] = [level];

  if (discipline === 'simulacro_integral') {
    // Combined all disciplines
    sql += ' ORDER BY RANDOM() LIMIT ?';
    params.push(limit);
  } else {
    sql += ' AND discipline = ? ORDER BY RANDOM() LIMIT ?';
    params.splice(1, 0, discipline);
    params.push(limit);
  }

  const rows = db.prepare(sql).all(...params) as any[];
  return rows.map(mapQuestionRow);
}

export function getAllQuestions(): Question[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM questions ORDER BY discipline ASC, level ASC').all() as any[];
  return rows.map(mapQuestionRow);
}

export function getQuestionById(id: string): Question | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM questions WHERE id = ?').get(id) as any;
  if (!row) return null;
  return mapQuestionRow(row);
}

export function getFailedQuestionsForStudent(userId: string, limit: number = 15): Question[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT DISTINCT q.*
    FROM attempt_details ad
    JOIN test_attempts ta ON ad.attempt_id = ta.id
    JOIN questions q ON ad.question_id = q.id
    WHERE ta.user_id = ? AND ad.is_correct = 0
    ORDER BY RANDOM()
    LIMIT ?
  `).all(userId, limit) as any[];

  return rows.map(mapQuestionRow);
}

export function bulkInsertQuestions(questions: Omit<Question, 'id'>[]): { inserted: number; errors: number } {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO questions (id, discipline, level, case_title, clinical_scenario, service_context, patient_age, patient_gender, options_json, correct_option_id, clinical_analysis, cim10_path, rule_check, distractor_explanations_json, error_category, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let inserted = 0;
  let errors = 0;

  const tx = db.transaction(() => {
    for (const q of questions) {
      try {
        const id = `q_${crypto.randomUUID().slice(0, 8)}`;
        insert.run(
          id,
          q.discipline,
          q.level,
          q.caseTitle.trim(),
          q.clinicalScenario.trim(),
          q.serviceContext.trim(),
          q.patientAge ? q.patientAge.trim() : null,
          q.patientGender ? q.patientGender.trim() : null,
          JSON.stringify(q.options),
          q.correctOptionId,
          q.reasonedResolution.clinicalAnalysis.trim(),
          q.reasonedResolution.cim10Path.trim(),
          q.reasonedResolution.ruleCheck.trim(),
          JSON.stringify(q.reasonedResolution.distractorExplanations),
          q.errorCategory,
          new Date().toISOString()
        );
        inserted++;
      } catch {
        errors++;
      }
    }
  });

  tx();
  return { inserted, errors };
}

// -------------------------------------------------------------
// ATOMIC TRANSACTIONS: ATTEMPTS & PROGRESS
// -------------------------------------------------------------

export interface SubmitAttemptInput {
  userId: string;
  discipline: ServiceArea;
  level: number;
  timeSpentSeconds: number;
  answers: Array<{ questionId: string; selectedOptionId: string }>;
  courseId?: string;
  testId?: string;
}

export function saveTestAttemptTx(input: SubmitAttemptInput): {
  attemptId: string;
  score: number;
  passed: boolean;
  unlockedNewLevel: boolean;
  correctCount: number;
  totalQuestions: number;
} {
  const db = getDb();

  // 1. Fetch questions to score answers
  const qMap = new Map<string, Question>();
  for (const ans of input.answers) {
    const q = getQuestionById(ans.questionId);
    if (q) {
      qMap.set(ans.questionId, q);
    } else {
      const rev = getReverseCodingCaseById(ans.questionId);
      if (rev) {
        qMap.set(ans.questionId, {
          id: rev.id,
          discipline: rev.discipline,
          level: rev.level,
          caseTitle: rev.caseTitle,
          clinicalScenario: rev.clinicalScenario,
          serviceContext: rev.serviceContext,
          options: rev.options,
          correctOptionId: rev.correctOptionId,
          reasonedResolution: {
            clinicalAnalysis: `${rev.reasonedResolution.flawDetected} - ${rev.reasonedResolution.clinicalAnalysis}`,
            cim10Path: rev.reasonedResolution.cim10Path,
            ruleCheck: rev.reasonedResolution.ruleCheck,
            distractorExplanations: rev.reasonedResolution.distractorExplanations,
          },
          errorCategory: rev.auditFlawType === 'lateralidad_incorrecta' || rev.auditFlawType === 'septimo_caracter_erroneo'
            ? 'especificidad_lateralidad'
            : rev.auditFlawType === 'excluye1_ignorado'
            ? 'normativa_excluye'
            : rev.auditFlawType === 'diagnostico_principal_mal_asignado'
            ? 'jerarquia_diagnostica'
            : 'codigos_combinados',
        });
      }
    }
  }

  let correctCount = 0;
  const totalQuestions = input.answers.length;
  const evaluatedDetails: Array<{
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    snapshot: Question;
  }> = [];

  for (const ans of input.answers) {
    const q = qMap.get(ans.questionId);
    if (!q) continue;

    const isCorrect = ans.selectedOptionId === q.correctOptionId;
    if (isCorrect) correctCount++;

    evaluatedDetails.push({
      questionId: ans.questionId,
      selectedOptionId: ans.selectedOptionId,
      isCorrect,
      snapshot: q,
    });
  }

  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100 * 10) / 10 : 0;
  const passThreshold = input.level <= 2 ? 80 : 85;
  const passed = score >= passThreshold;

  const attemptId = `att_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  let unlockedNewLevel = false;

  const userRow = db.prepare('SELECT course_id FROM users WHERE id = ?').get(input.userId) as any;
  const courseId = input.courseId || userRow?.course_id || 'DAS-26-27';

  const tx = db.transaction(() => {
    // Insert attempt record with course_id and test_id
    db.prepare(`
      INSERT INTO test_attempts (id, user_id, course_id, test_id, discipline, level, score, total_questions, correct_count, time_spent_seconds, passed, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      attemptId,
      input.userId,
      courseId,
      input.testId || null,
      input.discipline,
      input.level,
      score,
      totalQuestions,
      correctCount,
      input.timeSpentSeconds,
      passed ? 1 : 0,
      now
    );

    // Insert attempt details
    const insertDetail = db.prepare(`
      INSERT INTO attempt_details (id, attempt_id, question_id, selected_option_id, is_correct, question_snapshot_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const d of evaluatedDetails) {
      insertDetail.run(
        `det_${crypto.randomUUID()}`,
        attemptId,
        d.questionId,
        d.selectedOptionId,
        d.isCorrect ? 1 : 0,
        JSON.stringify(d.snapshot)
      );
    }

    // Update or insert discipline progress
    const existingProgress = db.prepare(`
      SELECT * FROM discipline_progress WHERE user_id = ? AND discipline = ?
    `).get(input.userId, input.discipline) as any;

    if (!existingProgress) {
      let highestUnlocked = 1;
      if (passed && input.level < 5) {
        highestUnlocked = input.level + 1;
        unlockedNewLevel = true;
      }
      db.prepare(`
        INSERT INTO discipline_progress (id, user_id, discipline, current_level, highest_unlocked_level, attempts_count, total_questions_answered, total_correct, average_score, last_score, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `prog_${crypto.randomUUID()}`,
        input.userId,
        input.discipline,
        input.level,
        highestUnlocked,
        1,
        totalQuestions,
        correctCount,
        score,
        score,
        now
      );
    } else {
      const attemptsCount = existingProgress.attempts_count + 1;
      const totalQ = existingProgress.total_questions_answered + totalQuestions;
      const totalC = existingProgress.total_correct + correctCount;
      const avgScore = totalQ > 0 ? Math.round((totalC / totalQ) * 100 * 10) / 10 : score;

      let highestUnlocked = existingProgress.highest_unlocked_level;
      if (passed && input.level === highestUnlocked && highestUnlocked < 5) {
        highestUnlocked = highestUnlocked + 1;
        unlockedNewLevel = true;
      }

      db.prepare(`
        UPDATE discipline_progress
        SET current_level = ?,
            highest_unlocked_level = ?,
            attempts_count = ?,
            total_questions_answered = ?,
            total_correct = ?,
            average_score = ?,
            last_score = ?,
            updated_at = ?
        WHERE user_id = ? AND discipline = ?
      `).run(
        input.level,
        highestUnlocked,
        attemptsCount,
        totalQ,
        totalC,
        avgScore,
        score,
        now,
        input.userId,
        input.discipline
      );
    }
  });

  tx();

  return {
    attemptId,
    score,
    passed,
    unlockedNewLevel,
    correctCount,
    totalQuestions,
  };
}

export function getAttemptById(attemptId: string): {
  attempt: TestAttempt;
  details: AttemptDetail[];
} | null {
  const db = getDb();
  const attRow = db.prepare('SELECT * FROM test_attempts WHERE id = ?').get(attemptId) as any;
  if (!attRow) return null;

  const attempt: TestAttempt = {
    id: attRow.id,
    userId: attRow.user_id,
    discipline: attRow.discipline as ServiceArea,
    level: Number(attRow.level),
    score: Number(attRow.score),
    totalQuestions: Number(attRow.total_questions),
    correctCount: Number(attRow.correct_count),
    timeSpentSeconds: Number(attRow.time_spent_seconds),
    passed: Boolean(attRow.passed),
    createdAt: attRow.created_at,
  };

  const detailRows = db.prepare('SELECT * FROM attempt_details WHERE attempt_id = ?').all(attemptId) as any[];
  const details: AttemptDetail[] = detailRows.map((dr) => {
    let question: Question;
    try {
      question = JSON.parse(dr.question_snapshot_json);
    } catch {
      question = getQuestionById(dr.question_id)!;
    }

    return {
      id: dr.id,
      attemptId: dr.attempt_id,
      questionId: dr.question_id,
      selectedOptionId: dr.selected_option_id,
      isCorrect: Boolean(dr.is_correct),
      question,
    };
  });

  return { attempt, details };
}

export function getStudentAttempts(userId: string, limit: number = 50): TestAttempt[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM test_attempts WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
  `).all(userId, limit) as any[];

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    discipline: r.discipline as ServiceArea,
    level: Number(r.level),
    score: Number(r.score),
    totalQuestions: Number(r.total_questions),
    correctCount: Number(r.correct_count),
    timeSpentSeconds: Number(r.time_spent_seconds),
    passed: Boolean(r.passed),
    createdAt: r.created_at,
  }));
}

export function getStudentDisciplineProgress(userId: string): Record<ServiceArea, DisciplineProgress> {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM discipline_progress WHERE user_id = ?').all(userId) as any[];

  const result: any = {};
  for (const r of rows) {
    result[r.discipline] = {
      id: r.id,
      userId: r.user_id,
      discipline: r.discipline as ServiceArea,
      currentLevel: Number(r.current_level),
      highestUnlockedLevel: Number(r.highest_unlocked_level),
      attemptsCount: Number(r.attempts_count),
      totalQuestionsAnswered: Number(r.total_questions_answered),
      totalCorrect: Number(r.total_correct),
      averageScore: Number(r.average_score),
      lastScore: Number(r.last_score),
      updatedAt: r.updated_at,
    };
  }

  return result;
}

// -------------------------------------------------------------
// ERROR SYNTHESIS & ANALYTICS
// -------------------------------------------------------------

export interface ErrorSynthesis {
  totalMistakes: number;
  byCategory: Record<string, number>;
  byDiscipline: Record<string, number>;
  topMissedQuestions: Array<{ questionId: string; caseTitle: string; errorCount: number; discipline: string }>;
}

export function getStudentErrorSynthesis(userId: string): ErrorSynthesis {
  const db = getDb();
  const details = db.prepare(`
    SELECT ad.*, ta.discipline as att_discipline
    FROM attempt_details ad
    JOIN test_attempts ta ON ad.attempt_id = ta.id
    WHERE ta.user_id = ? AND ad.is_correct = 0
  `).all(userId) as any[];

  const byCategory: Record<string, number> = {};
  const byDiscipline: Record<string, number> = {};
  const missedCount = new Map<string, { count: number; title: string; discipline: string }>();

  for (const d of details) {
    let q: Question | null = null;
    try {
      q = JSON.parse(d.question_snapshot_json);
    } catch {
      q = getQuestionById(d.question_id);
    }

    const cat = q ? q.errorCategory : 'otros';
    byCategory[cat] = (byCategory[cat] || 0) + 1;

    const disc = d.att_discipline || (q ? q.discipline : 'simulacro_integral');
    byDiscipline[disc] = (byDiscipline[disc] || 0) + 1;

    if (q) {
      const existing = missedCount.get(q.id) || { count: 0, title: q.caseTitle, discipline: disc };
      existing.count++;
      missedCount.set(q.id, existing);
    }
  }

  const topMissedQuestions = Array.from(missedCount.entries())
    .map(([qId, val]) => ({
      questionId: qId,
      caseTitle: val.title,
      errorCount: val.count,
      discipline: val.discipline,
    }))
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 5);

  return {
    totalMistakes: details.length,
    byCategory,
    byDiscipline,
    topMissedQuestions,
  };
}

export interface GroupAnalytics {
  totalStudents: number;
  totalAttempts: number;
  overallAverage: number;
  disciplineAverages: Record<string, { avgScore: number; attempts: number }>;
  collectiveErrorCategories: Record<string, number>;
  levelDistribution: Record<number, number>;
}

export function getGroupAnalytics(courseId?: string): GroupAnalytics {
  const db = getDb();
  const filterByCourse = Boolean(courseId && courseId !== 'ALL');

  let studentSql = "SELECT COUNT(*) as c FROM users WHERE role = 'student'";
  let studentParams: any[] = [];
  if (filterByCourse) {
    studentSql += " AND course_id = ?";
    studentParams.push(courseId);
  }
  const studentCount = (db.prepare(studentSql).get(...studentParams) as any).c;

  let attemptSql = 'SELECT COUNT(*) as c FROM test_attempts';
  let attemptParams: any[] = [];
  if (filterByCourse) {
    attemptSql += ' WHERE course_id = ?';
    attemptParams.push(courseId);
  }
  const attemptsCount = (db.prepare(attemptSql).get(...attemptParams) as any).c;

  let avgSql = 'SELECT COALESCE(AVG(score), 0) as avg FROM test_attempts';
  let avgParams: any[] = [];
  if (filterByCourse) {
    avgSql += ' WHERE course_id = ?';
    avgParams.push(courseId);
  }
  const overallAvgRow = db.prepare(avgSql).get(...avgParams) as any;
  const overallAverage = Math.round(Number(overallAvgRow.avg) * 10) / 10;

  // Discipline averages
  let discSql = `
    SELECT discipline, AVG(score) as avg_score, COUNT(id) as count
    FROM test_attempts
  `;
  let discParams: any[] = [];
  if (filterByCourse) {
    discSql += ' WHERE course_id = ?';
    discParams.push(courseId);
  }
  discSql += ' GROUP BY discipline';

  const discRows = db.prepare(discSql).all(...discParams) as any[];

  const disciplineAverages: Record<string, { avgScore: number; attempts: number }> = {};
  for (const dr of discRows) {
    disciplineAverages[dr.discipline] = {
      avgScore: Math.round(Number(dr.avg_score) * 10) / 10,
      attempts: Number(dr.count),
    };
  }

  // Collective error categories
  let errSql = `
    SELECT ad.question_snapshot_json
    FROM attempt_details ad
  `;
  let errParams: any[] = [];
  if (filterByCourse) {
    errSql += ' JOIN test_attempts ta ON ad.attempt_id = ta.id WHERE ad.is_correct = 0 AND ta.course_id = ?';
    errParams.push(courseId);
  } else {
    errSql += ' WHERE ad.is_correct = 0';
  }
  errSql += ' LIMIT 200';

  const errRows = db.prepare(errSql).all(...errParams) as any[];

  const collectiveErrorCategories: Record<string, number> = {};
  for (const er of errRows) {
    try {
      const q: Question = JSON.parse(er.question_snapshot_json);
      const cat = q.errorCategory || 'jerarquia_diagnostica';
      collectiveErrorCategories[cat] = (collectiveErrorCategories[cat] || 0) + 1;
    } catch {
      // ignore
    }
  }

  // Highest unlocked level distribution across active progress
  let lvlSql = `
    SELECT dp.highest_unlocked_level, COUNT(*) as c
    FROM discipline_progress dp
  `;
  let lvlParams: any[] = [];
  if (filterByCourse) {
    lvlSql += ' JOIN users u ON dp.user_id = u.id WHERE u.course_id = ?';
    lvlParams.push(courseId);
  }
  lvlSql += ' GROUP BY dp.highest_unlocked_level';

  const lvlRows = db.prepare(lvlSql).all(...lvlParams) as any[];

  const levelDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const lr of lvlRows) {
    levelDistribution[lr.highest_unlocked_level] = Number(lr.c);
  }

  return {
    totalStudents: Number(studentCount),
    totalAttempts: Number(attemptsCount),
    overallAverage,
    disciplineAverages,
    collectiveErrorCategories,
    levelDistribution,
  };
}

// -------------------------------------------------------------
// NOTICES & REPORTS
// -------------------------------------------------------------

export function getNotices(): Notice[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM notices ORDER BY is_pinned DESC, created_at DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    authorName: r.author_name,
    isPinned: Boolean(r.is_pinned),
    createdAt: r.created_at,
  }));
}

export function createNotice(notice: Omit<Notice, 'id' | 'createdAt'>): Notice {
  const db = getDb();
  const id = `not_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO notices (id, title, content, author_name, is_pinned, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, notice.title.trim(), notice.content.trim(), notice.authorName.trim(), notice.isPinned ? 1 : 0, now);

  return {
    id,
    title: notice.title.trim(),
    content: notice.content.trim(),
    authorName: notice.authorName.trim(),
    isPinned: notice.isPinned,
    createdAt: now,
  };
}

export function getStudentReports(studentId: string): StudentReport[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT sr.*, u.full_name as author_name, s.full_name as student_name, s.dni_nie as student_dni
    FROM student_reports sr
    JOIN users u ON sr.author_id = u.id
    JOIN users s ON sr.student_id = s.id
    WHERE sr.student_id = ?
    ORDER BY sr.created_at DESC
  `).all(studentId) as any[];

  return rows.map((r) => ({
    id: r.id,
    studentId: r.student_id,
    studentName: r.student_name,
    studentDni: maskDni(r.student_dni),
    authorId: r.author_id,
    authorName: r.author_name,
    title: r.title,
    content: r.content,
    strengths: r.strengths,
    weaknesses: r.weaknesses,
    recommendedFocus: r.recommended_focus,
    status: r.status as 'draft' | 'sent',
    sentAt: r.sent_at || undefined,
    createdAt: r.created_at,
  }));
}

export function createStudentReport(report: Omit<StudentReport, 'id' | 'createdAt'>): StudentReport {
  const db = getDb();
  const id = `rep_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO student_reports (id, student_id, author_id, title, content, strengths, weaknesses, recommended_focus, status, sent_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    report.studentId,
    report.authorId,
    report.title.trim(),
    report.content.trim(),
    report.strengths.trim(),
    report.weaknesses.trim(),
    report.recommendedFocus.trim(),
    report.status,
    report.sentAt || now,
    now
  );

  return {
    id,
    ...report,
    createdAt: now,
  };
}

// -------------------------------------------------------------
// BACKUP & RESTORE
// -------------------------------------------------------------

export function exportFullBackupJson(): object {
  const db = getDb();
  return {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    app: 'AulaCIM-10 · FHSJD (DAS 26/27)',
    users: db.prepare('SELECT * FROM users').all(),
    cim10_codes: db.prepare('SELECT * FROM cim10_codes').all(),
    questions: db.prepare('SELECT * FROM questions').all(),
    test_attempts: db.prepare('SELECT * FROM test_attempts').all(),
    attempt_details: db.prepare('SELECT * FROM attempt_details').all(),
    discipline_progress: db.prepare('SELECT * FROM discipline_progress').all(),
    notices: db.prepare('SELECT * FROM notices').all(),
    student_reports: db.prepare('SELECT * FROM student_reports').all(),
  };
}

export function importBackupJson(data: any): { success: boolean; message: string } {
  if (!data || typeof data !== 'object') {
    return { success: false, message: 'Formato de copia de seguridad no válido.' };
  }

  const db = getDb();
  try {
    const tx = db.transaction(() => {
      // Import users if present
      if (Array.isArray(data.users)) {
        const insertUser = db.prepare(`
          INSERT INTO users (id, username, password_hash, password_salt, full_name, dni_nie, email, phone, academic_group, role, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            full_name = excluded.full_name,
            email = excluded.email,
            phone = excluded.phone,
            academic_group = excluded.academic_group,
            role = excluded.role
        `);
        for (const u of data.users) {
          insertUser.run(u.id, u.username, u.password_hash, u.password_salt, u.full_name, u.dni_nie, u.email, u.phone, u.academic_group, u.role, u.created_at);
        }
      }

      // Import test_attempts if present
      if (Array.isArray(data.test_attempts)) {
        const insertAttempt = db.prepare(`
          INSERT INTO test_attempts (id, user_id, discipline, level, score, total_questions, correct_count, time_spent_seconds, passed, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO NOTHING
        `);
        for (const a of data.test_attempts) {
          insertAttempt.run(a.id, a.user_id, a.discipline, a.level, a.score, a.total_questions, a.correct_count, a.time_spent_seconds, a.passed, a.created_at);
        }
      }

      // Import discipline_progress if present
      if (Array.isArray(data.discipline_progress)) {
        const insertProg = db.prepare(`
          INSERT INTO discipline_progress (id, user_id, discipline, current_level, highest_unlocked_level, attempts_count, total_questions_answered, total_correct, average_score, last_score, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, discipline) DO UPDATE SET
            current_level = excluded.current_level,
            highest_unlocked_level = excluded.highest_unlocked_level,
            attempts_count = excluded.attempts_count,
            total_questions_answered = excluded.total_questions_answered,
            total_correct = excluded.total_correct,
            average_score = excluded.average_score,
            last_score = excluded.last_score,
            updated_at = excluded.updated_at
        `);
        for (const p of data.discipline_progress) {
          insertProg.run(p.id, p.user_id, p.discipline, p.current_level, p.highest_unlocked_level, p.attempts_count, p.total_questions_answered, p.total_correct, p.average_score, p.last_score, p.updated_at);
        }
      }
    });

    tx();
    return { success: true, message: 'Copia de seguridad restaurada correctamente con éxito.' };
  } catch (err: any) {
    return { success: false, message: `Error al restaurar copia: ${err.message}` };
  }
}

// -------------------------------------------------------------
// ACTIVE EXAMS & CLASSROOM LIVE MONITOR QUERIES
// -------------------------------------------------------------

export function getActiveExam(): ActiveExam | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM active_exams WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1').get() as any;
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    discipline: row.discipline as ServiceArea,
    level: row.level,
    questionCount: row.question_count,
    timeLimitMinutes: row.time_limit_minutes,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    startedAt: row.started_at || undefined,
    endsAt: row.ends_at || undefined,
  };
}

export function setActiveExam(data: {
  title: string;
  discipline: ServiceArea;
  level: number;
  questionCount: number;
  timeLimitMinutes: number;
}): ActiveExam {
  const db = getDb();
  const id = `exam_${crypto.randomUUID()}`;
  const now = new Date();
  const createdAt = now.toISOString();
  const startedAt = now.toISOString();
  let endsAt: string | undefined = undefined;

  if (data.timeLimitMinutes > 0) {
    const ends = new Date(now.getTime() + data.timeLimitMinutes * 60 * 1000);
    endsAt = ends.toISOString();
  }

  const tx = db.transaction(() => {
    // 1. Deactivate all existing active exams
    db.prepare('UPDATE active_exams SET is_active = 0 WHERE is_active = 1').run();

    // 2. Insert new active exam
    db.prepare(`
      INSERT INTO active_exams (id, title, discipline, level, question_count, time_limit_minutes, is_active, created_at, started_at, ends_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `).run(
      id,
      data.title,
      data.discipline,
      data.level,
      data.questionCount,
      data.timeLimitMinutes,
      createdAt,
      startedAt,
      endsAt || null
    );
  });

  tx();

  return {
    id,
    title: data.title,
    discipline: data.discipline,
    level: data.level,
    questionCount: data.questionCount,
    timeLimitMinutes: data.timeLimitMinutes,
    isActive: true,
    createdAt,
    startedAt,
    endsAt,
  };
}

export function deactivateExam(examId?: string): boolean {
  const db = getDb();
  if (examId) {
    const res = db.prepare('UPDATE active_exams SET is_active = 0 WHERE id = ?').run(examId);
    return res.changes > 0;
  }
  const res = db.prepare('UPDATE active_exams SET is_active = 0 WHERE is_active = 1').run();
  return res.changes > 0;
}

export function upsertLiveSession(data: {
  examId: string;
  userId: string;
  userName: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  correctCount: number;
  status: 'in_progress' | 'submitted';
}): void {
  const db = getDb();
  const now = new Date().toISOString();
  const id = `sess_${data.examId}_${data.userId}`;

  db.prepare(`
    INSERT INTO live_sessions (id, exam_id, user_id, user_name, current_question_index, total_questions, correct_count, status, last_heartbeat, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      current_question_index = excluded.current_question_index,
      total_questions = excluded.total_questions,
      correct_count = excluded.correct_count,
      status = excluded.status,
      last_heartbeat = excluded.last_heartbeat,
      submitted_at = CASE WHEN excluded.status = 'submitted' AND live_sessions.submitted_at IS NULL THEN excluded.last_heartbeat ELSE live_sessions.submitted_at END
  `).run(
    id,
    data.examId,
    data.userId,
    data.userName,
    data.currentQuestionIndex,
    data.totalQuestions,
    data.correctCount,
    data.status,
    now,
    data.status === 'submitted' ? now : null
  );
}

export function getLiveSessions(examId?: string): LiveSession[] {
  const db = getDb();
  let query = 'SELECT * FROM live_sessions';
  const params: any[] = [];

  if (examId) {
    query += ' WHERE exam_id = ?';
    params.push(examId);
  }
  query += ' ORDER BY status ASC, current_question_index DESC, last_heartbeat DESC';

  const rows = db.prepare(query).all(...params) as any[];

  return rows.map(r => ({
    id: r.id,
    examId: r.exam_id,
    userId: r.user_id,
    userName: r.user_name,
    currentQuestionIndex: r.current_question_index,
    totalQuestions: r.total_questions,
    correctCount: r.correct_count,
    status: r.status as 'in_progress' | 'submitted',
    lastHeartbeat: r.last_heartbeat,
    submittedAt: r.submitted_at || undefined,
  }));
}

export function getLiveMonitorSummary(): {
  activeExam: ActiveExam | null;
  sessions: LiveSession[];
  totalConnected: number;
  completedCount: number;
  classAverage: number;
  errorRadar: Record<string, number>;
} {
  const activeExam = getActiveExam();
  if (!activeExam) {
    return {
      activeExam: null,
      sessions: [],
      totalConnected: 0,
      completedCount: 0,
      classAverage: 0,
      errorRadar: {},
    };
  }

  const sessions = getLiveSessions(activeExam.id);
  const totalConnected = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'submitted');
  const completedCount = completedSessions.length;

  let classAverage = 0;
  if (completedSessions.length > 0) {
    const totalPct = completedSessions.reduce((acc, s) => acc + (s.correctCount / s.totalQuestions) * 100, 0);
    classAverage = Math.round(totalPct / completedSessions.length);
  }

  const db = getDb();
  const errorRows = db.prepare(`
    SELECT ad.error_category, COUNT(*) as count
    FROM attempt_details ad
    JOIN test_attempts ta ON ad.attempt_id = ta.id
    WHERE ta.discipline = ? AND ad.is_correct = 0
    GROUP BY ad.error_category
    ORDER BY count DESC
  `).all(activeExam.discipline) as any[];

  const errorRadar: Record<string, number> = {};
  for (const r of errorRows) {
    errorRadar[r.error_category] = r.count;
  }

  return {
    activeExam,
    sessions,
    totalConnected,
    completedCount,
    classAverage,
    errorRadar,
  };
}

// -------------------------------------------------------------
// CODIFICACIÓN INVERSA (AUDITORÍA Y CORRECCIÓN DE ERRORES)
// -------------------------------------------------------------

function mapReverseCodingRow(r: any): ReverseCodingCase {
  let parsedOptions: any = [];
  try {
    parsedOptions = JSON.parse(r.options_json);
  } catch {
    parsedOptions = [];
  }

  let parsedDistractors: any = {};
  try {
    parsedDistractors = JSON.parse(r.distractor_explanations_json);
  } catch {
    parsedDistractors = {};
  }

  return {
    id: r.id,
    discipline: r.discipline as ServiceArea,
    level: Number(r.level),
    caseTitle: r.case_title,
    clinicalScenario: r.clinical_scenario,
    serviceContext: r.service_context,
    initialProposedCode: r.initial_proposed_code,
    initialProposedDescription: r.initial_proposed_description,
    auditFlawType: r.audit_flaw_type,
    auditFlawHint: r.audit_flaw_hint || undefined,
    options: parsedOptions,
    correctOptionId: r.correct_option_id as 'A' | 'B' | 'C' | 'D',
    reasonedResolution: {
      flawDetected: r.flaw_detected,
      clinicalAnalysis: r.clinical_analysis,
      cim10Path: r.cim10_path,
      ruleCheck: r.rule_check,
      distractorExplanations: parsedDistractors,
    },
  };
}

export function getReverseCodingCases(discipline?: ServiceArea, limit: number = 10): ReverseCodingCase[] {
  const db = getDb();
  let query = 'SELECT * FROM reverse_coding_cases';
  const params: any[] = [];

  if (discipline && discipline !== 'simulacro_integral') {
    query += ' WHERE discipline = ?';
    params.push(discipline);
  }

  query += ' ORDER BY RANDOM() LIMIT ?';
  params.push(limit);

  const rows = db.prepare(query).all(...params) as any[];
  return rows.map(mapReverseCodingRow);
}

export function getReverseCodingCaseById(id: string): ReverseCodingCase | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM reverse_coding_cases WHERE id = ?').get(id) as any;
  if (!row) return null;
  return mapReverseCodingRow(row);
}

// -------------------------------------------------------------
// MODO RONDA TIPO KAHOOT (10 A 20 PREGUNTAS + PODIO)
// -------------------------------------------------------------

export function getKahootQuestions(discipline?: ServiceArea, count: number = 10): Question[] {
  // Strictly enforce 10 to 20 questions
  const safeCount = Math.max(10, Math.min(20, count || 10));
  const db = getDb();
  let sql = 'SELECT * FROM questions';
  const params: any[] = [];

  if (discipline && discipline !== 'simulacro_integral') {
    sql += ' WHERE discipline = ?';
    params.push(discipline);
  }

  sql += ' ORDER BY RANDOM() LIMIT ?';
  params.push(safeCount);

  const rows = db.prepare(sql).all(...params) as any[];
  return rows.map(mapQuestionRow);
}

export function saveKahootResult(resultData: {
  roundId: string;
  userId: string;
  userName: string;
  academicGroup: string;
  discipline: ServiceArea;
  totalQuestions: number;
  correctCount: number;
  totalScore: number;
  rankPosition: number;
  streakMax: number;
}): KahootRoundResult {
  const db = getDb();
  const id = `kres_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO kahoot_results (
      id, round_id, user_id, user_name, academic_group, discipline,
      total_questions, correct_count, total_score, rank_position, streak_max, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    resultData.roundId,
    resultData.userId,
    resultData.userName,
    resultData.academicGroup,
    resultData.discipline,
    resultData.totalQuestions,
    resultData.correctCount,
    resultData.totalScore,
    resultData.rankPosition,
    resultData.streakMax,
    now
  );

  return {
    id,
    roundId: resultData.roundId,
    userId: resultData.userId,
    userName: resultData.userName,
    academicGroup: resultData.academicGroup,
    totalQuestions: resultData.totalQuestions,
    correctCount: resultData.correctCount,
    totalScore: resultData.totalScore,
    rankPosition: resultData.rankPosition,
    streakMax: resultData.streakMax,
    createdAt: now,
  };
}

export function getKahootLeaderboard(roundId?: string, limit: number = 10): KahootRoundResult[] {
  const db = getDb();
  let query = 'SELECT * FROM kahoot_results';
  const params: any[] = [];

  if (roundId) {
    query += ' WHERE round_id = ?';
    params.push(roundId);
  }

  query += ' ORDER BY total_score DESC, correct_count DESC, created_at DESC LIMIT ?';
  params.push(limit);

  const rows = db.prepare(query).all(...params) as any[];
  return rows.map((r: any) => ({
    id: r.id,
    roundId: r.round_id,
    userId: r.user_id,
    userName: r.user_name,
    academicGroup: r.academic_group,
    totalQuestions: r.total_questions,
    correctCount: r.correct_count,
    totalScore: r.total_score,
    rankPosition: r.rank_position,
    streakMax: r.streak_max,
    createdAt: r.created_at,
  }));
}

export function getStudentKahootHistory(userId: string): KahootRoundResult[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM kahoot_results
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  `).all(userId) as any[];

  return rows.map((r: any) => ({
    id: r.id,
    roundId: r.round_id,
    userId: r.user_id,
    userName: r.user_name,
    academicGroup: r.academic_group,
    totalQuestions: r.total_questions,
    correctCount: r.correct_count,
    totalScore: r.total_score,
    rankPosition: r.rank_position,
    streakMax: r.streak_max,
    createdAt: r.created_at,
  }));
}

// -------------------------------------------------------------
// GESTIÓN DE CURSOS / PROMOCIONES ACADÉMICAS
// -------------------------------------------------------------

export function getAcademicCourses(): AcademicCourse[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT c.*, COUNT(u.id) as student_count
    FROM academic_courses c
    LEFT JOIN users u ON c.id = u.course_id AND u.role = 'student'
    GROUP BY c.id
    ORDER BY c.is_current DESC, c.start_date DESC
  `).all() as any[];

  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    isCurrent: Boolean(r.is_current),
    startDate: r.start_date,
    endDate: r.end_date || undefined,
    createdAt: r.created_at,
    studentCount: Number(r.student_count || 0),
  }));
}

export function createAcademicCourse(data: {
  id: string;
  name: string;
  isCurrent?: boolean;
  startDate?: string;
  endDate?: string;
  description?: string;
}): AcademicCourse {
  const db = getDb();
  const now = new Date().toISOString();
  const startDate = data.startDate || now;
  const isCurrent = Boolean(data.isCurrent);

  const tx = db.transaction(() => {
    if (isCurrent) {
      db.prepare('UPDATE academic_courses SET is_current = 0').run();
    }
    db.prepare(`
      INSERT INTO academic_courses (id, name, is_current, start_date, end_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      data.id.trim().toUpperCase(),
      data.name.trim(),
      isCurrent ? 1 : 0,
      startDate,
      data.endDate || null,
      now
    );
  });

  tx();

  return {
    id: data.id.trim().toUpperCase(),
    name: data.name.trim(),
    isCurrent,
    startDate,
    endDate: data.endDate,
    description: data.description,
    createdAt: now,
    studentCount: 0,
  };
}

export function updateStudentStatus(userId: string, status: 'active' | 'inactive'): boolean {
  const db = getDb();
  const unreg = status === 'inactive' ? new Date().toISOString() : null;
  const res = db.prepare(`
    UPDATE users SET status = ?, unregistered_at = ?
    WHERE id = ? AND role = 'student'
  `).run(status, unreg, userId);
  return res.changes > 0;
}

export function getStudentsByCourse(
  courseId: string,
  statusFilter?: 'active' | 'inactive'
): Array<User & { maskedDni: string; totalAttempts: number; avgScore: number }> {
  const db = getDb();
  let sql = `
    SELECT u.*, 
      COUNT(t.id) as total_attempts, 
      COALESCE(AVG(t.score), 0) as avg_score
    FROM users u
    LEFT JOIN test_attempts t ON u.id = t.user_id
    WHERE u.role = 'student' AND (u.course_id = ? OR ? = 'all')
  `;
  const params: any[] = [courseId, courseId];

  if (statusFilter) {
    sql += ' AND u.status = ?';
    params.push(statusFilter);
  }

  sql += ' GROUP BY u.id ORDER BY u.status ASC, u.full_name ASC';

  const rows = db.prepare(sql).all(...params) as any[];

  return rows.map((r) => ({
    id: r.id,
    username: r.username,
    fullName: r.full_name,
    dniNie: maskDni(r.dni_nie),
    maskedDni: maskDni(r.dni_nie),
    email: r.email,
    phone: r.phone || undefined,
    academicGroup: r.academic_group,
    role: r.role as 'student' | 'admin',
    courseId: r.course_id || 'DAS-26-27',
    status: (r.status || 'active') as 'active' | 'inactive',
    enrolledAt: r.enrolled_at || r.created_at,
    unregisteredAt: r.unregistered_at || undefined,
    createdAt: r.created_at,
    totalAttempts: Number(r.total_attempts || 0),
    avgScore: Math.round(Number(r.avg_score || 0) * 10) / 10,
  }));
}

// -------------------------------------------------------------
// REPOSITORIO HISTÓRICO Y AUDITORÍA POR CURSO
// -------------------------------------------------------------

export function getHistoricalAudits(filter: HistoricalAuditFilter): HistoricalAttemptRecord[] {
  const db = getDb();
  let sql = `
    SELECT 
      t.id, t.user_id, t.course_id, t.test_id, t.discipline, t.level, 
      t.score, t.total_questions, t.correct_count, t.time_spent_seconds, 
      t.passed, t.created_at,
      u.full_name as student_name, u.dni_nie as student_dni, u.academic_group,
      mt.title as test_title
    FROM test_attempts t
    JOIN users u ON t.user_id = u.id
    LEFT JOIN managed_tests mt ON (t.test_id = mt.id OR t.test_id = mt.code)
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filter.courseId && filter.courseId !== 'all') {
    sql += ' AND t.course_id = ?';
    params.push(filter.courseId);
  }

  if (filter.discipline && filter.discipline !== 'simulacro_integral') {
    sql += ' AND t.discipline = ?';
    params.push(filter.discipline);
  }

  if (filter.studentId) {
    sql += ' AND t.user_id = ?';
    params.push(filter.studentId);
  }

  if (filter.dateFrom) {
    sql += ' AND t.created_at >= ?';
    params.push(filter.dateFrom);
  }

  if (filter.dateTo) {
    sql += ' AND t.created_at <= ?';
    params.push(filter.dateTo + 'T23:59:59');
  }

  sql += ' ORDER BY t.created_at DESC LIMIT 100';

  const rows = db.prepare(sql).all(...params) as any[];

  return rows.map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    studentName: r.student_name,
    studentDniMasked: maskDni(r.student_dni),
    academicGroup: r.academic_group,
    courseId: r.course_id || 'DAS-26-27',
    testId: r.test_id || undefined,
    testTitle: r.test_title || undefined,
    discipline: r.discipline as ServiceArea,
    level: Number(r.level),
    score: Number(r.score),
    totalQuestions: Number(r.total_questions),
    correctCount: Number(r.correct_count),
    timeSpentSeconds: Number(r.time_spent_seconds),
    passed: Boolean(r.passed),
    createdAt: r.created_at,
  }));
}

export function getCourseAuditSummary(courseId: string): {
  totalStudents: number;
  activeStudents: number;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
} {
  const db = getDb();
  const students = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
    FROM users
    WHERE role = 'student' AND (course_id = ? OR ? = 'all')
  `).get(courseId, courseId) as any;

  const attempts = db.prepare(`
    SELECT 
      COUNT(*) as total,
      COALESCE(AVG(score), 0) as avg_score,
      SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed_count
    FROM test_attempts
    WHERE (course_id = ? OR ? = 'all')
  `).get(courseId, courseId) as any;

  const totalAttempts = Number(attempts?.total || 0);
  const passRate = totalAttempts > 0 ? Math.round((Number(attempts?.passed_count || 0) / totalAttempts) * 100) : 0;

  return {
    totalStudents: Number(students?.total || 0),
    activeStudents: Number(students?.active || 0),
    totalAttempts,
    averageScore: Math.round(Number(attempts?.avg_score || 0) * 10) / 10,
    passRate,
  };
}

// -------------------------------------------------------------
// GESTOR UNIFICADO DE PRUEBAS Y ENLACE DIRECTO DE SESIÓN
// -------------------------------------------------------------

function mapManagedTestRow(r: any): ManagedTest {
  return {
    id: r.id,
    code: r.code,
    courseId: r.course_id,
    title: r.title,
    testType: r.test_type as TestType,
    discipline: r.discipline as ServiceArea,
    level: Number(r.level),
    questionCount: Number(r.question_count),
    timeLimitMinutes: Number(r.time_limit_minutes),
    status: r.status as TestStatus,
    scheduledAt: r.scheduled_at || undefined,
    startedAt: r.started_at || undefined,
    endsAt: r.ends_at || undefined,
    createdBy: r.created_by,
    createdAt: r.created_at,
    totalAttempts: r.total_attempts !== undefined ? Number(r.total_attempts) : undefined,
    averageScore: r.avg_score !== undefined ? Math.round(Number(r.avg_score) * 10) / 10 : undefined,
  };
}

export function getManagedTests(courseId?: string, status?: TestStatus): ManagedTest[] {
  const db = getDb();
  let sql = `
    SELECT mt.*, 
      COUNT(t.id) as total_attempts, 
      COALESCE(AVG(t.score), 0) as avg_score
    FROM managed_tests mt
    LEFT JOIN test_attempts t ON (mt.id = t.test_id OR mt.code = t.test_id)
    WHERE 1=1
  `;
  const params: any[] = [];

  if (courseId && courseId !== 'all') {
    sql += ' AND mt.course_id = ?';
    params.push(courseId);
  }

  if (status) {
    sql += ' AND mt.status = ?';
    params.push(status);
  }

  sql += ' GROUP BY mt.id ORDER BY CASE mt.status WHEN "live" THEN 1 WHEN "scheduled" THEN 2 WHEN "prepared" THEN 3 ELSE 4 END, mt.created_at DESC';

  const rows = db.prepare(sql).all(...params) as any[];
  return rows.map(mapManagedTestRow);
}

export function getManagedTestByIdOrCode(identifier: string): ManagedTest | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT mt.*, 
      COUNT(t.id) as total_attempts, 
      COALESCE(AVG(t.score), 0) as avg_score
    FROM managed_tests mt
    LEFT JOIN test_attempts t ON (mt.id = t.test_id OR mt.code = t.test_id)
    WHERE mt.id = ? OR UPPER(mt.code) = UPPER(?)
    GROUP BY mt.id
  `).get(identifier, identifier.trim()) as any;

  if (!row) return null;
  return mapManagedTestRow(row);
}

export function getActiveLiveTest(courseId?: string): ManagedTest | null {
  const db = getDb();
  let sql = `
    SELECT * FROM managed_tests 
    WHERE status = 'live'
  `;
  const params: any[] = [];

  if (courseId && courseId !== 'all') {
    sql += ' AND (course_id = ? OR course_id = "DAS-26-27")';
    params.push(courseId);
  }

  sql += ' ORDER BY started_at DESC, created_at DESC LIMIT 1';

  const row = db.prepare(sql).get(...params) as any;
  if (!row) return null;
  return mapManagedTestRow(row);
}

export function createManagedTest(data: {
  title: string;
  code?: string;
  courseId?: string;
  testType: TestType;
  discipline: ServiceArea;
  level: number;
  questionCount: number;
  timeLimitMinutes: number;
  status: TestStatus;
  scheduledAt?: string;
  createdBy: string;
}): ManagedTest {
  const db = getDb();
  const id = `test_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date();
  const code = (data.code && data.code.trim()) ? data.code.trim().toUpperCase() : `C10-${Math.floor(100 + Math.random() * 900)}`;
  const courseId = data.courseId || 'DAS-26-27';

  let startedAt: string | null = null;
  let endsAt: string | null = null;

  if (data.status === 'live') {
    startedAt = now.toISOString();
    if (data.timeLimitMinutes > 0) {
      endsAt = new Date(now.getTime() + data.timeLimitMinutes * 60 * 1000).toISOString();
    }
  }

  const tx = db.transaction(() => {
    if (data.status === 'live') {
      db.prepare("UPDATE managed_tests SET status = 'closed' WHERE status = 'live' AND course_id = ?").run(courseId);
      db.prepare("UPDATE active_exams SET is_active = 0 WHERE is_active = 1").run();
      db.prepare(`
        INSERT INTO active_exams (id, title, discipline, level, question_count, time_limit_minutes, is_active, created_at, started_at, ends_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      `).run(
        id,
        data.title,
        data.discipline,
        data.level,
        data.questionCount,
        data.timeLimitMinutes,
        now.toISOString(),
        startedAt,
        endsAt
      );
    }

    db.prepare(`
      INSERT INTO managed_tests (
        id, code, course_id, title, test_type, discipline, level,
        question_count, time_limit_minutes, status, scheduled_at, started_at, ends_at, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      code,
      courseId,
      data.title.trim(),
      data.testType,
      data.discipline,
      data.level,
      data.questionCount,
      data.timeLimitMinutes,
      data.status,
      data.scheduledAt || null,
      startedAt,
      endsAt,
      data.createdBy,
      now.toISOString()
    );
  });

  tx();

  return {
    id,
    code,
    courseId,
    title: data.title.trim(),
    testType: data.testType,
    discipline: data.discipline,
    level: data.level,
    questionCount: data.questionCount,
    timeLimitMinutes: data.timeLimitMinutes,
    status: data.status,
    scheduledAt: data.scheduledAt,
    startedAt: startedAt || undefined,
    endsAt: endsAt || undefined,
    createdBy: data.createdBy,
    createdAt: now.toISOString(),
  };
}

export function updateManagedTestStatus(testId: string, status: TestStatus): boolean {
  const db = getDb();
  const test = getManagedTestByIdOrCode(testId);
  if (!test) return false;

  const now = new Date();
  let startedAt = test.startedAt || null;
  let endsAt = test.endsAt || null;

  if (status === 'live') {
    startedAt = now.toISOString();
    if (test.timeLimitMinutes > 0) {
      endsAt = new Date(now.getTime() + test.timeLimitMinutes * 60 * 1000).toISOString();
    }
  }

  const tx = db.transaction(() => {
    if (status === 'live') {
      db.prepare("UPDATE managed_tests SET status = 'closed' WHERE status = 'live' AND course_id = ?").run(test.courseId);
      db.prepare("UPDATE active_exams SET is_active = 0 WHERE is_active = 1").run();
      db.prepare(`
        INSERT INTO active_exams (id, title, discipline, level, question_count, time_limit_minutes, is_active, created_at, started_at, ends_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      `).run(
        test.id,
        test.title,
        test.discipline,
        test.level,
        test.questionCount,
        test.timeLimitMinutes,
        now.toISOString(),
        startedAt,
        endsAt
      );
    } else if (status === 'closed') {
      db.prepare("UPDATE active_exams SET is_active = 0 WHERE id = ?").run(test.id);
    }

    db.prepare(`
      UPDATE managed_tests 
      SET status = ?, started_at = ?, ends_at = ?
      WHERE id = ?
    `).run(status, startedAt, endsAt, test.id);
  });

  tx();
  return true;
}

export function getCourseCompletedTests(
  courseId: string,
  userId: string
): Array<ManagedTest & { userScore?: number; userPassed?: boolean; attemptId?: string; attemptedAt?: string }> {
  const db = getDb();
  const rows = db.prepare(`
    SELECT mt.*, 
      t.id as attempt_id,
      t.score as user_score,
      t.passed as user_passed,
      t.created_at as attempted_at
    FROM managed_tests mt
    LEFT JOIN test_attempts t ON (mt.id = t.test_id OR mt.code = t.test_id) AND t.user_id = ?
    WHERE mt.course_id = ? OR mt.course_id = 'DAS-26-27'
    ORDER BY mt.created_at DESC
  `).all(userId, courseId) as any[];

  return rows.map((r: any) => ({
    ...mapManagedTestRow(r),
    attemptId: r.attempt_id || undefined,
    userScore: r.user_score !== null ? Number(r.user_score) : undefined,
    userPassed: r.user_passed !== null ? Boolean(r.user_passed) : undefined,
    attemptedAt: r.attempted_at || undefined,
  }));
}

// -------------------------------------------------------------
// EXPORTACIÓN E IMPORTACIÓN DE PROGRESO PERSONAL DEL ALUMNO
// -------------------------------------------------------------

export function getStudentProgressBackup(userId: string) {
  const db = getDb();
  const attempts = db.prepare('SELECT * FROM test_attempts WHERE user_id = ?').all(userId) as any[];
  const attemptIds = attempts.map((a) => a.id);

  let details: any[] = [];
  if (attemptIds.length > 0) {
    const placeholders = attemptIds.map(() => '?').join(',');
    details = db.prepare(`SELECT * FROM attempt_details WHERE attempt_id IN (${placeholders})`).all(...attemptIds) as any[];
  }

  const progress = db.prepare('SELECT * FROM discipline_progress WHERE user_id = ?').all(userId) as any[];
  const kahoot = db.prepare('SELECT * FROM kahoot_results WHERE user_id = ?').all(userId) as any[];

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    userId,
    attempts,
    details,
    progress,
    kahoot,
  };
}

export function importStudentProgressBackup(userId: string, data: any): { success: boolean; message: string } {
  if (!data || !Array.isArray(data.attempts)) {
    return { success: false, message: 'Estructura de respaldo de progreso no válida.' };
  }

  const db = getDb();
  const tx = db.transaction(() => {
    // 1. Insert attempts
    const insertAttempt = db.prepare(`
      INSERT OR IGNORE INTO test_attempts (id, user_id, course_id, test_id, discipline, level, score, total_questions, correct_count, time_spent_seconds, passed, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const a of data.attempts) {
      insertAttempt.run(
        a.id,
        userId,
        a.course_id || 'DAS-26-27',
        a.test_id || null,
        a.discipline,
        a.level,
        a.score,
        a.total_questions,
        a.correct_count,
        a.time_spent_seconds,
        a.passed,
        a.created_at
      );
    }

    // 2. Insert details
    if (Array.isArray(data.details)) {
      const insertDetail = db.prepare(`
        INSERT OR IGNORE INTO attempt_details (id, attempt_id, question_id, selected_option_id, is_correct, question_snapshot_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const d of data.details) {
        insertDetail.run(
          d.id,
          d.attempt_id,
          d.question_id,
          d.selected_option_id,
          d.is_correct,
          d.question_snapshot_json
        );
      }
    }

    // 3. Sync or insert discipline progress
    if (Array.isArray(data.progress)) {
      const upsertProg = db.prepare(`
        INSERT INTO discipline_progress (id, user_id, discipline, current_level, highest_unlocked_level, attempts_count, total_questions_answered, total_correct, average_score, last_score, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, discipline) DO UPDATE SET
          highest_unlocked_level = MAX(discipline_progress.highest_unlocked_level, excluded.highest_unlocked_level),
          current_level = MAX(discipline_progress.current_level, excluded.current_level),
          attempts_count = discipline_progress.attempts_count + excluded.attempts_count,
          total_questions_answered = discipline_progress.total_questions_answered + excluded.total_questions_answered,
          total_correct = discipline_progress.total_correct + excluded.total_correct,
          updated_at = excluded.updated_at
      `);

      for (const p of data.progress) {
        upsertProg.run(
          p.id || `dp_${userId}_${p.discipline}`,
          userId,
          p.discipline,
          p.current_level || 1,
          p.highest_unlocked_level || 1,
          p.attempts_count || 0,
          p.total_questions_answered || 0,
          p.total_correct || 0,
          p.average_score || 0,
          p.last_score || 0,
          p.updated_at || new Date().toISOString()
        );
      }
    }
  });

  tx();
  return { success: true, message: `Progreso personal sincronizado con éxito (${data.attempts.length} intentos procesados).` };
}
