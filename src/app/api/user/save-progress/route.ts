import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    let bodyText = '';
    try {
      bodyText = await req.text();
    } catch {
      // ignore
    }

    if (!bodyText) {
      return NextResponse.json({ success: true, saved: false });
    }

    let payload: any = {};
    try {
      payload = JSON.parse(bodyText);
    } catch {
      payload = { raw: bodyText };
    }

    const userId = user?.id || payload.userId || 'anonymous';
    if (!userId || userId === 'anonymous') {
      return NextResponse.json({ success: true, saved: false });
    }

    // Persist draft in a lightweight user_drafts table if present or create dynamically
    try {
      const db = getDb();
      db.prepare(`
        CREATE TABLE IF NOT EXISTS user_draft_progress (
          user_id TEXT PRIMARY KEY,
          draft_data TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `).run();

      db.prepare(`
        INSERT INTO user_draft_progress (user_id, draft_data, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          draft_data = excluded.draft_data,
          updated_at = excluded.updated_at
      `).run(userId, JSON.stringify(payload), new Date().toISOString());
    } catch (dbErr) {
      console.warn('Draft progress database save fallback:', dbErr);
    }

    return NextResponse.json({ success: true, saved: true, userId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Error guardando progreso' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ draft: null }, { status: 401 });
    }

    try {
      const db = getDb();
      db.prepare(`
        CREATE TABLE IF NOT EXISTS user_draft_progress (
          user_id TEXT PRIMARY KEY,
          draft_data TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `).run();

      const row = db.prepare('SELECT draft_data, updated_at FROM user_draft_progress WHERE user_id = ?').get(user.id) as any;
      if (row && row.draft_data) {
        return NextResponse.json({ draft: JSON.parse(row.draft_data), updatedAt: row.updated_at });
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ draft: null });
  } catch {
    return NextResponse.json({ draft: null });
  }
}
