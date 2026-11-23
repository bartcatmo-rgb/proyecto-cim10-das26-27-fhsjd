import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getQuestionsByDisciplineAndLevel } from '@/lib/db/queries';
import { ServiceArea } from '@/types';
import { ALL_SERVICE_AREAS } from '@/lib/cim10/disciplines';
import TestRunner from '@/components/TestRunner';

interface Props {
  params: Promise<{ discipline: string; level: string }>;
  searchParams: Promise<{ examId?: string; timeLimit?: string }>;
}

export default async function TestPage({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  const { discipline, level } = await params;
  const { examId, timeLimit } = await searchParams;

  if (!ALL_SERVICE_AREAS.includes(discipline as ServiceArea)) {
    notFound();
  }

  const parsedLevel = parseInt(level, 10);
  if (isNaN(parsedLevel) || parsedLevel < 1 || parsedLevel > 5) {
    notFound();
  }

  const questions = getQuestionsByDisciplineAndLevel(discipline as ServiceArea, parsedLevel, 10);

  return (
    <div className="py-6">
      <TestRunner
        discipline={discipline as ServiceArea}
        level={parsedLevel}
        questions={questions}
        examId={examId}
        timeLimitMinutes={timeLimit ? Number(timeLimit) : 0}
      />
    </div>
  );
}
