import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { updateStudentStatus, getUserById } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { studentId, status } = body;

    if (!studentId || !status || (status !== 'active' && status !== 'inactive')) {
      return NextResponse.json({ error: 'Parámetros inválidos. Se requiere studentId y status (active|inactive).' }, { status: 400 });
    }

    const targetUser = getUserById(studentId);
    if (!targetUser) {
      return NextResponse.json({ error: 'Alumno no encontrado.' }, { status: 404 });
    }

    if (targetUser.role === 'admin') {
      return NextResponse.json({ error: 'No se puede modificar el estado de una cuenta de administrador.' }, { status: 400 });
    }

    const success = updateStudentStatus(studentId, status);
    if (!success) {
      return NextResponse.json({ error: 'No se pudo actualizar el estado del alumno.' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: status === 'inactive' ? 'Alumno dado de baja. Su historial, intentos y notas se conservan intactos.' : 'Alumno reactivado exitosamente.'
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error al cambiar estado del alumno.' }, { status: 500 });
  }
}
