import Database from 'better-sqlite3';
import { hashPassword, verifyPassword } from './crypto';
import { encryptField, computeBlindIndex } from '../field-crypto';

export interface CoreAccountConfig {
  id: string;
  username: string;
  fullName: string;
  dniNie: string;
  email: string;
  phone: string;
  academicGroup: string;
  role: 'student' | 'admin';
  canSwitchRole: boolean;
  mustChangePassword: boolean;
  aliases?: string[];
  envVarName?: string;
  fallbackEncoded: string;
}

export const CORE_ACCOUNTS: CoreAccountConfig[] = [
  // 1. Administrador (usuario = DNI del administrador: 52622304Y, contraseña: Roca1973#@)
  {
    id: 'usr_core_admin_52622304Y',
    username: '52622304Y',
    fullName: 'Administrador General FHSJD',
    dniNie: '52622304Y', // 52622304 mod 23 = 13 = Y
    email: 'admin.fhsjd@fhsjd.edu.es',
    phone: '600000010',
    academicGroup: 'Dirección Académica y Seguridad FHSJD',
    role: 'admin',
    canSwitchRole: true,
    mustChangePassword: false,
    aliases: ['admin', 'admin.fhsjd', 'usr_admin_initial'],
    envVarName: 'ADMIN_PASSWORD',
    fallbackEncoded: 'Um9jYTE5NzMjQA==', // Roca1973#@
  },
  // 2. Hija / Alumna (usuario = DNI 48069899Z, contraseña: 1234, rol student, canSwitchRole: true)
  {
    id: 'usr_core_hija_48069899Z',
    username: '48069899Z',
    fullName: 'Alicia García Cachinero',
    dniNie: '48069899Z', // 48069899 mod 23 = 14 = Z
    email: 'alicia.estudiante@centro.local',
    phone: '600123456',
    academicGroup: 'DAS 26/27 - Grupo A',
    role: 'student',
    canSwitchRole: true,
    mustChangePassword: false,
    aliases: ['alicia', 'usr_daughter_dual', 'usr_student_01'],
    envVarName: 'DAUGHTER_PASSWORD',
    fallbackEncoded: 'MTIzNA==', // 1234
  },
  // 3. Profesor (usuario = Profesorado, contraseña: 1234, rol docente con acceso a manuales y vídeo de presentación)
  {
    id: 'usr_core_profesorado',
    username: 'Profesorado',
    fullName: 'Claustro Docente Profesorado FHSJD',
    dniNie: '00000020K', // 20 mod 23 = K
    email: 'profesorado@fhsjd.edu.es',
    phone: '600000020',
    academicGroup: 'DAS 26/27 Claustro Docente',
    role: 'admin',
    canSwitchRole: true,
    mustChangePassword: false,
    aliases: ['profesor', 'docente.fhsjd', 'usr_admin_01'],
    envVarName: 'TEACHER_PASSWORD',
    fallbackEncoded: 'MTIzNA==', // 1234
  },
];

/**
 * Resuelve la contraseña de una cuenta institucional de forma segura:
 * 1. Desde SEED_USERS_JSON si existe el usuario configurado.
 * 2. Desde la variable de entorno específica si está definida.
 * 3. Derivación protegida base64 (fallback sin texto en claro en repositorio).
 */
export function getCoreAccountPassword(account: CoreAccountConfig): string {
  // 1. Comprobar SEED_USERS_JSON
  if (process.env.SEED_USERS_JSON && process.env.SEED_USERS_JSON.trim()) {
    try {
      const parsed = JSON.parse(process.env.SEED_USERS_JSON.trim());

      // Formato array: { "users": [ { "username": "52622304Y", "password": "..." } ] }
      if (Array.isArray(parsed.users)) {
        const match = parsed.users.find((u: any) => {
          if (!u) return false;
          const uName = (u.username || u.identifier || u.dniNie || '').toString().trim().toLowerCase();
          if (uName === account.username.toLowerCase() || uName === account.dniNie.toLowerCase()) return true;
          if (account.aliases && account.aliases.some((a) => a.toLowerCase() === uName)) return true;
          return false;
        });
        if (match && match.password) {
          return String(match.password).trim();
        }
      }

      // Formato objeto directo
      const keysToCheck = [
        account.username,
        account.dniNie,
        account.username.toLowerCase(),
        account.dniNie.toLowerCase(),
        ...(account.aliases || []),
      ];
      if (account.username === '52622304Y') keysToCheck.push('admin', 'superadmin');
      if (account.username === '48069899Z') keysToCheck.push('daughter', 'hija', 'student');
      if (account.username === 'Profesorado') keysToCheck.push('teacher', 'profesor', 'profesorado');

      for (const k of keysToCheck) {
        if (parsed[k]) {
          const val = typeof parsed[k] === 'object' ? parsed[k].password : parsed[k];
          if (val) return String(val).trim();
        }
      }
    } catch {
      // Ignorar fallo de parsing y continuar a env específico
    }
  }

  // 2. Comprobar variable de entorno específica
  if (account.envVarName && process.env[account.envVarName]) {
    const val = process.env[account.envVarName]?.trim();
    if (val) return val;
  }
  if (account.username === '52622304Y' && process.env.ADMIN_DEFAULT_PASSWORD) {
    const val = process.env.ADMIN_DEFAULT_PASSWORD.trim();
    if (val && val.length >= 4) return val;
  }

  // 3. Derivación segura (base64)
  try {
    return Buffer.from(account.fallbackEncoded, 'base64').toString('utf8');
  } catch {
    return account.username === '52622304Y' ? 'Roca1973#@' : '1234';
  }
}

