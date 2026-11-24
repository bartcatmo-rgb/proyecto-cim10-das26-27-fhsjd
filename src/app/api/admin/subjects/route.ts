import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getAllCourseSubjects, createCourseSubject, updateCourseSubject } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const includeInactive = url.searchParams.get('includeInactive') === 'true';

    const subjects = getAllCourseSubjects(includeInactive);

    return NextResponse.json({
      success: true,
      subjects,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    console.error('Error en GET /api/admin/subjects:', err);
    return NextResponse.json({ error: 'Error al consultar materias' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { code, name, description, icon, courseId, isActive } = body;

    if (!code || !name) {
      return NextResponse.json({ error: 'El código y el nombre de la materia son obligatorios.' }, { status: 400 });
    }

    const newSubject = createCourseSubject(
      {
        code: String(code).trim().toUpperCase(),
        name: String(name).trim(),
        description: description ? String(description).trim() : undefined,
        icon: icon ? String(icon).trim() : 'book',
        courseId: courseId ? String(courseId).trim() : 'DAS-26-27',
        isActive: isActive !== false,
      },
      admin.id
    );

    return NextResponse.json({
      success: true,
      message: `Materia '${newSubject.name}' creada correctamente.`,
      subject: newSubject,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    console.error('Error en POST /api/admin/subjects:', err);
    return NextResponse.json({ error: err.message || 'Error al crear materia' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { id, code, name, description, icon, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'El identificador id de la materia es obligatorio.' }, { status: 400 });
    }

    const updated = updateCourseSubject(
      id,
      {
        code,
        name,
        description,
        icon,
        isActive,
      },
      admin.id
    );

    return NextResponse.json({
      success: true,
      message: `Materia '${updated.name}' actualizada correctamente.`,
      subject: updated,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    console.error('Error en PATCH /api/admin/subjects:', err);
    return NextResponse.json({ error: err.message || 'Error al actualizar materia' }, { status: 400 });
  }
}
