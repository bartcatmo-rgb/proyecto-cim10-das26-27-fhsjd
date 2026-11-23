import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getAttemptById } from '@/lib/db/queries';
import AttemptReviewView from '@/components/AttemptReviewView';

interface Props {
  params: Promise<{ attemptId: string }>;
}

export default async function ResultPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  const { attemptId } = await params;
  const data = getAttemptById(attemptId);

  if (!data) {
    notFound();
  }

  // Ensure security: only the student who took the test or an admin can view the attempt
  if (user.role !== 'admin' && data.attempt.userId !== user.id) {
    redirect('/');
  }

  return <AttemptReviewView attempt={data.attempt} details={data.details} />;
}