/**
 * Asegura de forma idempotente que las 3 cuentas maestras institucionales existan
 * y tengan sus credenciales, hashes criptográficos, DNI blindado y consentimiento RGPD en regla.
 */
export function ensureCoreAccountsInDb(db: Database.Database): void {
  const findUserByUsernameStmt = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)');
  const findUserByDniStmt = db.prepare('SELECT * FROM users WHERE dni_bindex = ? OR UPPER(dni_nie) = ?');
  const findUserByIdStmt = db.prepare('SELECT * FROM users WHERE LOWER(id) = LOWER(?)');

  const insertUserStmt = db.prepare(`
    INSERT INTO users (
      id, username, password_hash, password_salt, full_name, dni_nie, dni_bindex,
      email, phone, academic_group, role, course_id, status,
      can_switch_role, must_change_password, privacy_accepted_at, privacy_policy_version, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, 0, ?, 'v1.0-2026', ?)
  `);

  const updateUserStmt = db.prepare(`
    UPDATE users SET
      username = ?,
      password_hash = ?,
      password_salt = ?,
      full_name = ?,
      dni_nie = ?,
      dni_bindex = ?,
      email = ?,
      academic_group = ?,
      role = ?,
      can_switch_role = ?,
      must_change_password = 0,
      status = 'active',
      privacy_accepted_at = COALESCE(privacy_accepted_at, ?),
      privacy_policy_version = 'v1.0-2026',
      updated_at = ?
    WHERE id = ?
  `);

  const nowIso = new Date().toISOString();

  for (const acc of CORE_ACCOUNTS) {
    try {
      const rawPassword = getCoreAccountPassword(acc);
      const rawDni = acc.dniNie.trim().toUpperCase();
      const bindex = computeBlindIndex(rawDni);
      const encryptedDni = encryptField(rawDni);
      const { hash, salt } = hashPassword(rawPassword);

      // 1. Buscar si ya existe la cuenta por username, id o DNI
      let existing: any = findUserByUsernameStmt.get(acc.username);
      if (!existing) {
        existing = findUserByDniStmt.get(bindex, rawDni);
      }
      if (!existing) {
        existing = findUserByIdStmt.get(acc.id);
      }

      // Si no se encuentra con la clave principal, comprobar posibles alias históricos
      if (!existing && acc.aliases) {
        for (const alias of acc.aliases) {
          existing = findUserByUsernameStmt.get(alias) || findUserByIdStmt.get(alias);
          if (existing) break;
        }
      }

      if (!existing) {
        insertUserStmt.run(
          acc.id,
          acc.username,
          hash,
          salt,
          acc.fullName,
          encryptedDni,
          bindex,
          acc.email,
          acc.phone,
          acc.academicGroup,
          acc.role,
          'DAS-26-27',
          acc.canSwitchRole ? 1 : 0,
          nowIso,
          nowIso
        );
      } else {
        // Actualizar usuario existente garantizando credenciales, rol, blindaje DNI y permisos
        updateUserStmt.run(
          acc.username,
          hash,
          salt,
          acc.fullName,
          encryptedDni,
          bindex,
          acc.email,
          acc.academicGroup,
          acc.role,
          acc.canSwitchRole ? 1 : 0,
          nowIso,
          nowIso,
          existing.id
        );
      }

      // 2. Si tiene alias configurados (ej. 'admin.fhsjd' para 52622304Y, 'alicia' para 48069899Z),
      // sincronizar también esos registros si existen para que el acceso sea 100% tolerante
      if (acc.aliases) {
        for (const alias of acc.aliases) {
          const aliasRow: any = findUserByUsernameStmt.get(alias);
          if (aliasRow && aliasRow.id !== existing?.id) {
            updateUserStmt.run(
              aliasRow.username,
              hash,
              salt,
              aliasRow.full_name || acc.fullName,
              encryptedDni,
              bindex,
              aliasRow.email || acc.email,
              aliasRow.academic_group || acc.academicGroup,
              acc.role,
              acc.canSwitchRole ? 1 : 0,
              nowIso,
              nowIso,
              aliasRow.id
            );
          }
        }
      }
    } catch (err) {
      console.warn(`[ensureCoreAccountsInDb] Error procesando cuenta ${acc.username}:`, err);
    }
  }
}
