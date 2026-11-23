import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getReverseCodingCases } from '@/lib/db/queries';
import { ServiceArea } from '@/types';
import ReverseCodingRunner from '@/components/ReverseCodingRunner';

export const metadata = {
  title: 'Codificación Inversa · Detección de Errores · AulaCIM-10 · FHSJD',
  description: 'Auditoría clínica CIM-10: detección de fallos intencionados en informes clínicos y corrección mediante normativa oficial.',
};

export default async function ReverseCodingPage({
  searchParams,
}: {
  searchParams: Promise<{ discipline?: string; limit?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  const resolvedParams = await searchParams;
  const discipline = (resolvedParams.discipline as ServiceArea) || undefined;
  const limit = Math.max(5, Math.min(20, Number(resolvedParams.limit) || 10));

  const cases = getReverseCodingCases(discipline, limit);

  return (
    <div className="py-6">
      <ReverseCodingRunner
        initialCases={cases}
        discipline={discipline}
      />
    </div>
  );
}
