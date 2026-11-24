'use client';

import React, { useEffect, useState } from 'react';
import { User } from '@/types';
import { CheckCircle2, RotateCcw, X } from 'lucide-react';

interface Props {
  user: User | null;
}

export default function SessionLifecycleManager({ user }: Props) {
  const [restoredNotice, setRestoredNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const userId = user.id;
    const storageKey = `aulacim10_saved_progress_${userId}`;

    // 1. Check for restored progress on mount
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.answers || parsed.chatDraft || parsed.activeTopicId || parsed.testId)) {
          setRestoredNotice('Progreso de tu sesión anterior guardado y disponible para continuar.');
        }
      }
    } catch {
      // ignore
    }

    // 2. Continuous progress auto-saver helper
    const captureCurrentProgress = () => {
      try {
        const answersRaw = localStorage.getItem('aulacim10_exam_answers') || localStorage.getItem('active_test_answers');
        const chatDraft = localStorage.getItem('aulacim10_chat_draft') || '';
        const activeTopicId = localStorage.getItem('aulacim10_active_topic') || '';
        const courseId = localStorage.getItem('aulacim10_admin_active_academic_year') || '';

        const progressPayload = {
          userId,
          timestamp: new Date().toISOString(),
          answers: answersRaw ? JSON.parse(answersRaw) : null,
          chatDraft,
          activeTopicId,
          courseId,
        };

        localStorage.setItem(storageKey, JSON.stringify(progressPayload));
        return progressPayload;
      } catch {
        return { userId, timestamp: new Date().toISOString() };
      }
    };

    // 3. Handle pagehide & beforeunload: save progress & expire session on window close
    const handleUnloadOrHide = (e: Event) => {
      const progress = captureCurrentProgress();

      // Flush progress to server via sendBeacon
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        try {
          const blob = new Blob([JSON.stringify(progress)], { type: 'application/json' });
          navigator.sendBeacon('/api/user/save-progress', blob);
          // Expire session on leaving/closing window
          navigator.sendBeacon('/api/auth/session-leave', new Blob(['leave'], { type: 'text/plain' }));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('pagehide', handleUnloadOrHide);
    window.addEventListener('beforeunload', handleUnloadOrHide);

    // Periodic auto-save every 30 seconds
    const interval = setInterval(() => {
      captureCurrentProgress();
    }, 30000);

    return () => {
      window.removeEventListener('pagehide', handleUnloadOrHide);
      window.removeEventListener('beforeunload', handleUnloadOrHide);
      clearInterval(interval);
    };
  }, [user]);

  if (!restoredNotice) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-slate-900/95 text-white p-3 rounded-xl border border-slate-700 shadow-2xl backdrop-blur-md text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">{restoredNotice}</span>
        </div>
        <button
          onClick={() => setRestoredNotice(null)}
          className="text-slate-400 hover:text-white p-0.5 rounded"
          aria-label="Cerrar notificación"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
