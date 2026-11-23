import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { createStudentReport, getUserById } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { studentId, title, content, strengths, weaknesses, recommendedFocus } = body;

    if (!studentId || !title || !content) {
      return NextResponse.json({ error: 'Faltan campos obligatorios para el informe.' }, { status: 400 });
    }

    const student = getUserById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Alumno no encontrado.' }, { status: 404 });
    }

    const newReport = createStudentReport({
      studentId,
      authorId: admin.id,
      title,
      content,
      strengths: strengths || '',
      weaknesses: weaknesses || '',
      recommendedFocus: recommendedFocus || '',
      status: 'sent',
      sentAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, report: newReport });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error al generar el informe del alumno.' }, { status: 500 });
  }
}
