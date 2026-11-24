import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getUserDetailsWithRoles, updateAdminUser, deleteAdminUser } from '@/lib/db/queries';
import { validateDniNie } from '@/lib/auth/crypto';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = getUserDetailsWithRoles(id);
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado: se requieren privilegios de Administrador' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    if (body.dniNie) {
      const dniVal = validateDniNie(String(body.dniNie));
      if (!dniVal.valid) {
        return NextResponse.json(
          { error: dniVal.error || 'DNI o NIE no válido según el algoritmo oficial.' },
          { status: 400 }
        );
      }
      body.dniNie = dniVal.formatted;
    }

    const updatedUser = updateAdminUser(id, body, admin.id);

    return NextResponse.json({
      success: true,
      message: `Expediente de ${updatedUser.username} actualizado correctamente.`,
      user: updatedUser,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado: se requieren privilegios de Administrador' }, { status: 403 });
    }
    console.error('Error en PATCH /api/admin/users/[id]:', err);
    return NextResponse.json({ error: err.message || 'Error al actualizar usuario' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    if (id === admin.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta mientras estás en sesión activa de administrador.' },
        { status: 400 }
      );
    }

    const success = deleteAdminUser(id, admin.id);
    if (!success) {
      return NextResponse.json({ error: 'Usuario no encontrado o no se pudo eliminar' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado del sistema correctamente.',
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesión no iniciada' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado: se requieren privilegios de Administrador' }, { status: 403 });
    }
    console.error('Error en DELETE /api/admin/users/[id]:', err);
    return NextResponse.json({ error: err.message || 'Error al eliminar usuario' }, { status: 400 });
  }
}
