export type UserRole = 'student' | 'admin';
export type StudentStatus = 'active' | 'inactive';

export interface User {
  id: string;
  username: string;
  fullName: string;
  dniNie: string; // Validated Spanish DNI or NIE
  email: string;
  phone?: string;
  academicGroup: string; // e.g. "DAS 26/27 - Grupo A"
  role: UserRole;
  courseId: string; // e.g. "DAS-26-27"
  status: StudentStatus; // 'active' | 'inactive'
  enrolledAt: string;
  unregisteredAt?: string;
  createdAt: string;
  canSwitchRole?: boolean;
  activeRole?: UserRole;
  mustChangePassword?: boolean;
}

export interface AcademicCourse {
  id: string; // e.g. "DAS-26-27"
  name: string; // e.g. "Promoción 2026/2027 · DAS"
  isCurrent: boolean;
  startDate: string;
  endDate?: string;
  description?: string;
  createdAt: string;
  studentCount?: number;
}

export type ServiceArea =
  | 'atencion_primaria'
  | 'urgencias'
  | 'especializada_medica'
  | 'especializada_quirurgica'
  | 'laboratorio_ap'
  | 'salud_mental'
  | 'simulacro_integral';

export interface CIM10Code {
  id: string;
  code: string;
  description: string;
  chapter: string;
  category: string;
  subcategory?: string;
  includesNotes?: string;
  excludes1Notes?: string;
  excludes2Notes?: string;
  rulesNotes?: string;
  lateralitySeventhChar?: string;
  isBillable: boolean;
}

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  code: string;
  text: string;
}

