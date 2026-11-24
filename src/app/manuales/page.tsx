import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import {
  MANUALS_REGISTRY,
  getAllowedManualIds,
  getEffectiveProfile,
  readManualContent,
} from '@/lib/manuals-data';
import ManualsCenter, { ManualItem } from '@/components/ManualsCenter';

export const dynamic = 'force-dynamic';

export default async function ManualesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const profile = getEffectiveProfile(user);
  const allowedIds = getAllowedManualIds(user);
  const canWatchPresentation = profile === 'admin' || profile === 'teacher';

  const manuals: ManualItem[] = MANUALS_REGISTRY.filter((m) =>
    allowedIds.includes(m.id)
  ).map((m) => ({
    id: m.id,
    title: m.title,
    category: m.category,
    description: m.description,
    filename: m.filename,
    content: readManualContent(m.id),
  }));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 sm:p-8">
        <ManualsCenter
          profile={profile}
          manuals={manuals}
          canWatchPresentation={canWatchPresentation}
        />
      </main>
    </div>
  );
}
