import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getManagedTestAnswerKey } from '@/lib/db/queries';
import * as XLSX from 'xlsx';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const data = getManagedTestAnswerKey(id);

    if (!data) {
      return NextResponse.json({ error: 'Prueba no encontrada.' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');

    // Excel Export Option
    if (format === 'xlsx') {
      const rows = data.answerKey.map((item) => ({
        Numero: item.index,
        Caso_Clinico: item.caseTitle,
        Opcion_Correcta: item.correctOptionId,
        Codigo_CIM10: item.correctCode,
        Descripcion_Oficial: item.correctDescription,
        Analisis_Clinico: item.reasonedResolution.clinicalAnalysis,
        Ruta_CIM10: item.reasonedResolution.cim10Path,
        Verificacion_Normativa: item.reasonedResolution.ruleCheck,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet['!cols'] = [
        { wch: 8 },  // Numero
        { wch: 35 }, // Caso_Clinico
        { wch: 16 }, // Opcion_Correcta
        { wch: 14 }, // Codigo_CIM10
        { wch: 45 }, // Descripcion_Oficial
        { wch: 50 }, // Analisis_Clinico
        { wch: 40 }, // Ruta_CIM10
        { wch: 40 }, // Verificacion_Normativa
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Respuestas');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="Plantilla_Respuestas_${data.test.code}.xlsx"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso no autorizado: requiere rol docente.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error al recuperar plantilla de respuestas.' }, { status: 500 });
  }
}
