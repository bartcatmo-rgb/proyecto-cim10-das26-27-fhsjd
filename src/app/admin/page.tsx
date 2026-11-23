import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getGroupAnalytics, getAllStudents, getAcademicCourses, logSecurityEvent } from '@/lib/db/queries';
import AdminPanel from '@/components/AdminPanel';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  if (user.activeRole !== 'admin') {
    logSecurityEvent({
      eventType: 'UNAUTHORIZED_ADMIN_PAGE_ACCESS',
      userId: user.id,
      severity: 'WARNING',
      details: `Usuario ${user.username} (rol activo: ${user.activeRole}) intentó acceder a la vista protegida /admin.`,
    });
    redirect('/');
  }

  const courses = getAcademicCourses();
  const currentCourse = courses.find((c) => c.isCurrent) || courses[0];
  const initialCourseId = currentCourse?.id || 'DAS-26-27';

  const analytics = getGroupAnalytics(initialCourseId);
  const students = getAllStudents(false, initialCourseId); // Unmasked DNI for verified admin

  return (
    <AdminPanel
      adminUser={user}
      analytics={analytics}
      students={students}
      initialCourses={courses}
      initialCourseId={initialCourseId}
    />
  );
}
