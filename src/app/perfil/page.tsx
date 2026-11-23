import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getStudentReports, getStudentDisciplineProgress } from '@/lib/db/queries';
import StudentProfileView from '@/components/StudentProfileView';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  const reports = getStudentReports(user.id);
  const progressMap = getStudentDisciplineProgress(user.id);

  return <StudentProfileView user={user} reports={reports} progressMap={progressMap} />;
}
