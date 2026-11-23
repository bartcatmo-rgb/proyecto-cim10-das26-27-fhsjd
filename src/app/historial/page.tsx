import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getStudentAttempts } from '@/lib/db/queries';
import { DISCIPLINE_CATALOG, LEVELS_CONFIG } from '@/lib/cim10/disciplines';
import { History, CheckCircle2, XCircle, Clock, ArrowRight, BookOpen } from 'lucide-react';

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  const attempts = getStudentAttempts(user.id, 50);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-50 text-brand-700 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Historial de Intentos y Evaluaciones
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Registro cronológico inmutable de todos tus entrenamientos, puntuaciones y acceso a la resolución razonada.
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          Total de evaluaciones registradas: <strong className="text-slate-900">{attempts.length}</strong>
        </div>
      </div>

      {/* Attempts List */}
      <div className="space-y-3">
        {attempts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-base font-bold text-slate-800">Aún no has completado ningún test</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Accede a la sección de entrenamiento para realizar tus primeros casos clínicos por ámbitos asistenciales.
            </p>
            <div className="pt-2">
              <Link
                href="/entrenamiento"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-xl text-xs font-bold"
              >
                <span>Comenzar entrenamiento</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          attempts.map((att) => {
            const disc = DISCIPLINE_CATALOG[att.discipline] || DISCIPLINE_CATALOG.simulacro_integral;
            const lvl = LEVELS_CONFIG[att.level] || LEVELS_CONFIG[1];

            return (
              <div
                key={att.id}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      att.passed
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {att.passed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${disc.bgLight}`}>
                        {disc.badge}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {disc.name}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        · Nivel {att.level}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{new Date(att.createdAt).toLocaleDateString('es-ES')} a las {new Date(att.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {Math.floor(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s
                      </span>
                      <span>·</span>
                      <span>{att.correctCount} / {att.totalQuestions} aciertos</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="text-right">
                    <div
                      className={`text-xl font-black ${
                        att.passed ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {att.score}%
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">
                      {att.passed ? 'Aprobado' : 'No superado'}
                    </span>
                  </div>

                  <Link
                    href={`/resultado/${att.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
                  >
                    <span>Ver Resolución</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
