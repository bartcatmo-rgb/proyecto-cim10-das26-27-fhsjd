import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { SCHEMA_SQL } from './schema';
import { SEED_USERS, SEED_CIM10_CODES, SEED_NOTICES } from './seed';
import { SEED_100_MEAP_QUESTIONS } from './seed-meap-100';
import { SEED_REVERSE_CODING_CASES } from './seed-reverse-coding';
import { hashPassword } from '../auth/crypto';
import { encryptField, computeBlindIndex } from '../field-crypto';
import { ensureCoreAccountsInDb } from '../auth/core-accounts';

let dbInstance: Database.Database | null = null;
let isInitialized = false;

export function getDbPath(): string {
  if (process.env.SQLITE_DB_PATH) {
    return path.resolve(process.env.SQLITE_DB_PATH);
  }
  // In serverless environments like Vercel, always use /tmp to guarantee writable SQLite storage
  if (process.env.VERCEL === '1' || process.env.VERCEL === 'true' || process.env.VERCEL) {
    return path.join('/tmp', 'cim10_centro.db');
  }
  // Default to ./data/cim10_centro.db in local/LAN mode with writability verification
  const dataDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const testFile = path.join(dataDir, `.write_check_${Date.now()}`);
    fs.writeFileSync(testFile, '1');
    fs.unlinkSync(testFile);
    return path.join(dataDir, 'cim10_centro.db');
  } catch {
    // If ./data is not writable (EROFS / permission error), automatically fallback to /tmp
    return path.join('/tmp', 'cim10_centro.db');
  }
}

export function isEphemeralEnvironment(): boolean {
  // If running on Vercel without a persistent storage volume
  return Boolean(process.env.VERCEL && !process.env.PERSISTENT_VOLUME);
}

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const dbPath = getDbPath();
  const dir = path.dirname(dbPath);

  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create database directory, falling back to /tmp if writable:', err);
  }

  try {
    dbInstance = new Database(dbPath, {
      verbose: process.env.NODE_ENV === 'development' ? undefined : undefined,
    });

    // Hardened SQLite PRAGMAs for LAN concurrency & zero loss (gracefully handle filesystems without WAL support)
    try {
      dbInstance.pragma('journal_mode = WAL');
    } catch {
      // WAL unsupported in some serverless/network mount filesystems
    }
    dbInstance.pragma('foreign_keys = ON');
    dbInstance.pragma('synchronous = NORMAL');
    dbInstance.pragma('busy_timeout = 5000');
  } catch (error) {
    // If running in a read-only or restricted serverless filesystem, fallback to in-memory
    console.warn('Local SQLite file opening error, using fallback in-memory database:', error);
    dbInstance = new Database(':memory:');
    dbInstance.pragma('foreign_keys = ON');
  }

  if (!isInitialized) {
    initDb(dbInstance);
    isInitialized = true;
  }

  return dbInstance;
}

/**
 * Strictly idempotent initialization:
 * Creates tables and indices if they do not exist.
 * Inserts seeds ONLY if tables are currently empty.
 * NEVER deletes or overwrites existing user progress, results, or data.
 */
