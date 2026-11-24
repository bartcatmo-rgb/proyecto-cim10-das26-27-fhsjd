import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getChatChannels } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const channels = getChatChannels(user.courseId || 'DAS-26-27');
    return NextResponse.json({ success: true, channels });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'No autorizado. Se requiere sesión activa en AulaCIM-10.' },
      { status: 401 }
    );
  }
}