export interface ReasonedResolution {
  clinicalAnalysis: string;
  cim10Path: string;
  ruleCheck: string;
  distractorExplanations: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export interface Question {
  id: string;
  discipline: ServiceArea;
  level: number; // 1 to 5
  caseTitle: string;
  clinicalScenario: string;
  serviceContext: string;
  patientAge?: string;
  patientGender?: string;
  options: QuestionOption[];
  correctOptionId: 'A' | 'B' | 'C' | 'D';
  reasonedResolution: ReasonedResolution;
  errorCategory: 'jerarquia_diagnostica' | 'normativa_excluye' | 'especificidad_lateralidad' | 'codigos_combinados' | 'manifestacion_etiologia';
  batchId?: string;
  academicYear?: string;
}

export interface TestAttempt {
  id: string;
  userId: string;
  discipline: ServiceArea;
  level: number;
  score: number; // 0 to 100
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds: number;
  passed: boolean; // >= 80% (lv 1-2) or >= 85% (lv 3-5)
  createdAt: string;
}

export interface AttemptDetail {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  question: Question;
}

export interface DisciplineProgress {
  id: string;
  userId: string;
  discipline: ServiceArea;
  currentLevel: number;
  highestUnlockedLevel: number;
  attemptsCount: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  averageScore: number;
  lastScore: number;
  updatedAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  authorName: string;
  isPinned: boolean;
  createdAt: string;
}

export interface StudentReport {
  id: string;
  studentId: string;
  studentName?: string;
  studentDni?: string;
  authorId: string;
  authorName?: string;
  title: string;
  content: string;
  strengths: string;
  weaknesses: string;
  recommendedFocus: string;
  status: 'draft' | 'sent';
  sentAt?: string;
  createdAt: string;
}

export interface GroupAnalytics {
  totalStudents: number;
  totalAttempts: number;
  overallAverage: number;
  disciplineAverages: Record<string, { avgScore: number; attempts: number }>;
  collectiveErrorCategories: Record<string, number>;
  levelDistribution: Record<number, number>;
}

export interface ActiveExam {
  id: string;
  title: string;
  discipline: ServiceArea;
  level: number; // 0 = Adaptativo IA, 1-5 = Nivel fijo
  questionCount: number;
  timeLimitMinutes: number; // 0 = Sin tiempo límite
  isActive: boolean;
  createdAt: string;
  startedAt?: string;
  endsAt?: string;
}

export type TestType = 'standard_meap' | 'reverse_coding' | 'kahoot_round' | 'adaptive' | 'repaso' | 'adaptive_ai' | 'review';
export type TestStatus = 'prepared' | 'live' | 'scheduled' | 'closed';

export interface ManagedTest {
  id: string;
  code: string; // Direct session code, e.g. "C10-842"
  courseId: string; // e.g. "DAS-26-27"
  title: string;
  testType: TestType;
  discipline: ServiceArea;
  level: number; // 0=Adaptive, 1-5=Levels
  questionCount: number; // 5-50 (or 10-20 for kahoot)
  timeLimitMinutes: number; // 0=unlimited
  status: TestStatus;
  scheduledAt?: string;
  startedAt?: string;
  endsAt?: string;
  createdBy: string;
  createdAt: string;
  totalAttempts?: number;
  averageScore?: number;
}

export interface HistoricalAuditFilter {
  courseId?: string;
  discipline?: ServiceArea;
  studentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface HistoricalAttemptRecord {
  id: string;
  userId: string;
  studentName: string;
  studentDniMasked: string;
  academicGroup: string;
  courseId: string;
  testId?: string;
  testTitle?: string;
  discipline: ServiceArea;
  level: number;
  score: number;
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds: number;
  passed: boolean;
  createdAt: string;
}

export interface LiveSession {
  id: string;
  examId: string;
  userId: string;
  userName: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  correctCount: number;
  status: 'in_progress' | 'submitted';
  lastHeartbeat: string;
  submittedAt?: string;
}

// -------------------------------------------------------------
// CODIFICACIÓN INVERSA (AUDITORÍA Y CORRECCIÓN DE ERRORES)
// -------------------------------------------------------------

export type AuditFlawType =
  | 'lateralidad_incorrecta'
  | 'omision_complicacion'
  | 'excluye1_ignorado'
  | 'septimo_caracter_erroneo'
  | 'diagnostico_principal_mal_asignado'
  | 'especificidad_insuficiente';

export interface ReverseCodingCase {
  id: string;
  discipline: ServiceArea;
  level: number;
  caseTitle: string;
  clinicalScenario: string;
  serviceContext: string;
  initialProposedCode: string;
  initialProposedDescription: string;
  auditFlawType: AuditFlawType;
  auditFlawHint?: string;
  options: QuestionOption[];
  correctOptionId: 'A' | 'B' | 'C' | 'D';
  reasonedResolution: {
    flawDetected: string;
    clinicalAnalysis: string;
    cim10Path: string;
    ruleCheck: string;
    distractorExplanations: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
  };
}

// -------------------------------------------------------------
// MODO RONDA TIPO KAHOOT (10 A 20 PREGUNTAS + PODIO)
// -------------------------------------------------------------

export interface KahootRoundConfig {
  title: string;
  discipline: ServiceArea;
  questionCount: number; // 10 to 20 strictly validated
  timePerQuestionSeconds: number; // default 25s
}

export interface KahootParticipant {
  id: string;
  name: string;
  avatarSeed?: string;
  score: number;
  correctAnswers: number;
  streak: number;
  lastAnswerTime?: number;
  isCurrentUser?: boolean;
}

export interface KahootRoundResult {
  id: string;
  roundId: string;
  userId: string;
  userName: string;
  academicGroup: string;
  totalQuestions: number;
  correctCount: number;
  totalScore: number;
  rankPosition: number;
  streakMax: number;
  createdAt: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  eventType: string;
  severity: 'INFO' | 'WARN' | 'WARNING' | 'CRITICAL';
  route?: string;
  ipHash?: string;
  ipAddress?: string;
  userAgentSummary?: string;
  userId?: string;
  details: string;
  createdAt?: string;
}

export interface SecurityKPIs {
  blocks401_403: number;
  loginFailuresRateLimit: number;
  idorPrivilegeEscalation: number;
  criticalAlerts: number;
  rgpdActions: number;
  totalEvents: number;
}

export interface SecurityAlertChannelsStatus {
  emailConfigured: boolean;
  telegramConfigured: boolean;
  webhookConfigured: boolean;
  channelsCount: number;
  lastAlertTimestamp?: string;
}

export interface SecurityEnvironmentStatus {
  dataEncryptionKeyConfigured: boolean;
  sessionSecretConfigured: boolean;
  headersConfigured: {
    hsts: boolean;
    csp: boolean;
    xFrameOptions: boolean;
    nosniff: boolean;
  };
  region: string;
  isEuSovereign: boolean;
  databaseEngine: string;
  aiPromptSanitizationActive: boolean;
  globalSessionVersion: number;
  alertChannels: SecurityAlertChannelsStatus;
}

// -------------------------------------------------------------
// CHAT DE AULA Y COMUNICACIÓN DOCENTE
// -------------------------------------------------------------

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  courseId: string;
  isAnnouncementOnly: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'admin';
  userAvatarSeed?: string;
  content: string;
  isPinned: boolean;
  isHidden: boolean;
  hiddenBy?: string;
  createdAt: string;
}

export interface SecurityTimelineBucket {
  period: string; // e.g. "14:00" or "2026-11-24"
  label: string;
  total: number;
  critical: number;
  warn: number;
  info: number;
}

export interface SecurityOverviewResponse {
  globalStatus: 'NORMAL' | 'VIGILANCIA' | 'ALERTA CRÍTICA';
  kpis24h: SecurityKPIs;
  kpis7d: SecurityKPIs;
  environment: SecurityEnvironmentStatus;
  timeDistribution: SecurityTimelineBucket[];
  recentLogs: SecurityAuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

