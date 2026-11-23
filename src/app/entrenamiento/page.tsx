import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getStudentDisciplineProgress } from '@/lib/db/queries';
import { DISCIPLINE_CATALOG, LEVELS_CONFIG, ALL_SERVICE_AREAS } from '@/lib/cim10/disciplines';
import { Award, Lock, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, ShieldAlert, Zap } from 'lucide-react';

export default async function TrainingSelectorPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }
  const progressMap = getStudentDisciplineProgress(user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-50 text-brand-700 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Entrenamiento Clínico MEAP por Niveles
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Escalera de aprendizaje de 5 niveles en cada ámbito asistencial. Supera el 80% (N1-N2) u 85% (N3-N5) para desbloquear el siguiente escalón.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/test/inversa"
            className="px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Cod. Inversa</span>
          </Link>
          <Link
            href="/kahoot"
            className="px-3.5 py-2 text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-purple-600 text-purple-600" />
            <span>Kahoot (10-20)</span>
          </Link>
          <Link
            href="/test/adaptativo"
            className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Adaptativo IA</span>
          </Link>
          <Link
            href="/test/repaso"
            className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
          >
            Repaso Errores
          </Link>
        </div>
      </div>

      {/* Levels Reference Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((lvlNum) => {
          const lvl = LEVELS_CONFIG[lvlNum];
          return (
            <div key={lvlNum} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{lvl.badge}</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700">
                  ≥ {lvl.requiredPassPercentage}%
                </span>
              </div>
              <div className="font-semibold text-slate-800 text-[11px]">{lvl.name.split(':')[1]}</div>
              <p className="text-[11px] text-slate-500 leading-tight">{lvl.description}</p>
            </div>
          );
        })}
      </div>

      {/* Disciplines and Level Grids */}
      <div className="space-y-6">
        {ALL_SERVICE_AREAS.map((areaKey) => {
          const disc = DISCIPLINE_CATALOG[areaKey];
          const prog = progressMap ? progressMap[areaKey] : null;
          const highestUnlocked = prog?.highestUnlockedLevel || 1;
          const attempts = prog?.attemptsCount || 0;
          const avgScore = prog?.averageScore || 0;

          return (
            <div
              key={areaKey}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${disc.bgLight}`}>
                      {disc.badge}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">
                      {disc.name}
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 max-w-3xl">
                    {disc.description}
                  </p>
                </div>

                <div className="text-xs text-slate-500 shrink-0 text-left sm:text-right">
                  <div>Desbloqueado hasta: <strong className="text-slate-900">Nivel {highestUnlocked}</strong> / 5</div>
                  <div className="text-[11px]">{attempts} intentos completados · {avgScore}% de media</div>
                </div>
              </div>

              {/* 5 Levels Row for this discipline */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((lvlNum) => {
                  const lvl = LEVELS_CONFIG[lvlNum];
                  const isUnlocked = lvlNum <= highestUnlocked;
                  const isCompleted = lvlNum < highestUnlocked;

                  return (
                    <div
                      key={lvlNum}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isUnlocked
                          ? 'bg-slate-50/70 border-slate-200 hover:border-brand-300 hover:shadow-sm'
                          : 'bg-slate-100/50 border-slate-200/60 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-mono font-bold text-slate-700">Nivel {lvlNum}</span>
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : isUnlocked ? (
                            <Sparkles className="w-4 h-4 text-brand-600" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>

                        <div className="text-xs font-semibold text-slate-900">
                          {lvl.name.split(':')[1]?.trim()}
                        </div>

                        <div className="mt-2 text-[10px] text-slate-500 line-clamp-2">
                          {lvl.focus}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60">
                        {isUnlocked ? (
                          <Link
                            href={`/test/${areaKey}/${lvlNum}`}
                            className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-center block bg-brand-700 hover:bg-brand-800 text-white transition-colors"
                          >
                            Iniciar Test
                          </Link>
                        ) : (
                          <div className="text-center text-[11px] text-slate-400 font-medium py-1.5">
                            Bloqueado (requiere N{lvlNum - 1})
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
