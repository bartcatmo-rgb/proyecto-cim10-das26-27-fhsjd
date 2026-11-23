import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getTopicBySlug } from '@/lib/db/topics';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAuth();
    const { slug } = await params;

    const data = getTopicBySlug(slug, session.id);
    if (!data) {
      return NextResponse.json({ error: 'Temario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    console.error('Error en GET /api/topics/[slug]:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
