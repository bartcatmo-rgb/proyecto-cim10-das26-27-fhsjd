import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getAdminUsersList, createAdminUser } from '@/lib/db/queries';
import { validateDniNie } from '@/lib/auth/crypto';
import { UserRole } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const url = new URL(req.url);

    const role = url.searchParams.get('role') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const courseId = url.searchParams.get('courseId') || undefined;
    const subjectId = url.searchParams.get('subjectId') || undefined;
    const classroomId = url.searchParams.get('classroomId') || undefined;

    const users = getAdminUsersList({
      role,
      status,
      search,
      courseId,
      subjectId,
      classroomId,
    });

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado: se requieren privilegios de Administrador' }, { status: 403 });
    }
    console.error('Error en GET /api/admin/users:', err);
    return NextResponse.json({ error: 'Error interno al consultar usuarios' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const {
      username,
      fullName,
      firstName,
      lastName,
      dniNie,
      email,
      phone,
      academicGroup,
      role = 'student',
      roles,
      password,
      canSwitchRole,
      courseId,
      defaultSubjectId,
      defaultClassroomId,
    } = body;

    if (!username || !dniNie || !email) {
      return NextResponse.json(
        { error: 'Usuario, DNI/NIE y correo electrónico son obligatorios.' },
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

    const validRoles: UserRole[] = ['student', 'teacher', 'admin'];
    if (!validRoles.includes(role as UserRole)) {
      return NextResponse.json(
        { error: "Rol no válido. Los roles admitidos son 'student', 'teacher' y 'admin'." },
        { status: 400 }
      );
    }

    const newUser = createAdminUser(
      {
        username: String(username).trim(),
        fullName: fullName ? String(fullName).trim() : undefined,
        firstName: firstName ? String(firstName).trim() : undefined,
        lastName: lastName ? String(lastName).trim() : undefined,
        dniNie: dniValidation.formatted,
        email: String(email).trim().toLowerCase(),
        phone: phone ? String(phone).trim() : undefined,
        academicGroup: academicGroup ? String(academicGroup).trim() : undefined,
        role: role as UserRole,
        roles: Array.isArray(roles) ? roles : [role as UserRole],
        password: password ? String(password).trim() : undefined,
        canSwitchRole: Boolean(canSwitchRole),
        courseId: courseId ? String(courseId).trim() : undefined,
        defaultSubjectId: defaultSubjectId ? String(defaultSubjectId).trim() : undefined,
        defaultClassroomId: defaultClassroomId ? String(defaultClassroomId).trim() : undefined,
      },
      admin.id
    );

    return NextResponse.json({
      success: true,
      message: `Usuario ${newUser.username} registrado correctamente con rol ${newUser.role}.`,
      user: newUser,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado: se requieren privilegios de Administrador' }, { status: 403 });
    }
    console.error('Error en POST /api/admin/users:', err);
    return NextResponse.json({ error: err.message || 'Error al crear usuario' }, { status: 400 });
  }
}
