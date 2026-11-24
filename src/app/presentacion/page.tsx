import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getEffectiveProfile } from '@/lib/manuals-data';
import PresentationViewer from '@/components/PresentationViewer';
import { ArrowLeft, ShieldAlert, BookOpen } from 'lucide-react';

export default async function PresentacionPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const profile = getEffectiveProfile(user);
  const isAuthorized = profile === 'admin' || profile === 'teacher';

  if (!isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Acceso Restringido</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          La presentación multimedia íntegra del programa está reservada exclusivamente al claustro docente y miembros de la dirección académica.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 hover:bg-brand-400 text-slate-950 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Aula Virtual
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Migas de pan y retorno */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <Link href="/" className="hover:text-brand-600 transition">Inicio</Link>
          <span>/</span>
          <Link href="/manuales" className="hover:text-brand-600 transition">Manuales y Recursos</Link>
          <span>/</span>
          <span className="text-slate-800">Presentación Multimedia</span>
        </div>

        <Link
          href="/manuales"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-xs"
        >
          <BookOpen className="w-3.5 h-3.5 text-brand-600" />
          Ver Manuales de Uso
        </Link>
      </div>

      <PresentationViewer />
    </div>
  );
}
