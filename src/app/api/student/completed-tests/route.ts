import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getCourseCompletedTests, getAttemptById } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  try {
    const student = await getCurrentUser();
    if (!student) {
      return NextResponse.json({ error: 'Debes iniciar sesión para consultar tus exámenes realizados.' }, { status: 401 });
    }
    const courseId = student.courseId || 'DAS-26-27';

    const completedTests = getCourseCompletedTests(courseId, student.id);
    return NextResponse.json({
      courseId,
      studentId: student.id,
      tests: completedTests,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error al consultar exámenes del curso.' }, { status: 500 });
  }
}
