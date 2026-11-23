import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import DigitalWhiteboard from '@/components/DigitalWhiteboard';

export const metadata = {
  title: 'Pizarra Digital de Aula · AulaCIM-10 · FHSJD',
};

export default async function PizarraPage() {
  const user = await getCurrentUser();
  if (!user || user.activeRole !== 'admin') {
    redirect('/');
  }
  return <DigitalWhiteboard />;
}
