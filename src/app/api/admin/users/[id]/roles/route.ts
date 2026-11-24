import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { assignUserRole, revokeUserRole, getUserRoles } from '@/lib/db/queries';
import { UserRole } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const roles = getUserRoles(id);
    return NextResponse.json({ success: true, roles });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error al consultar roles' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { role } = body;

    const validRoles: UserRole[] = ['student', 'teacher', 'admin'];
    if (!role || !validRoles.includes(role as UserRole)) {
      return NextResponse.json({ error: "Rol no válido ('student', 'teacher' o 'admin')." }, { status: 400 });
    }

    const updatedRoles = assignUserRole(id, role as UserRole, admin.id);

    return NextResponse.json({
      success: true,
      message: `Rol '${role}' asignado con éxito.`,
      roles: updatedRoles,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    console.error('Error en POST /api/admin/users/[id]/roles:', err);
    return NextResponse.json({ error: err.message || 'Error al asignar rol' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const url = new URL(req.url);
    const roleParam = url.searchParams.get('role');

    if (!roleParam) {
      return NextResponse.json({ error: 'Parámetro role es obligatorio.' }, { status: 400 });
    }

    const updatedRoles = revokeUserRole(id, roleParam as UserRole, admin.id);

    return NextResponse.json({
      success: true,
      message: `Rol '${roleParam}' revocado con éxito.`,
      roles: updatedRoles,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    console.error('Error en DELETE /api/admin/users/[id]/roles:', err);
    return NextResponse.json({ error: err.message || 'Error al revocar rol' }, { status: 400 });
  }
}
