import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getHistoricalAudits, getCourseAuditSummary, getAcademicCourses } from '@/lib/db/queries';
import { ServiceArea } from '@/types';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);

    const courseId = searchParams.get('courseId') || undefined;
    const discipline = (searchParams.get('discipline') as ServiceArea) || undefined;
    const studentId = searchParams.get('studentId') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const filter = {
      courseId,
      discipline,
      studentId,
      startDate,
      endDate,
    };

    const records = getHistoricalAudits(filter);
    const summary = getCourseAuditSummary(courseId || 'DAS-26-27');
    const courses = getAcademicCourses();

    return NextResponse.json({
      records,
      summary,
      courses,
      filterApplied: filter,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error al consultar repositorio histórico de auditoría.' }, { status: 500 });
  }
}
