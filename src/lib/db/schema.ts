export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS academic_courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_current INTEGER NOT NULL DEFAULT 0,
  start_date TEXT NOT NULL,
  end_date TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  full_name TEXT NOT NULL,
  dni_nie TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  academic_group TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  course_id TEXT NOT NULL DEFAULT 'DAS-26-27',
  status TEXT NOT NULL DEFAULT 'active',
  enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
  unregistered_at TEXT,
  can_switch_role INTEGER NOT NULL DEFAULT 0,
  must_change_password INTEGER NOT NULL DEFAULT 0,
  dni_bindex TEXT,
  privacy_accepted_at TEXT,
  privacy_policy_version TEXT NOT NULL DEFAULT 'v1.0-2026',
  is_anonymized INTEGER NOT NULL DEFAULT 0,
  anonymized_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES academic_courses(id) ON DELETE SET DEFAULT
);

CREATE TABLE IF NOT EXISTS cim10_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  chapter TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  includes_notes TEXT,
  excludes1_notes TEXT,
  excludes2_notes TEXT,
  rules_notes TEXT,
  laterality_seventh_char TEXT,
  is_billable INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  discipline TEXT NOT NULL,
  level INTEGER NOT NULL,
  case_title TEXT NOT NULL,
  clinical_scenario TEXT NOT NULL,
  service_context TEXT NOT NULL,
  patient_age TEXT,
  patient_gender TEXT,
  options_json TEXT NOT NULL,
  correct_option_id TEXT NOT NULL,
  clinical_analysis TEXT NOT NULL,
  cim10_path TEXT NOT NULL,
  rule_check TEXT NOT NULL,
  distractor_explanations_json TEXT NOT NULL,
  error_category TEXT NOT NULL,
  batch_id TEXT NOT NULL DEFAULT 'seed_initial',
  academic_year TEXT NOT NULL DEFAULT 'DAS-26-27',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS test_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL DEFAULT 'DAS-26-27',
  test_id TEXT,
  discipline TEXT NOT NULL,
  level INTEGER NOT NULL,
  score REAL NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  passed INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attempt_details (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  selected_option_id TEXT NOT NULL,
  is_correct INTEGER NOT NULL,
  question_snapshot_json TEXT NOT NULL,
  FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS discipline_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  discipline TEXT NOT NULL,
  current_level INTEGER NOT NULL DEFAULT 1,
  highest_unlocked_level INTEGER NOT NULL DEFAULT 1,
  attempts_count INTEGER NOT NULL DEFAULT 0,
  total_questions_answered INTEGER NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,
  average_score REAL NOT NULL DEFAULT 0,
  last_score REAL NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, discipline),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS student_reports (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  strengths TEXT NOT NULL,
  weaknesses TEXT NOT NULL,
  recommended_focus TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Active exams configured by teacher ("Examen del Día")
CREATE TABLE IF NOT EXISTS active_exams (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  discipline TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  question_count INTEGER NOT NULL DEFAULT 10,
  time_limit_minutes INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  started_at TEXT,
  ends_at TEXT
);

-- Live sessions tracking real-time student exam progress in classroom
CREATE TABLE IF NOT EXISTS live_sessions (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  current_question_index INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 10,
  correct_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress',
  last_heartbeat TEXT NOT NULL,
  submitted_at TEXT,
  UNIQUE(exam_id, user_id),
  FOREIGN KEY (exam_id) REFERENCES active_exams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Codificación Inversa: Auditoría y Corrección de Errores Clínicos
CREATE TABLE IF NOT EXISTS reverse_coding_cases (
  id TEXT PRIMARY KEY,
  discipline TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  case_title TEXT NOT NULL,
  clinical_scenario TEXT NOT NULL,
  service_context TEXT NOT NULL,
  initial_proposed_code TEXT NOT NULL,
  initial_proposed_description TEXT NOT NULL,
  audit_flaw_type TEXT NOT NULL,
  audit_flaw_hint TEXT,
  options_json TEXT NOT NULL,
  correct_option_id TEXT NOT NULL,
  flaw_detected TEXT NOT NULL,
  clinical_analysis TEXT NOT NULL,
  cim10_path TEXT NOT NULL,
  rule_check TEXT NOT NULL,
  distractor_explanations_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Modo Ronda Tipo Kahoot: Registro de Torneos y Podio
CREATE TABLE IF NOT EXISTS kahoot_results (
  id TEXT PRIMARY KEY,
  round_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  academic_group TEXT,
  discipline TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  rank_position INTEGER NOT NULL,
  streak_max INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Gestor Unificado de Pruebas y Sesiones Directas de Aula
CREATE TABLE IF NOT EXISTS managed_tests (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  course_id TEXT NOT NULL DEFAULT 'DAS-26-27',
  title TEXT NOT NULL,
  test_type TEXT NOT NULL DEFAULT 'standard_meap',
  discipline TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  question_count INTEGER NOT NULL DEFAULT 10,
  time_limit_minutes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'prepared',
  scheduled_at TEXT,
  started_at TEXT,
  ends_at TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES academic_courses(id) ON DELETE CASCADE
);

-- Registro de Auditoría y Blindaje de Ciberseguridad (CISO)
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'INFO',
  route TEXT,
  ip_hash TEXT,
  ip_address TEXT,
  user_agent_summary TEXT,
  user_id TEXT,
  details TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Parámetros Globales de Seguridad y Control de Sesión
CREATE TABLE IF NOT EXISTS system_security_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Arquitectura Multi-Tema: Gestión de Temarios y Contenidos Educativos
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Documentación Sanitaria',
  is_core INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT 'folder',
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS topic_summaries (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  section_title TEXT NOT NULL,
  summary_content TEXT NOT NULL,
  key_concepts_json TEXT NOT NULL DEFAULT '[]',
  clinical_rules_json TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS topic_questions (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  title TEXT NOT NULL,
  scenario TEXT NOT NULL,
  options_json TEXT NOT NULL,
  correct_option_id TEXT NOT NULL,
  explanation TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS topic_study_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  summary_id TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 1,
  read_at TEXT NOT NULL,
  UNIQUE(user_id, topic_id, summary_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS topic_test_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'exam',
  score REAL NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  details_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- Indices for rapid querying and indexing
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_dni ON users(dni_nie);
CREATE INDEX IF NOT EXISTS idx_users_dni_bindex ON users(dni_bindex);
CREATE INDEX IF NOT EXISTS idx_users_course ON users(course_id, status);
CREATE INDEX IF NOT EXISTS idx_cim10_code ON cim10_codes(code);
CREATE INDEX IF NOT EXISTS idx_cim10_chapter ON cim10_codes(chapter);
CREATE INDEX IF NOT EXISTS idx_questions_disc_lvl ON questions(discipline, level);
CREATE INDEX IF NOT EXISTS idx_questions_batch ON questions(batch_id, academic_year);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON test_attempts(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_test_attempts_course ON test_attempts(course_id, discipline, created_at);
CREATE INDEX IF NOT EXISTS idx_attempt_details_att ON attempt_details(attempt_id);
CREATE INDEX IF NOT EXISTS idx_disc_progress_user ON discipline_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_student ON student_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_active_exams_status ON active_exams(is_active);
CREATE INDEX IF NOT EXISTS idx_live_sessions_exam ON live_sessions(exam_id);
CREATE INDEX IF NOT EXISTS idx_rev_cases_disc ON reverse_coding_cases(discipline, level);
CREATE INDEX IF NOT EXISTS idx_kahoot_results_user ON kahoot_results(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_kahoot_results_round ON kahoot_results(round_id);
CREATE INDEX IF NOT EXISTS idx_managed_tests_code ON managed_tests(code);
CREATE INDEX IF NOT EXISTS idx_managed_tests_status ON managed_tests(status, course_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON security_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON security_audit_logs(event_type, severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_sev ON security_audit_logs(event_type, severity, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_route ON security_audit_logs(route);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON security_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug);
CREATE INDEX IF NOT EXISTS idx_topics_order ON topics(sort_order, is_published);
CREATE INDEX IF NOT EXISTS idx_topic_summaries_topic ON topic_summaries(topic_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_topic_questions_topic ON topic_questions(topic_id, question_type);
CREATE INDEX IF NOT EXISTS idx_topic_study_progress_user ON topic_study_progress(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_test_attempts_user ON topic_test_attempts(user_id, topic_id, created_at);
`;
