import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { exportFullBackupJson, importBackupJson } from '@/lib/db/queries';

export async function GET() {
  try {
    await requireAdmin();
    const backupData = exportFullBackupJson();

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup_aulacim10_${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error al exportar copia de seguridad.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const data = await req.json();
    const result = importBackupJson(data);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error al restaurar la copia de seguridad.' }, { status: 500 });
  }
}
