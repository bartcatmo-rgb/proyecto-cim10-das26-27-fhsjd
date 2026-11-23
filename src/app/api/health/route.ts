import { NextResponse } from 'next/server';
import { getDb, isEphemeralEnvironment, getDbPath } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  try {
    const db = getDb();
    const result = db.prepare('SELECT 1 as healthy').get() as { healthy: number };
    const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number })?.c || 0;
    const questionCount = (db.prepare('SELECT COUNT(*) as c FROM questions').get() as { c: number })?.c || 0;
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: 'ok',
      service: 'AulaCIM-10 · FHSJD (DAS 26/27)',
      environment: process.env.VERCEL ? 'vercel-serverless' : 'local-lan',
      isEphemeral: isEphemeralEnvironment(),
      database: {
        status: result?.healthy === 1 ? 'connected' : 'degraded',
        path: process.env.NODE_ENV === 'production' ? 'protected' : getDbPath(),
        users: userCount,
        questions: questionCount,
      },
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'degraded',
        service: 'AulaCIM-10 · FHSJD (DAS 26/27)',
        error: err.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
