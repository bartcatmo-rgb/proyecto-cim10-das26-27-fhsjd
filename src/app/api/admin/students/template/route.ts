import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const templateRows = [
      {
        dni_nie: '12345678Z',
        nombre_apellidos: 'García Pérez, Laura',
        curso: 'DAS-26-27',
        correo: 'laura.garcia@centro.local',
        telefono: '600123456',
        usuario_inicial: 'lgarcia',
        contrasena_inicial: 'Alumno2026!',
      },
      {
        dni_nie: '23456789D',
        nombre_apellidos: 'Martínez López, Carlos',
        curso: 'DAS-26-27',
        correo: 'carlos.martinez@centro.local',
        telefono: '600654321',
        usuario_inicial: 'cmartinez',
        contrasena_inicial: 'Alumno2026!',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateRows);

    // Set column widths for comfortable editing
    worksheet['!cols'] = [
      { wch: 14 }, // dni_nie
      { wch: 30 }, // nombre_apellidos
      { wch: 14 }, // curso
      { wch: 32 }, // correo
      { wch: 16 }, // telefono
      { wch: 18 }, // usuario_inicial
      { wch: 20 }, // contrasena_inicial
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alumnos');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Plantilla_Alumnos_AulaCIM10.xlsx"',
      },
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso no autorizado.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error al generar la plantilla Excel.' }, { status: 500 });
  }
}
