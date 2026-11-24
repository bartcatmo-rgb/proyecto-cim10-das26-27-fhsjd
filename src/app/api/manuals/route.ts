import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import {
  MANUALS_REGISTRY,
  getAllowedManualIds,
  getEffectiveProfile,
  readManualContent,
  ManualMeta,
} from '@/lib/manuals-data';
import { logSecurityEvent } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado. Inicie sesión para consultar los manuales.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const manualId = searchParams.get('id') as ManualMeta['id'] | null;
    const download = searchParams.get('download') === '1';

    const allowedIds = getAllowedManualIds(user);
    const profile = getEffectiveProfile(user);

    // Si se solicita un manual específico
    if (manualId) {
      if (!allowedIds.includes(manualId)) {
        logSecurityEvent({
          eventType: 'FORBIDDEN_403',
          userId: user.id,
          severity: 'WARN',
          details: `Usuario ${user.username} (perfil: ${profile}) intentó acceder al manual restringido: ${manualId}`,
        });

        return NextResponse.json(
          {
            error: 'Acceso denegado. Este manual no corresponde a su perfil institucional.',
            profile,
          },
          { status: 403 }
        );
      }

      const meta = MANUALS_REGISTRY.find((m) => m.id === manualId);
      if (!meta) {
        return NextResponse.json({ error: 'Manual no encontrado' }, { status: 404 });
      }

      const content = readManualContent(manualId);

      if (download) {
        return new Response(content, {
          status: 200,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Content-Disposition': `attachment; filename="${meta.filename}"`,
            'Cache-Control': 'no-store',
          },
        });
      }

      return NextResponse.json({
        manual: {
          id: meta.id,
          title: meta.title,
          category: meta.category,
          description: meta.description,
          filename: meta.filename,
          content,
        },
        profile,
      });
    }

    // Listado de manuales autorizados para este usuario
    const authorizedManuals = MANUALS_REGISTRY.filter((m) => allowedIds.includes(m.id)).map((m) => ({
      id: m.id,
      title: m.title,
      category: m.category,
      description: m.description,
      filename: m.filename,
      content: readManualContent(m.id),
    }));

    return NextResponse.json({
      profile,
      totalAllowed: authorizedManuals.length,
      manuals: authorizedManuals,
    });
  } catch (error) {
    console.error('Error en GET /api/manuals:', error);
    return NextResponse.json(
      { error: 'Error interno al consultar manuales' },
      { status: 500 }
    );
  }
}
