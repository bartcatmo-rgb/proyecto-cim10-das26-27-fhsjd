import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EnvironmentBanner from '@/components/EnvironmentBanner';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AulaCIM-10 · FHSJD (DAS 26/27)',
  description: 'Codificación clínica CIM-10 · MEAP, ámbitos asistenciales y seguimiento por niveles para el Ciclo de Documentación y Administración Sanitarias',
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        <EnvironmentBanner />
        <Navbar user={user} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
