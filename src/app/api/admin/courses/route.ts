import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getAcademicCourses, createAcademicCourse } from '@/lib/db/queries';

export async function GET() {
  try {
    await requireAdmin();
    const courses = getAcademicCourses();
    return NextResponse.json({ courses });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error al consultar cursos académicos.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, name, description, isCurrent, academicCategory } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'El código identificador y el nombre del curso son obligatorios.' }, { status: 400 });
    }

    const sanitizedId = String(id).trim().toUpperCase();
    const course = createAcademicCourse({
      id: sanitizedId,
      name: String(name).trim(),
      description: description ? String(description).trim() : undefined,
      academicCategory: academicCategory ? String(academicCategory).trim() : undefined,
      isCurrent: Boolean(isCurrent),
    });

    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: err.message || 'Error al crear el curso académico.' }, { status: 500 });
  }
}
