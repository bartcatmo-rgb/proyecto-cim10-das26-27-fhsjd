import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { generateAdaptiveQuestions } from '@/lib/adaptive';
import TestRunner from '@/components/TestRunner';
import { Sparkles, Brain, Target, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Entrenamiento Adaptativo IA · AulaCIM-10 · FHSJD',
};

export default async function AdaptiveTestPage({
  searchParams,
}: {
  searchParams: Promise<{ discipline?: string; count?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  const resolvedParams = await searchParams;
  const count = Math.max(5, Math.min(30, Number(resolvedParams.count) || 10));
  const discipline = (resolvedParams.discipline as any) || undefined;

  const { questions, profile } = generateAdaptiveQuestions(user.id, discipline, count);

  return (
    <div className="space-y-6 pb-12">
      {/* Adaptive Header Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-amber-300 border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MOTOR ADAPTATIVO DINÁMICO · FÓRMULA 60 / 25 / 15</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">Sesión Adaptativa Personalizada</h1>
              <p className="text-xs sm:text-sm text-brand-100 max-w-xl">
                Casos seleccionados dinámicamente según tu historial: 60% refuerzo en fallos habituales, 25% reto de progresión de nivel y 15% consolidación de fortalezas.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10 text-right space-y-1">
              <div className="text-xs text-brand-200">Precisión Histórica</div>
              <div className="text-2xl font-bold font-mono text-emerald-300">{Math.round(profile.averageAccuracy)}%</div>
              <div className="text-xs text-amber-200 font-medium">Nivel Sugerido: {profile.suggestedLevel}</div>
            </div>
          </div>

          {profile.weakCategories.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-brand-200 font-semibold flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-rose-300" />
                Refuerzo específico activado en:
              </span>
              {profile.weakCategories.map((cat) => (
                <span key={cat} className="px-2 py-0.5 bg-rose-500/30 text-rose-100 border border-rose-400/30 rounded-md font-mono text-[11px]">
                  {cat.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <TestRunner
        discipline={discipline || 'simulacro_integral'}
        level={profile.suggestedLevel}
        questions={questions}
        isAdaptive={true}
      />
    </div>
  );
}
