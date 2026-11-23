import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { bulkInsertCim10Codes, bulkInsertQuestions } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { type, items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Debes proporcionar una lista de elementos (JSON).' }, { status: 400 });
    }

    if (type === 'codes') {
      const result = bulkInsertCim10Codes(items);
      return NextResponse.json({ success: true, ...result });
    } else if (type === 'questions') {
      const result = bulkInsertQuestions(items);
      return NextResponse.json({ success: true, ...result });
    } else {
      return NextResponse.json({ error: 'Tipo de importación no válido (debe ser "codes" o "questions").' }, { status: 400 });
    }
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error al procesar la importación masiva.' }, { status: 500 });
  }
}
