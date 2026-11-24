import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getClassroomMembers, assignClassroomMember, removeClassroomMember } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const members = getClassroomMembers(id);

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error al consultar miembros del aula' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { userId, memberRole = 'student' } = body;

    if (!userId) {
      return NextResponse.json({ error: 'El identificador userId es obligatorio.' }, { status: 400 });
    }

    assignClassroomMember(id, userId, memberRole);

    return NextResponse.json({
      success: true,
      message: 'Usuario asignado al aula correctamente.',
      members: getClassroomMembers(id),
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    console.error('Error en POST /api/admin/classrooms/[id]/members:', err);
    return NextResponse.json({ error: err.message || 'Error al asignar usuario al aula' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Parámetro userId es obligatorio.' }, { status: 400 });
    }

    removeClassroomMember(id, userId);

    return NextResponse.json({
      success: true,
      message: 'Usuario desvinculado del aula correctamente.',
      members: getClassroomMembers(id),
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    console.error('Error en DELETE /api/admin/classrooms/[id]/members:', err);
    return NextResponse.json({ error: err.message || 'Error al desvincular usuario del aula' }, { status: 400 });
  }
}
