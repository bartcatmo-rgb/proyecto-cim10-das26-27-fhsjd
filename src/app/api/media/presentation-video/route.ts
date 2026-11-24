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
        { error: 'No autenticado. Inicie sesión para acceder al recurso multimedia.' },
        { status: 401 }
      );
    }

    const profile = getEffectiveProfile(user);
    if (profile !== 'admin' && profile !== 'teacher') {
      logSecurityEvent({
        eventType: 'FORBIDDEN_403',
        userId: user.id,
        severity: 'WARN',
        details: `Usuario ${user.username} (rol: ${user.role}, perfil: ${profile}) intentó acceder a la Presentación Multimedia restringida.`,
      });

      return NextResponse.json(
        { error: 'Acceso restringido exclusivamente a miembros del claustro docente y administradores.' },
        { status: 403 }
      );
    }

    // Comprobar si existe el archivo de vídeo MP4 en public/media
    const videoPath = path.join(process.cwd(), 'public', 'media', 'aulacim10-presentacion.mp4');

    if (fs.existsSync(videoPath)) {
      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = request.headers.get('range');

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const fileStream = fs.createReadStream(videoPath, { start, end });

        // @ts-expect-error Node ReadStream to Web ReadableStream
        return new Response(fileStream, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize.toString(),
            'Content-Type': 'video/mp4',
          },
        });
      }

      const fileStream = fs.createReadStream(videoPath);
      // @ts-expect-error Node ReadStream to Web ReadableStream
      return new Response(fileStream, {
        status: 200,
        headers: {
          'Content-Length': fileSize.toString(),
          'Content-Type': 'video/mp4',
          'Accept-Ranges': 'bytes',
        },
      });
    }

    // Si el MP4 no existe en el sistema de archivos (p. ej. en Vercel si no se subió binario grande),
    // reportar disponibilidad del reproductor interactivo con voz neural
    return NextResponse.json({
      available: false,
      interactiveAvailable: true,
      audioAvailable: true,
      message: 'Vídeo MP4 pre-renderizado no presente. El reproductor interactivo guiado por voz neural FHSJD está disponible.',
    });
  } catch (error) {
    console.error('Error en GET /api/media/presentation-video:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el recurso de vídeo' },
      { status: 500 }
    );
  }
}
