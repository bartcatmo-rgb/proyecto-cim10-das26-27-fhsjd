import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getGroupAnalytics, getAllStudents, getAcademicCourses } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId') || undefined;

    const courses = getAcademicCourses();
    const analytics = getGroupAnalytics(courseId);
    const students = getAllStudents(false, courseId); // false for admin = unmasked DNI

    return NextResponse.json({
      success: true,
      courseId: courseId || 'DAS-26-27',
      analytics,
      students,
      courses,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error al consultar métricas del curso.' }, { status: 500 });
  }
}
