import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getUserByUsername, getUserByDni, createUser } from '@/lib/db/queries';
import { hashPassword, validateDniNie } from '@/lib/auth/crypto';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { username, password, fullName, dniNie, email, phone, academicGroup, courseId } = body;

    if (!username || !password || !fullName || !dniNie || !email) {
      return NextResponse.json(
        { error: 'Usuario, contraseña, nombre completo, DNI/NIE y correo son obligatorios.' },
        { status: 400 }
      );
    }

    if (String(password).length < 8) {
      return NextResponse.json(
        { error: 'La contraseña temporal debe tener al menos 8 caracteres.' },
        { status: 400 }
      );
    }

    const dniValidation = validateDniNie(String(dniNie));
    if (!dniValidation.valid) {
      return NextResponse.json(
        { error: dniValidation.error || 'DNI o NIE no válido según el algoritmo oficial.' },
        { status: 400 }
      );
    }

    const existingUsername = getUserByUsername(String(username).trim());
    if (existingUsername) {
      return NextResponse.json(
        { error: 'El nombre de usuario ya existe en el sistema.' },
        { status: 409 }
      );
    }

    const existingDni = getUserByDni(dniValidation.formatted);
    if (existingDni) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este DNI/NIE registrado.' },
        { status: 409 }
      );
    }

    const { hash, salt } = hashPassword(String(password));
    const targetCourse = courseId ? String(courseId).trim() : 'DAS-26-27';

    const newUser = createUser({
      username: String(username).trim(),
      passwordHash: hash,
      passwordSalt: salt,
      role: 'student',
      fullName: String(fullName).trim(),
      dniNie: dniValidation.formatted,
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : undefined,
      academicGroup: academicGroup ? String(academicGroup).trim() : 'DAS 1º',
      courseId: targetCourse,
    });

    return NextResponse.json({
      success: true,
      message: `Alumno ${newUser.fullName} matriculado exitosamente en el curso ${targetCourse}.`,
      student: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        dniNie: newUser.dniNie,
        email: newUser.email,
        academicGroup: newUser.academicGroup,
        courseId: newUser.courseId,
        status: newUser.status,
      },
    }, { status: 201 });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: err.message || 'Error al matricular alumno.' }, { status: 500 });
  }
}
