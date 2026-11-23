import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import LiveMonitorDashboard from '@/components/LiveMonitorDashboard';

export const metadata = {
  title: 'Monitor en Vivo del Aula · AulaCIM-10 · FHSJD',
};

export default async function AdminLiveMonitorPage() {
  const user = await getCurrentUser();
  if (!user || user.activeRole !== 'admin') {
    redirect('/');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <LiveMonitorDashboard />
    </div>
  );
}