export function initDb(db: Database.Database): void {
  // 1. Execute DDL Schema
  db.exec(SCHEMA_SQL);

  // 1b. Comprehensive idempotent schema migrations for legacy databases (zero-downtime & backward-compatible)
  try {
    const runColumnMigration = (tableName: string, colName: string, colDef: string) => {
      try {
        const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(tableName);
        if (!tableExists) return;
        const cols = (db.prepare(`PRAGMA table_info(${tableName})`).all() as any[]).map((c) => c.name.toLowerCase());
        if (!cols.includes(colName.toLowerCase())) {
          db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${colName} ${colDef}`);
        }
      } catch (err) {
        console.warn(`Migration note (${tableName}.${colName}):`, err);
      }
    };

    // Table: users
    runColumnMigration('users', 'course_id', "TEXT NOT NULL DEFAULT 'DAS-26-27'");
    runColumnMigration('users', 'status', "TEXT NOT NULL DEFAULT 'active'");
    runColumnMigration('users', 'enrolled_at', "TEXT NOT NULL DEFAULT (datetime('now'))");
    runColumnMigration('users', 'unregistered_at', 'TEXT');
    runColumnMigration('users', 'can_switch_role', 'INTEGER NOT NULL DEFAULT 0');
    runColumnMigration('users', 'must_change_password', 'INTEGER NOT NULL DEFAULT 0');
    runColumnMigration('users', 'phone', 'TEXT');
    runColumnMigration('users', 'subgroup', 'TEXT');
    runColumnMigration('users', 'dni_bindex', 'TEXT');
    runColumnMigration('users', 'privacy_accepted_at', 'TEXT');
    runColumnMigration('users', 'privacy_policy_version', "TEXT NOT NULL DEFAULT 'v1.0-2026'");
    runColumnMigration('users', 'is_anonymized', 'INTEGER NOT NULL DEFAULT 0');
    runColumnMigration('users', 'anonymized_at', 'TEXT');
    runColumnMigration('users', 'updated_at', 'TEXT');
    runColumnMigration('users', 'first_name', 'TEXT');
    runColumnMigration('users', 'last_name', 'TEXT');
    runColumnMigration('users', 'default_subject_id', "TEXT DEFAULT 'subj_cim10_default'");
    runColumnMigration('users', 'default_classroom_id', 'TEXT');

    // Table: topics
    runColumnMigration('topics', 'subject_id', "TEXT NOT NULL DEFAULT 'subj_cim10_default'");
    runColumnMigration('topics', 'classroom_id', 'TEXT');

    // Table: test_attempts
    runColumnMigration('test_attempts', 'course_id', "TEXT NOT NULL DEFAULT 'DAS-26-27'");
    runColumnMigration('test_attempts', 'test_id', 'TEXT');
    runColumnMigration('test_attempts', 'batch_id', 'TEXT');
    runColumnMigration('test_attempts', 'academic_year', "TEXT NOT NULL DEFAULT 'DAS-26-27'");
    runColumnMigration('test_attempts', 'subject_id', "TEXT NOT NULL DEFAULT 'subj_cim10_default'");
    runColumnMigration('test_attempts', 'classroom_id', 'TEXT');
    runColumnMigration('test_attempts', 'updated_at', 'TEXT');

    // Table: topic_test_attempts
    runColumnMigration('topic_test_attempts', 'subject_id', "TEXT NOT NULL DEFAULT 'subj_cim10_default'");
    runColumnMigration('topic_test_attempts', 'classroom_id', 'TEXT');

    // Table: active_exams
    runColumnMigration('active_exams', 'subject_id', "TEXT NOT NULL DEFAULT 'subj_cim10_default'");
    runColumnMigration('active_exams', 'classroom_id', 'TEXT');

    // Table: managed_tests
    runColumnMigration('managed_tests', 'course_id', "TEXT NOT NULL DEFAULT 'DAS-26-27'");
    runColumnMigration('managed_tests', 'batch_id', 'TEXT');
    runColumnMigration('managed_tests', 'academic_year', "TEXT NOT NULL DEFAULT 'DAS-26-27'");
    runColumnMigration('managed_tests', 'test_type', "TEXT NOT NULL DEFAULT 'standard_meap'");
    runColumnMigration('managed_tests', 'status', "TEXT NOT NULL DEFAULT 'prepared'");
    runColumnMigration('managed_tests', 'subject_id', "TEXT NOT NULL DEFAULT 'subj_cim10_default'");
    runColumnMigration('managed_tests', 'classroom_id', 'TEXT');
    runColumnMigration('managed_tests', 'updated_at', 'TEXT');

    // Table: reverse_coding_cases
    runColumnMigration('reverse_coding_cases', 'batch_id', "TEXT NOT NULL DEFAULT 'seed_initial'");
    runColumnMigration('reverse_coding_cases', 'academic_year', "TEXT NOT NULL DEFAULT 'DAS-26-27'");
    runColumnMigration('reverse_coding_cases', 'updated_at', 'TEXT');

    // Table: kahoot_results
    runColumnMigration('kahoot_results', 'course_id', "TEXT NOT NULL DEFAULT 'DAS-26-27'");
    runColumnMigration('kahoot_results', 'academic_year', "TEXT NOT NULL DEFAULT 'DAS-26-27'");
    runColumnMigration('kahoot_results', 'streak_max', 'INTEGER NOT NULL DEFAULT 0');

    // Table: discipline_progress
    runColumnMigration('discipline_progress', 'course_id', "TEXT NOT NULL DEFAULT 'DAS-26-27'");
    runColumnMigration('discipline_progress', 'updated_at', "TEXT NOT NULL DEFAULT (datetime('now'))");

    // Table: security_audit_logs
    runColumnMigration('security_audit_logs', 'severity', "TEXT NOT NULL DEFAULT 'INFO'");
    runColumnMigration('security_audit_logs', 'route', 'TEXT');
    runColumnMigration('security_audit_logs', 'ip_hash', 'TEXT');
    runColumnMigration('security_audit_logs', 'ip_address', 'TEXT');
    runColumnMigration('security_audit_logs', 'user_agent_summary', 'TEXT');
    runColumnMigration('security_audit_logs', 'user_id', 'TEXT');
    runColumnMigration('security_audit_logs', 'created_at', "TEXT NOT NULL DEFAULT (datetime('now'))");

    // Table: system_security_settings
    db.exec(`
      CREATE TABLE IF NOT EXISTS system_security_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    const sessionVerExists = db.prepare("SELECT key FROM system_security_settings WHERE key = 'global_session_version'").get();
    if (!sessionVerExists) {
      db.prepare("INSERT INTO system_security_settings (key, value, updated_at) VALUES ('global_session_version', '1', ?)").run(new Date().toISOString());
    }

    // Tables: chat_channels and chat_messages
    db.exec(`
      CREATE TABLE IF NOT EXISTS chat_channels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        course_id TEXT NOT NULL DEFAULT 'DAS-26-27',
        is_announcement_only INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (course_id) REFERENCES academic_courses(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_role TEXT NOT NULL DEFAULT 'student',
        content TEXT NOT NULL,
        is_pinned INTEGER NOT NULL DEFAULT 0,
        is_hidden INTEGER NOT NULL DEFAULT 0,
        hidden_by TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (channel_id) REFERENCES chat_channels(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_channels_course ON chat_channels(course_id);
    `);

    // Seed default channels if empty
    const channelsCount = (db.prepare('SELECT COUNT(*) as count FROM chat_channels').get() as { count: number }).count;
    if (channelsCount === 0) {
      const nowIso = new Date().toISOString();
      const insertChan = db.prepare(`
        INSERT INTO chat_channels (id, name, description, course_id, is_announcement_only, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertChan.run('general-das26-27', 'General DAS 26/27', 'Canal principal del grupo para consultas y debate clínico', 'DAS-26-27', 0, nowIso);
      insertChan.run('tutorias-consultas', 'Tutorías y Dudas Docentes', 'Atención directa con el profesorado de codificación', 'DAS-26-27', 0, nowIso);
      insertChan.run('casos-clinicos-cim10', 'Casos Clínicos CIM-10', 'Discusión técnica de diagnósticos, lateralidad y reglas', 'DAS-26-27', 0, nowIso);
      insertChan.run('avisos-oficiales', 'Avisos Oficiales (Docencia)', 'Canal unidireccional de anuncios de la coordinación', 'DAS-26-27', 1, nowIso);

      // Welcome message
      db.prepare(`
        INSERT INTO chat_messages (id, channel_id, user_id, user_name, user_role, content, is_pinned, is_hidden, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'msg_welcome_seed',
        'general-das26-27',
        'admin-1',
        'Coordinación Docente FHSJD',
        'admin',
        '¡Bienvenidos al Canal de Comunicación de AulaCIM-10! Espacio para consultas de codificación clínica, dudas de exámenes MEAP y anuncios oficiales de la coordinación.',
        1,
        0,
        nowIso
      );
    }

    // Table: notices
    runColumnMigration('notices', 'is_pinned', 'INTEGER NOT NULL DEFAULT 0');
    runColumnMigration('notices', 'course_id', 'TEXT');
    runColumnMigration('notices', 'updated_at', 'TEXT');
  } catch (migErr) {
    console.warn('Migration engine warning:', migErr);
  }

  // 1c. Check and seed academic_courses if count == 0
  const courseCount = (db.prepare('SELECT COUNT(*) as count FROM academic_courses').get() as { count: number }).count;
  if (courseCount === 0) {
    const insertCourse = db.prepare(`
      INSERT INTO academic_courses (id, name, is_current, start_date, end_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const insertCourseTx = db.transaction(() => {
      insertCourse.run('DAS-26-27', 'Promoción 2026/2027 · DAS (Activa)', 1, '2026-09-15', '2027-06-25', new Date().toISOString());
      insertCourse.run('DAS-25-26', 'Promoción 2025/2026 · DAS (Histórica)', 0, '2025-09-15', '2026-06-20', new Date().toISOString());
      insertCourse.run('DAS-27-28', 'Promoción 2027/2028 · DAS (Planificada)', 0, '2027-09-15', null, new Date().toISOString());
    });
    insertCourseTx();
  }

  // 1d. Check and seed course_subjects if empty
  try {
    const subjCount = (db.prepare('SELECT COUNT(*) as count FROM course_subjects').get() as { count: number }).count;
    if (subjCount === 0) {
      const nowIso = new Date().toISOString();
      const insertSubj = db.prepare(`
        INSERT INTO course_subjects (id, course_id, code, name, description, icon, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
      `);
      insertSubj.run(
        'subj_cim10_default',
        'DAS-26-27',
        'CIM10-DAS',
        'Codificación Clínica CIM-10 · MEAP',
        'Materia troncal de Codificación Clínica y Gestión de Datos Sanitarios FHSJD (Diagnósticos, Procedimientos y Normativa Técnica)',
        'stethoscope',
        nowIso,
        nowIso
      );
      insertSubj.run(
        'subj_doc_sanitaria',
        'DAS-26-27',
        'DOC-SAN',
        'Documentación y Administración Sanitaria',
        'Gestión de historias clínicas, admisión, codificación de altas y archivo hospitalario',
        'folder-git2',
        nowIso,
        nowIso
      );
    }

    // 1e. Check and seed classrooms if empty
    const classCount = (db.prepare('SELECT COUNT(*) as count FROM classrooms').get() as { count: number }).count;
    if (classCount === 0) {
      const nowIso = new Date().toISOString();
      const insertClass = db.prepare(`
        INSERT INTO classrooms (id, subject_id, course_id, name, code, description, academic_year, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `);
      insertClass.run(
        'classroom_das_a',
        'subj_cim10_default',
        'DAS-26-27',
        'Aula A · Grupo Mañana (DAS 26/27)',
        'AULA-DAS-A',
        'Grupo presencial de mañana para prácticas de codificación clínica',
        'DAS-26-27',
        nowIso,
        nowIso
      );
      insertClass.run(
        'classroom_das_b',
        'subj_cim10_default',
        'DAS-26-27',
        'Aula B · Grupo Tarde (DAS 26/27)',
        'AULA-DAS-B',
        'Grupo de tarde para supuestos clínicos y auditoría documental',
        'DAS-26-27',
        nowIso,
        nowIso
      );
    }
  } catch (subjErr) {
    console.warn('Subjects/Classrooms seed note:', subjErr);
  }

  // 2. Check and seed users (idempotent for all seed users)
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (
      id, username, password_hash, password_salt, full_name, dni_nie, dni_bindex,
      email, phone, academic_group, role, course_id, status,
      can_switch_role, must_change_password, privacy_accepted_at, privacy_policy_version, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, 'v1.0-2026', ?)
  `);

  const adminDefaultPassword = process.env.ADMIN_DEFAULT_PASSWORD?.trim();

  const insertUserTx = db.transaction(() => {
    for (const u of SEED_USERS) {
      let pwd = u.password;
      let mustChange = u.mustChangePassword ? 1 : 0;

      // In Vercel / Cloud: If ADMIN_DEFAULT_PASSWORD is provided, initialize Admin directly without forced password loop
      if (u.username.toLowerCase() === 'admin' && adminDefaultPassword && adminDefaultPassword.length >= 4) {
        pwd = adminDefaultPassword;
        mustChange = 0;
      }

      const { hash, salt } = hashPassword(pwd);
      const rawDni = u.dniNie.trim().toUpperCase();
      const encryptedDni = encryptField(rawDni);
      const bindex = computeBlindIndex(rawDni);

      insertUser.run(
        u.id,
        u.username,
        hash,
        salt,
        u.fullName,
        encryptedDni,
        bindex,
        u.email,
        u.phone,
        u.academicGroup,
        u.role,
        'DAS-26-27',
        u.canSwitchRole ? 1 : 0,
        mustChange,
        new Date().toISOString(),
        new Date().toISOString()
      );
    }
  });

  insertUserTx();

  // 2b. Secure Seed Loader for Daughter Dual Account and Custom Users (from seed-users.local.json or SEED_USERS_JSON in Vercel)
  try {
    let seedData: any = null;

    // A) First check SEED_USERS_JSON environment variable (for Vercel / Cloud deployment without git exposure)
    if (process.env.SEED_USERS_JSON && process.env.SEED_USERS_JSON.trim()) {
      try {
        seedData = JSON.parse(process.env.SEED_USERS_JSON.trim());
      } catch (jsonErr) {
        console.warn('Failed to parse SEED_USERS_JSON environment variable:', jsonErr);
      }
    }

    // B) Fallback to local gitignored file seed-users.local.json (for Local / USB mode)
    if (!seedData) {
      const localSeedPath = path.join(process.cwd(), 'seed-users.local.json');
      if (fs.existsSync(localSeedPath)) {
        const content = fs.readFileSync(localSeedPath, 'utf-8');
        seedData = JSON.parse(content);
      }
    }

    if (seedData) {
      // 1. Daughter student account
      const daughter = seedData.daughter;
      if (daughter && daughter.dniNie) {
        const rawDni = daughter.dniNie.trim().toUpperCase();
        const bindex = computeBlindIndex(rawDni);
        const encryptedDni = encryptField(rawDni);
        const daughterUsername = (daughter.username || '48069899Z').trim().toLowerCase();
        const rawPassword = daughter.password || '1234';
        const { hash, salt } = hashPassword(rawPassword);

        const existing = db.prepare('SELECT id FROM users WHERE dni_bindex = ? OR UPPER(dni_nie) = ? OR LOWER(username) = ? OR LOWER(username) = ?').get(bindex, rawDni, daughterUsername, '48069899z') as any;
        if (!existing) {
          db.prepare(`
            INSERT INTO users (
              id, username, password_hash, password_salt, full_name, dni_nie, dni_bindex,
              email, phone, academic_group, role, course_id, status,
              can_switch_role, must_change_password, privacy_accepted_at, privacy_policy_version, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1, 0, ?, 'v1.0-2026', ?)
          `).run(
            'usr_daughter_dual',
            daughterUsername,
            hash,
            salt,
            daughter.fullName || 'Laia Cachinero Baranda',
            encryptedDni,
            bindex,
            daughter.email || 'laia.cachinero@centro.local',
            daughter.phone || null,
            daughter.academicGroup || 'DAS 26/27 - Grupo A',
            daughter.role || 'student',
            daughter.courseId || 'DAS-26-27',
            new Date().toISOString(),
            new Date().toISOString()
          );
        } else {
          db.prepare('UPDATE users SET role = ?, full_name = ?, can_switch_role = 1, password_hash = ?, password_salt = ?, dni_bindex = ? WHERE id = ?').run(daughter.role || 'student', daughter.fullName || 'Laia Cachinero Baranda', hash, salt, bindex, existing.id);
        }
      }

      // 2. Extra custom users if provided in array
      if (Array.isArray(seedData.users)) {
        for (const u of seedData.users) {
          if (!u.username || !u.dniNie) continue;
          const rawDni = u.dniNie.trim().toUpperCase();
          const bindex = computeBlindIndex(rawDni);
          const encryptedDni = encryptField(rawDni);

          const exists = db.prepare('SELECT id FROM users WHERE dni_bindex = ? OR UPPER(dni_nie) = ? OR LOWER(username) = LOWER(?)').get(bindex, rawDni, u.username);
          if (!exists) {
            const { hash, salt } = hashPassword(u.password || 'Aula2026!');
            db.prepare(`
              INSERT INTO users (
                id, username, password_hash, password_salt, full_name, dni_nie, dni_bindex,
                email, phone, academic_group, role, course_id, status,
                can_switch_role, must_change_password, privacy_accepted_at, privacy_policy_version, created_at
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, 0, ?, 'v1.0-2026', ?)
            `).run(
              u.id || `usr_ext_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              u.username.trim().toLowerCase(),
              hash,
              salt,
              u.fullName || u.username,
              encryptedDni,
              bindex,
              u.email || `${u.username}@centro.local`,
              u.phone || null,
              u.academicGroup || 'DAS 26/27',
              u.role || 'student',
              u.courseId || 'DAS-26-27',
              u.canSwitchRole ? 1 : 0,
              new Date().toISOString(),
              new Date().toISOString()
            );
          }
        }
      }
    }
  } catch (localSeedErr) {
    console.warn('Seed loader note:', localSeedErr);
  }

  // 2c. Idempotent Core Institutional Accounts Seeding (admin.fhsjd, docente.fhsjd, alumno1.fhsjd)
  try {
    ensureCoreAccountsInDb(db);
  } catch (coreAccountsErr) {
    console.warn('Core institutional accounts seeding note:', coreAccountsErr);
  }

  // 2d. Synchronize user_roles multi-profile mapping
  try {
    const allUsers = db.prepare('SELECT id, role, can_switch_role, username FROM users').all() as Array<{ id: string; role: string; can_switch_role: number; username: string }>;
    const checkRoleStmt = db.prepare('SELECT id FROM user_roles WHERE user_id = ? AND role = ?');
    const insertRoleStmt = db.prepare('INSERT OR IGNORE INTO user_roles (id, user_id, role, assigned_at) VALUES (?, ?, ?, ?)');
    const nowIso = new Date().toISOString();

    for (const u of allUsers) {
      if (!checkRoleStmt.get(u.id, u.role)) {
        insertRoleStmt.run(`ur_${u.id}_${u.role}`, u.id, u.role, nowIso);
      }
      if (u.can_switch_role && (u.role === 'admin' || u.role === 'teacher')) {
        if (!checkRoleStmt.get(u.id, 'student')) {
          insertRoleStmt.run(`ur_${u.id}_student`, u.id, 'student', nowIso);
        }
      }
      if (u.username.toLowerCase().includes('profesor') || u.id.includes('profesor')) {
        if (!checkRoleStmt.get(u.id, 'teacher')) {
          insertRoleStmt.run(`ur_${u.id}_teacher`, u.id, 'teacher', nowIso);
        }
      }
    }
  } catch (urErr) {
    console.warn('user_roles sync note:', urErr);
  }

  // 3. Check and seed CIM-10 catalog if count == 0
  const codeCount = (db.prepare('SELECT COUNT(*) as count FROM cim10_codes').get() as { count: number }).count;
  if (codeCount === 0) {
    const insertCode = db.prepare(`
      INSERT INTO cim10_codes (id, code, description, chapter, category, subcategory, includes_notes, excludes1_notes, excludes2_notes, rules_notes, laterality_seventh_char, is_billable, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertCodesTx = db.transaction(() => {
      let idx = 1;
      for (const c of SEED_CIM10_CODES) {
        insertCode.run(
          `c10_${String(idx++).padStart(4, '0')}`,
          c.code,
          c.description,
          c.chapter,
          c.category,
          c.subcategory || null,
          c.includesNotes || null,
          c.excludes1Notes || null,
          c.excludes2Notes || null,
          c.rulesNotes || null,
          c.lateralitySeventhChar || null,
          c.isBillable ? 1 : 0,
          new Date().toISOString()
        );
      }
    });

    insertCodesTx();
  }

  // 4. Check and seed Questions if count == 0
  const qCount = (db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number }).count;
  if (qCount === 0) {
    const insertQ = db.prepare(`
      INSERT INTO questions (id, discipline, level, case_title, clinical_scenario, service_context, patient_age, patient_gender, options_json, correct_option_id, clinical_analysis, cim10_path, rule_check, distractor_explanations_json, error_category, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertQTx = db.transaction(() => {
      let qIdx = 1;
      for (const q of SEED_100_MEAP_QUESTIONS) {
        insertQ.run(
          `q_${String(qIdx++).padStart(4, '0')}`,
          q.discipline,
          q.level,
          q.caseTitle,
          q.clinicalScenario,
          q.serviceContext,
          q.patientAge || null,
          q.patientGender || null,
          JSON.stringify(q.options),
          q.correctOptionId,
          q.reasonedResolution.clinicalAnalysis,
          q.reasonedResolution.cim10Path,
          q.reasonedResolution.ruleCheck,
          JSON.stringify(q.reasonedResolution.distractorExplanations),
          q.errorCategory,
          new Date().toISOString()
        );
      }
    });

    insertQTx();
  }

  // 5. Check and seed notices if count == 0
  const noticeCount = (db.prepare('SELECT COUNT(*) as count FROM notices').get() as { count: number }).count;
  if (noticeCount === 0) {
    const insertNotice = db.prepare(`
      INSERT INTO notices (id, title, content, author_name, is_pinned, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertNoticeTx = db.transaction(() => {
      let nIdx = 1;
      for (const n of SEED_NOTICES) {
        insertNotice.run(
          `notice_${String(nIdx++).padStart(3, '0')}`,
          n.title,
          n.content,
          n.authorName,
          n.isPinned ? 1 : 0,
          n.createdAt
        );
      }
    });

    insertNoticeTx();
  }

  // 6. Check and seed Reverse Coding Cases if count == 0
  const revCount = (db.prepare('SELECT COUNT(*) as count FROM reverse_coding_cases').get() as { count: number }).count;
  if (revCount === 0) {
    const insertRev = db.prepare(`
      INSERT INTO reverse_coding_cases (
        id, discipline, level, case_title, clinical_scenario, service_context,
        initial_proposed_code, initial_proposed_description, audit_flaw_type, audit_flaw_hint,
        options_json, correct_option_id, flaw_detected, clinical_analysis, cim10_path,
        rule_check, distractor_explanations_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertRevTx = db.transaction(() => {
      let rIdx = 1;
      for (const r of SEED_REVERSE_CODING_CASES) {
        insertRev.run(
          `rev_${String(rIdx++).padStart(3, '0')}`,
          r.discipline,
          r.level,
          r.caseTitle,
          r.clinicalScenario,
          r.serviceContext,
          r.initialProposedCode,
          r.initialProposedDescription,
          r.auditFlawType,
          r.auditFlawHint || null,
          JSON.stringify(r.options),
          r.correctOptionId,
          r.reasonedResolution.flawDetected,
          r.reasonedResolution.clinicalAnalysis,
          r.reasonedResolution.cim10Path,
          r.reasonedResolution.ruleCheck,
          JSON.stringify(r.reasonedResolution.distractorExplanations),
          new Date().toISOString()
        );
      }
    });

    insertRevTx();
  }

  // 7. Check and seed managed_tests if count == 0
  const testCount = (db.prepare('SELECT COUNT(*) as count FROM managed_tests').get() as { count: number }).count;
  if (testCount === 0) {
    const insertTest = db.prepare(`
      INSERT INTO managed_tests (
        id, code, course_id, title, test_type, discipline, level,
        question_count, time_limit_minutes, status, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertTestTx = db.transaction(() => {
      insertTest.run('test_urg_01', 'C10-URG1', 'DAS-26-27', 'Control 1: Urgencias y Traumatismos Agudos', 'standard_meap', 'urgencias', 1, 10, 30, 'live', 'usr_admin_01', new Date().toISOString());
      insertTest.run('test_inv_01', 'C10-INV1', 'DAS-26-27', 'Taller de Auditoría Clínica e Inversa', 'reverse_coding', 'especializada_medica', 2, 10, 25, 'prepared', 'usr_admin_01', new Date().toISOString());
      insertTest.run('test_kah_01', 'C10-KAH1', 'DAS-26-27', 'Ronda Rápida Multidisciplinar con Podio', 'kahoot_round', 'simulacro_integral', 1, 15, 10, 'prepared', 'usr_admin_01', new Date().toISOString());
      insertTest.run('test_adp_01', 'C10-ADAP', 'DAS-26-27', 'Entrenamiento Adaptativo Inteligente IA (60/25/15)', 'adaptive', 'simulacro_integral', 0, 10, 0, 'prepared', 'usr_admin_01', new Date().toISOString());
    });

    insertTestTx();
  }

  // 8. Check and seed Core Topic 'cim10' and its foundational educational modules
  try {
    const coreTopic = db.prepare('SELECT id FROM topics WHERE slug = ?').get('cim10') as any;
    if (!coreTopic) {
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO topics (id, slug, title, description, category, is_core, is_published, sort_order, icon, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'topic_core_cim10',
        'cim10',
        'CIM-10-ES · Codificación Clínica y Diagnósticos',
        'Tronco central de codificación clínica y documentación sanitaria oficial: normativa CIE-10-ES, diagnóstico principal, comorbilidades y reglas de exclusión.',
        'Codificación Clínica Sanitaria',
        1,
        1,
        1,
        'stethoscope',
        'system',
        now,
        now
      );

      const insertSummary = db.prepare(`
        INSERT INTO topic_summaries (id, topic_id, section_title, summary_content, key_concepts_json, clinical_rules_json, sort_order, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const coreSummaries = [
        {
          id: 'sum_cim10_01',
          title: 'Tema 1: Normativa General de la CIE-10-ES y Convenciones Básicas',
          content: 'La Clasificación Internacional de Enfermedades 10ª Revisión - Modificación Clínica para España (CIE-10-ES) adopta una estructura alfanumérica de hasta 7 caracteres. El primer carácter es siempre una letra alfabética (excepto la U para causas especiales). El 4º al 7º carácter aportan mayor nivel de especificidad anatómica, etiología o manifestación. Es crucial distinguir entre las notas "Excluye 1" (no codificar nunca aquí, incompatibilidad diagnóstica pura) y "Excluye 2" (no incluido aquí, pero ambas afecciones pueden coexistir y codificarse simultáneamente si el paciente las padece).',
          keyConcepts: ['Estructura alfanumérica (3-7 caracteres)', 'Excluye 1 (Incompatibilidad absoluta)', 'Excluye 2 (No incluido, compatible)', 'Séptimo carácter obligatorio'],
          clinicalRules: ['Nunca omitir el 7º carácter cuando la subcategoría lo requiera', 'Revisar siempre la tabla de notas tabulares antes de confirmar un código del índice alfabético']
        },
        {
          id: 'sum_cim10_02',
          title: 'Tema 2: Criterios de Selección del Diagnóstico Principal (DP)',
          content: 'El Diagnóstico Principal se define como la afección que, tras el estudio y al alta del paciente, se establece como la causa que motivó su ingreso en el hospital. Si coexisten dos o más diagnósticos que cumplen con igual derecho los criterios de DP, las notas de la lista tabular y las directrices de codificación tienen prioridad. Cuando dos afecciones relacionadas motivan el ingreso por igual y no hay pauta específica, el codificador seleccionará la que haya consumido más recursos clínicos tras consultar el informe de alta.',
          keyConcepts: ['Definición estricta de DP al alta', 'Circunstancia de admisión hospitalaria', 'Consumo prioritario de recursos asistenciales', 'Complicaciones intrahospitalarias como diagnósticos secundarios'],
          clinicalRules: ['Una complicación que surge durante el ingreso NUNCA puede ser Diagnóstico Principal a menos que sea una readmisión específica', 'Los hallazgos anormales de laboratorio no se codifican si son síntoma común del diagnóstico principal confirmado']
        },
        {
          id: 'sum_cim10_03',
          title: 'Tema 3: Infecciones, Sepsis Grave y Shock Séptico',
          content: 'La codificación de sepsis requiere determinar el microorganismo causal específico. Si se documenta sepsis grave con disfunción orgánica aguda, se debe secuenciar en primer lugar la infección subyacente (ej. Neumonía bacteriana J15.9 o Infección urinaria N39.0), seguida obligatoriamente de R65.20 (Sepsis grave sin shock séptico) o R65.21 (Sepsis grave con shock séptico), añadiendo los códigos adicionales para cada fallo orgánico agudo diagnosticado (ej. fracaso renal agudo N17.9, insuficiencia respiratoria aguda J96.00).',
          keyConcepts: ['Secuenciación de infección causal', 'R65.20 (Sepsis grave sin shock)', 'R65.21 (Sepsis grave con shock)', 'Códigos de disfunción orgánica aguda asociada'],
          clinicalRules: ['R65.2 jamás puede ser Diagnóstico Principal', 'El shock séptico requiere la concurrencia de infección, hipotensión refractaria a fluidos y código R65.21']
        },
        {
          id: 'sum_cim10_04',
          title: 'Tema 4: Traumatismos y Lesiones con 7º Carácter (A / D / S)',
          content: 'El capítulo 19 (Lesiones y envenenamientos) exige el uso sistemático del séptimo carácter en la gran mayoría de categorías: "A" indica encuentro inicial (atención activa de la fase aguda: urgencia, cirugía reconstructiva inicial, evaluación primaria); "D" corresponde al encuentro sucesivo (curas, retirada de material, fisioterapia durante la fase de cicatrización o recuperación); "S" representa la secuela o efecto tardío de la lesión primaria.',
          keyConcepts: ['A: Encuentro inicial (tratamiento activo)', 'D: Encuentro sucesivo (recuperación/cura)', 'S: Secuela / Efecto tardío'],
          clinicalRules: ['El carácter 7 "A" se utiliza mientras el paciente recibe tratamiento activo de la lesión', 'Para secuelas "S", se codifica primero la naturaleza de la secuela (ej. cojera, cicatriz queloide) seguida del código de traumatismo con 7º carácter S']
        },
        {
          id: 'sum_cim10_05',
          title: 'Tema 5: Neoplasias, Metastásicas y Antecedentes (Z85)',
          content: 'El tratamiento de una neoplasia primaria activa define el DP salvo si el motivo directo del ingreso es una complicación médica (ej. anemia por neoplasia tratada exclusivamente, deshidratación grave) o metástasis secundaria. Si el tumor primario fue extirpado o erradicado por completo y no hay evidencia actual de enfermedad en ese sitio ni tratamiento activo sobre el mismo, se codifica como antecedente personal de neoplasia maligna (Z85.-) y NO como neoplasia activa.',
          keyConcepts: ['Neoplasia primaria activa vs metastásica', 'Antecedente personal erradicado (Z85)', 'Tratamiento exclusivo de metástasis o complicaciones'],
          clinicalRules: ['No asignar código de neoplasia activa del capítulo 2 a un tumor extirpado sin recurrencia local', 'Si el ingreso es exclusivamente para quimioterapia o radioterapia, el código Z51.- debe ser el Diagnóstico Principal']
        }
      ];

      for (let i = 0; i < coreSummaries.length; i++) {
        const s = coreSummaries[i];
        insertSummary.run(
          s.id,
          'topic_core_cim10',
          s.title,
          s.content,
          JSON.stringify(s.keyConcepts),
          JSON.stringify(s.clinicalRules),
          i + 1,
          now
        );
      }
    }
  } catch (topicErr) {
    console.warn('Topic core initialization notice:', topicErr);
  }
}
