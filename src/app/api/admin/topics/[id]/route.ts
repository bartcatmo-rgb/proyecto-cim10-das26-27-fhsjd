import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const db = getDb();
    const existing = db.prepare('SELECT * FROM topics WHERE id = ?').get(id) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Temario no encontrado' }, { status: 404 });
    }

    const title = typeof body.title === 'string' ? body.title.trim() : existing.title;
    const description = typeof body.description === 'string' ? body.description.trim() : existing.description;
    const category = typeof body.category === 'string' ? body.category.trim() : existing.category;
    const isPublished = typeof body.is_published === 'number' ? body.is_published : (typeof body.is_published === 'boolean' ? (body.is_published ? 1 : 0) : existing.is_published);
    const sortOrder = typeof body.sort_order === 'number' ? body.sort_order : existing.sort_order;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE topics
      SET title = ?, description = ?, category = ?, is_published = ?, sort_order = ?, updated_at = ?
      WHERE id = ?
    `).run(title, description, category, isPublished, sortOrder, now, id);

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado: se requieren privilegios docentes' }, { status: 403 });
    }
    console.error('Error en PATCH /api/admin/topics/[id]:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const db = getDb();
    const existing = db.prepare('SELECT * FROM topics WHERE id = ?').get(id) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Temario no encontrado' }, { status: 404 });
    }

    if (existing.is_core === 1) {
      return NextResponse.json({ error: 'No es posible eliminar el temario troncal central del sistema (is_core=1).' }, { status: 400 });
    }

    db.prepare('DELETE FROM topics WHERE id = ?').run(id);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado: se requieren privilegios docentes' }, { status: 403 });
    }
    console.error('Error en DELETE /api/admin/topics/[id]:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
