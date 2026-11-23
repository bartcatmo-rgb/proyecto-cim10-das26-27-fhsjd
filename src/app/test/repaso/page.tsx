import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getFailedQuestionsForStudent } from '@/lib/db/queries';
import TestRunner from '@/components/TestRunner';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function RepasoPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  const failedQuestions = getFailedQuestionsForStudent(user.id, 20);

  if (failedQuestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            ¡No tienes fallos pendientes de repaso!
          </h1>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Has acertado todas tus preguntas o aún no has realizado tests con errores registrados. ¡Buen trabajo!
          </p>
          <div className="pt-2">
            <Link
              href="/entrenamiento"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ir a entrenar nuevos casos</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <TestRunner
        discipline="simulacro_integral"
        level={3}
        questions={failedQuestions}
        isRepaso={true}
      />
    </div>
  );
}
