import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getActiveExam } from '@/lib/db/queries';
import ExamConfigurator from '@/components/ExamConfigurator';

export const metadata = {
  title: 'Configurador de Pruebas · AulaCIM-10 · FHSJD',
};

export default async function AdminPruebasPage() {
  const user = await getCurrentUser();
  if (!user || user.activeRole !== 'admin') {
    redirect('/');
  }

  const activeExam = getActiveExam();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ExamConfigurator initialActiveExam={activeExam} />
    </div>
  );
}
