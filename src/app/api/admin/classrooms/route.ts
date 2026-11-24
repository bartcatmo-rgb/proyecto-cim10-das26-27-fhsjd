import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getAllClassrooms, createClassroom, updateClassroom } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const subjectId = url.searchParams.get('subjectId') || undefined;
    const includeInactive = url.searchParams.get('includeInactive') === 'true';

    const classrooms = getAllClassrooms(subjectId, includeInactive);

    return NextResponse.json({
      success: true,
      classrooms,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    console.error('Error en GET /api/admin/classrooms:', err);
    return NextResponse.json({ error: 'Error al consultar aulas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { subjectId, name, code, description, teacherId, academicYear, courseId } = body;

    if (!subjectId || !name || !code) {
      return NextResponse.json(
        { error: 'Materia (subjectId), nombre y código del aula son obligatorios.' },
        { status: 400 }
      );
    }

    const newClassroom = createClassroom(
      {
        subjectId: String(subjectId).trim(),
        name: String(name).trim(),
        code: String(code).trim().toUpperCase(),
        description: description ? String(description).trim() : undefined,
        teacherId: teacherId ? String(teacherId).trim() : undefined,
        academicYear: academicYear ? String(academicYear).trim() : 'DAS-26-27',
        courseId: courseId ? String(courseId).trim() : 'DAS-26-27',
      },
      admin.id
    );

    return NextResponse.json({
      success: true,
      message: `Aula '${newClassroom.name}' creada con éxito.`,
      classroom: newClassroom,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    console.error('Error en POST /api/admin/classrooms:', err);
    return NextResponse.json({ error: err.message || 'Error al crear aula' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { id, name, code, description, teacherId, subjectId, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'El identificador id del aula es obligatorio.' }, { status: 400 });
    }

    const updated = updateClassroom(
      id,
      {
        name,
        code,
        description,
        teacherId,
        subjectId,
        isActive,
      },
      admin.id
    );

    return NextResponse.json({
      success: true,
      message: `Aula '${updated.name}' actualizada con éxito.`,
      classroom: updated,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    console.error('Error en PATCH /api/admin/classrooms:', err);
    return NextResponse.json({ error: err.message || 'Error al actualizar aula' }, { status: 400 });
  }
}
