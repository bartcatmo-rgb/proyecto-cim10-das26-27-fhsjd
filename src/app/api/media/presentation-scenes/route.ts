import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCurrentUser } from '@/lib/auth/session';
import { getEffectiveProfile } from '@/lib/manuals-data';
import { logSecurityEvent } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado.' },
        { status: 401 }
      );
    }

    const profile = getEffectiveProfile(user);
    if (profile !== 'admin' && profile !== 'teacher') {
      logSecurityEvent({
        eventType: 'FORBIDDEN_403',
        userId: user.id,
        severity: 'WARN',
        details: `Usuario ${user.username} intentó acceder a los metadatos de la presentación multimedia.`,
      });

      return NextResponse.json(
        { error: 'Acceso restringido exclusivamente a docentes y administradores.' },
        { status: 403 }
      );
    }

    const scenesPath = path.join(process.cwd(), 'public', 'media', 'presentation-scenes.json');
    if (fs.existsSync(scenesPath)) {
      const content = fs.readFileSync(scenesPath, 'utf-8');
      const scenes = JSON.parse(content);
      return NextResponse.json({ scenes, hasAudio: true });
    }

    return NextResponse.json({ scenes: [], hasAudio: false });
  } catch (error) {
    console.error('Error en GET /api/media/presentation-scenes:', error);
    return NextResponse.json(
      { error: 'Error al cargar metadatos de presentación' },
      { status: 500 }
    );
  }
}
