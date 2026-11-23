import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { ServiceArea } from '@/types';
import KahootRunner from '@/components/KahootRunner';

export const metadata = {
  title: 'Ronda Tipo Kahoot (10–20 Preguntas) · AulaCIM-10 · FHSJD',
  description: 'Modo competitivo de codificación clínica: rondas rápidas de 10 a 20 casos clínicos MEAP con puntuación en vivo y podio de honor 1º, 2º y 3º.',
};

export default async function KahootPage({
  searchParams,
}: {
  searchParams: Promise<{ discipline?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  const resolvedParams = await searchParams;
  const discipline = (resolvedParams.discipline as ServiceArea) || undefined;

  return (
    <div className="py-6">
      <KahootRunner
        currentUser={user}
        initialDiscipline={discipline}
      />
    </div>
  );
}
