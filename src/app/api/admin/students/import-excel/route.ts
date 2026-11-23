import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getDb } from '@/lib/db';
import { createUser, getUserByUsername, getUserByDni, logSecurityEvent } from '@/lib/db/queries';
import { hashPassword } from '@/lib/auth/crypto';
import { validateDniNie } from '@/lib/auth/validation';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const adminUser = await requireAdmin();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const action = (formData.get('action') as string) || 'preview';
    const defaultCourseId = (formData.get('defaultCourseId') as string) || 'DAS-26-27';

    if (!file) {
      return NextResponse.json({ error: 'Debes seleccionar un archivo Excel (.xlsx).' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return NextResponse.json({ error: 'El archivo Excel no contiene hojas de cálculo.' }, { status: 400 });
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      return NextResponse.json({ error: 'La hoja de cálculo está vacía o no tiene registros de alumnos.' }, { status: 400 });
    }

    const validRows: any[] = [];
    const errorRows: any[] = [];
    const seenDnis = new Set<string>();
    const seenUsernames = new Set<string>();

    let rowIdx = 2; // Row 1 is header
    for (const raw of rawRows) {
      const rawDni = String(raw.dni_nie || raw.dni || raw.DNI || '').trim();
      const rawName = String(raw.nombre_apellidos || raw.nombre || raw.NOMBRE || '').trim();
      const rawCourse = String(raw.curso || raw.CURSO || defaultCourseId).trim() || defaultCourseId;
      const rawEmail = String(raw.correo || raw.email || raw.CORREO || '').trim();
      const rawPhone = String(raw.telefono || raw.TELEFONO || '').trim();
      let rawUsername = String(raw.usuario_inicial || raw.usuario || raw.USUARIO || '').trim().toLowerCase();
      const rawPassword = String(raw.contrasena_inicial || raw.contrasena || raw.password || 'Alumno2026!').trim();

      // Check mandatory DNI
      const dniCheck = validateDniNie(rawDni);
      if (!dniCheck.valid) {
        errorRows.push({
          row: rowIdx,
          dni: rawDni || '(vacío)',
          name: rawName,
          error: dniCheck.error || 'DNI/NIE inválido.',
        });
        rowIdx++;
        continue;
      }

      // Check mandatory Name
      if (!rawName) {
        errorRows.push({
          row: rowIdx,
          dni: dniCheck.formatted,
          name: '(vacío)',
          error: 'El nombre y apellidos son obligatorios.',
        });
        rowIdx++;
        continue;
      }

      // Check duplicates in file
      if (seenDnis.has(dniCheck.formatted)) {
        errorRows.push({
          row: rowIdx,
          dni: dniCheck.formatted,
          name: rawName,
          error: 'DNI/NIE duplicado dentro del mismo archivo.',
        });
        rowIdx++;
        continue;
      }
      seenDnis.add(dniCheck.formatted);

      // Auto-generate username if empty
      if (!rawUsername) {
        const parts = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
        rawUsername = `al_${parts.substring(0, 8)}_${dniCheck.formatted.substring(dniCheck.formatted.length - 4)}`;
      }

      if (seenUsernames.has(rawUsername)) {
        rawUsername = `${rawUsername}_${Math.floor(Math.random() * 100)}`;
      }
      seenUsernames.add(rawUsername);

      // Check existing in database
      const existingByDni = getUserByDni(dniCheck.formatted);
      if (existingByDni) {
        errorRows.push({
          row: rowIdx,
          dni: dniCheck.formatted,
          name: rawName,
          error: `Ya existe un alumno en el sistema con este DNI/NIE (${existingByDni.fullName}).`,
        });
        rowIdx++;
        continue;
      }

      const existingByUsername = getUserByUsername(rawUsername);
      if (existingByUsername) {
        errorRows.push({
          row: rowIdx,
          dni: dniCheck.formatted,
          name: rawName,
          error: `El nombre de usuario '${rawUsername}' ya está registrado.`,
        });
        rowIdx++;
        continue;
      }

      validRows.push({
        row: rowIdx,
        dniNie: dniCheck.formatted,
        fullName: rawName,
        courseId: rawCourse,
        email: rawEmail || `${rawUsername}@fhsjd.centro.local`,
        phone: rawPhone || undefined,
        username: rawUsername,
        password: rawPassword,
        academicGroup: `${rawCourse} - Grupo A`,
      });

      rowIdx++;
    }

    // If action is preview, return validated breakdown
    if (action === 'preview') {
      return NextResponse.json({
        success: true,
        action: 'preview',
        totalRows: rawRows.length,
        validCount: validRows.length,
        errorCount: errorRows.length,
        validRows: validRows.slice(0, 100),
        errorRows,
      });
    }

    // Action is commit: execute atomic transaction in SQLite
    if (validRows.length === 0) {
      return NextResponse.json({
        error: 'No se encontraron registros válidos para importar.',
        errorRows,
      }, { status: 400 });
    }

    const db = getDb();
    const insertTransaction = db.transaction(() => {
      for (const row of validRows) {
        const { hash, salt } = hashPassword(row.password);
        createUser({
          username: row.username,
          passwordHash: hash,
          passwordSalt: salt,
          fullName: row.fullName,
          dniNie: row.dniNie,
          email: row.email,
          phone: row.phone,
          academicGroup: row.academicGroup,
          role: 'student',
          courseId: row.courseId,
        });
      }
    });

    insertTransaction();

    logSecurityEvent({
      eventType: 'BULK_STUDENTS_IMPORTED',
      userId: adminUser.id,
      severity: 'INFO',
      details: `Importación masiva completada: ${validRows.length} alumnos matriculados en curso ${defaultCourseId}.`,
    });

    return NextResponse.json({
      success: true,
      action: 'commit',
      importedCount: validRows.length,
      skippedCount: errorRows.length,
      errors: errorRows,
      message: `Se han importado y matriculado ${validRows.length} alumnos con éxito en el sistema.`,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso no autorizado: se requiere rol docente.' }, { status: 403 });
    }
    return NextResponse.json({ error: `Error al procesar el archivo Excel: ${err.message}` }, { status: 500 });
  }
}
