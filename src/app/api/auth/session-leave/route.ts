import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session';

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true, message: 'Sesión finalizada por cierre de aplicación.' });
  } catch {
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
