import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getStudentProgressBackup, importStudentProgressBackup } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await requireAuth();
    const backup = getStudentProgressBackup(user.id);

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="aulacim10_progreso_${user.username}_${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error al exportar progreso personal.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await req.json();

    const result = importStudentProgressBackup(user.id, data);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error al sincronizar progreso personal.' }, { status: 500 });
  }
}
