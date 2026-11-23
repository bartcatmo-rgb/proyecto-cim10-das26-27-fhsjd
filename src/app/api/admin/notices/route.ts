import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { createNotice } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { title, content, isPinned } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Título y contenido son obligatorios.' }, { status: 400 });
    }

    const notice = createNotice({
      title,
      content,
      authorName: admin.fullName,
      isPinned: Boolean(isPinned),
    });

    return NextResponse.json({ success: true, notice });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error al publicar el aviso.' }, { status: 500 });
  }
}
