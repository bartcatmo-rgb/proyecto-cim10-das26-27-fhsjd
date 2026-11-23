'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReverseCodingCase, ServiceArea } from '@/types';
import { DISCIPLINE_CATALOG } from '@/lib/cim10/disciplines';
import { useExamLockdown } from '@/lib/hooks/useExamLockdown';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Stethoscope,
  Search,
  BookOpen,
  Award,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';

interface Props {
  initialCases: ReverseCodingCase[];
  discipline?: ServiceArea;
}

export default function ReverseCodingRunner({ initialCases, discipline }: Props) {
  const router = useRouter();
  const [cases] = useState<ReverseCodingCase[]>(initialCases);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [revealedCases, setRevealedCases] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finalResult, setFinalResult] = useState<any | null>(null);

  // Anti-Cheat & Web Anti-Capture Lockdown
  const { warningMessage, dismissWarning, blurCount } = useExamLockdown({
    enabled: !isFinished && !isSubmitting,
    examCode: `REVERSE_CODING_${discipline || 'ALL'}`,
  });

  if (!cases || cases.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
          <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">No hay casos de codificación inversa cargados</h2>
          <p className="text-xs text-slate-500">
            No se han encontrado casos de auditoría para este ámbito en la base de datos.
          </p>
          <button
            onClick={() => router.push('/entrenamiento')}
            className="px-4 py-2 bg-brand-700 text-white rounded-xl text-xs font-bold"
          >
            Volver a entrenamientos
          </button>
        </div>
      </div>
    );
  }

  const currentCase = cases[currentIndex];
  const totalCases = cases.length;
  const currentAnswer = selectedAnswers[currentCase.id];
  const isRevealed = revealedCases[currentCase.id];

  const handleSelectOption = (optId: 'A' | 'B' | 'C' | 'D') => {
    if (isRevealed) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentCase.id]: optId,
    }));
  };

  const handleVerify = () => {
    if (!currentAnswer) return;
    setRevealedCases((prev) => ({
      ...prev,
      [currentCase.id]: true,
    }));
  };

  const handleSubmitAll = async () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < totalCases) {
      const confirmSubmit = window.confirm(
        `Has corregido ${answeredCount} de ${totalCases} casos. ¿Deseas entregar la auditoría? Los casos no corregidos contarán como error.`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    const answersPayload = cases.map((c) => ({
      caseId: c.id,
      selectedOptionId: selectedAnswers[c.id] || '',
    }));

    try {
      const res = await fetch('/api/test/reverse-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discipline: discipline || 'simulacro_integral',
          timeSpentSeconds: 120,
          answers: answersPayload,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFinalResult(data.result);
        setIsFinished(true);
      }
    } catch {
      alert('Error al registrar la auditoría en la base de datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Summary View after submitting all
  if (isFinished && finalResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-600 mb-2">
            <Award className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Auditoría de Codificación Inversa Completada
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Se han verificado tus correcciones frente a la normativa oficial CIM-10 y se ha guardado el informe en tu historial.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Puntuación</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{finalResult.score}%</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Aciertos</span>
              <div className="text-3xl font-black text-emerald-600 mt-1">{finalResult.correctCount} / {finalResult.totalQuestions}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Resultado</span>
              <div className={`text-xl font-bold mt-2 ${finalResult.passed ? 'text-emerald-700' : 'text-rose-600'}`}>
                {finalResult.passed ? 'Aprobado' : 'Refuerzo requerido'}
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Historial</span>
              <div className="text-xs font-mono font-semibold text-slate-600 mt-2">Guardado atómicamente</div>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                setIsFinished(false);
                setSelectedAnswers({});
                setRevealedCases({});
                setCurrentIndex(0);
              }}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Repetir Auditoría</span>
            </button>
            <button
              onClick={() => router.push('/historial')}
              className="px-5 py-2.5 bg-brand-700 text-white rounded-xl text-xs font-bold hover:bg-brand-800 transition-colors"
            >
              Ver en Mi Historial
            </button>
            <button
              onClick={() => router.push('/entrenamiento')}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Volver al Aula
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 select-none">
      {/* Integrity Warning Modal */}
      {warningMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border-2 border-amber-500 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600">
              <ShieldAlert className="w-8 h-8 flex-shrink-0" />
              <h3 className="text-base font-black text-slate-900">Aviso de Integridad en Examen</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {warningMessage}
            </p>
            <div className="p-2.5 bg-amber-50 rounded-xl text-[11px] text-amber-800">
              Incidencias acumuladas en este test: <strong>{blurCount}</strong>. Todas las acciones quedan auditadas.
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={dismissWarning}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                Entendido y continuar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              MODALIDAD INTERACTIVA
            </span>
            <span className="text-xs font-bold text-slate-700 uppercase">
              Auditoría y Corrección de Errores (Codificación Inversa)
            </span>
          </div>
          <h1 className="text-base font-bold text-slate-900 mt-1">
            Detecta el fallo clínico en el informe y sustitúyelo por el código oficial válido
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
            Caso {currentIndex + 1} de {totalCases}
          </span>
          <button
            onClick={handleSubmitAll}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Guardando...' : 'Finalizar Auditoría'}</span>
          </button>
        </div>
      </div>

      {/* Progress Selector */}
      <div className="flex flex-wrap gap-1.5 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        {cases.map((c, idx) => {
          const isAnswered = Boolean(selectedAnswers[c.id]);
          const isRev = Boolean(revealedCases[c.id]);
          const isCorrect = isRev && selectedAnswers[c.id] === c.correctOptionId;
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={c.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${
                isCurrent
                  ? 'ring-2 ring-amber-600 bg-amber-600 text-white'
                  : isRev
                  ? isCorrect
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                  : isAnswered
                  ? 'bg-slate-200 text-slate-800 font-bold'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Clinical Case & Audit Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Header of case */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-semibold">
              <Stethoscope className="w-3.5 h-3.5 text-brand-600" />
              {currentCase.serviceContext}
            </span>
            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md font-semibold">
              Dificultad Nivel {currentCase.level}
            </span>
            <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-md font-semibold capitalize">
              Tipo de fallo: {currentCase.auditFlawType.replace(/_/g, ' ')}
            </span>
          </div>

          <h2 className="text-lg font-bold text-slate-900">
            {currentCase.caseTitle}
          </h2>
        </div>

        {/* Clinical Scenario */}
        <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-sm sm:text-base leading-relaxed">
          <p className="font-sans font-medium">{currentCase.clinicalScenario}</p>
        </div>

        {/* Flawed Proposed Coding Banner */}
        <div className="p-5 bg-amber-50/70 border-2 border-amber-300 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Codificación Inicial Propuesta en el Informe (CONTIENE ERROR)</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-3 pt-1">
            <span className="px-3 py-1 bg-amber-200/80 text-amber-950 font-mono text-sm font-black rounded-lg border border-amber-300">
              {currentCase.initialProposedCode}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-amber-950">
              {currentCase.initialProposedDescription}
            </span>
          </div>
          {currentCase.auditFlawHint && (
            <p className="text-xs text-amber-800/90 pt-1 italic">
              <strong>Pista de auditoría:</strong> {currentCase.auditFlawHint}
            </p>
          )}
        </div>

        {/* Options Prompt */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
            Selecciona el código CIM-10 correcto que subsana el error detectado:
          </p>

          <div className="space-y-3">
            {currentCase.options.map((opt) => {
              const isSelected = currentAnswer === opt.id;
              const isCorrectOpt = opt.id === currentCase.correctOptionId;

              let cardStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';
              if (isRevealed) {
                if (isCorrectOpt) {
                  cardStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                } else if (isSelected && !isCorrectOpt) {
                  cardStyle = 'border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-400';
                } else {
                  cardStyle = 'border-slate-200 bg-slate-50/60 opacity-60 text-slate-600';
                }
              } else if (isSelected) {
                cardStyle = 'border-amber-600 bg-amber-50 text-amber-950 shadow-sm ring-1 ring-amber-600';
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id as any)}
                  disabled={isRevealed}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${cardStyle}`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      isRevealed && isCorrectOpt
                        ? 'bg-emerald-600 text-white'
                        : isRevealed && isSelected && !isCorrectOpt
                        ? 'bg-rose-600 text-white'
                        : isSelected
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <div className="flex-1 space-y-1">
                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 font-mono text-xs font-bold rounded border border-slate-200">
                      {opt.code}
                    </span>
                    <p className="text-xs sm:text-sm font-medium">{opt.text}</p>
                  </div>
                  {isRevealed && isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  )}
                  {isRevealed && isSelected && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button: Verify & Show Reasoned Resolution */}
        {!isRevealed ? (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleVerify}
              disabled={!currentAnswer}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Verificar Corrección y Ver Razonamiento</span>
            </button>
          </div>
        ) : (
          /* Reasoned Resolution 4-Block Breakdown */
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-600" />
                Resolución Razonada del Dictamen de Auditoría
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  currentAnswer === currentCase.correctOptionId
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {currentAnswer === currentCase.correctOptionId ? '¡Corrección Acertada!' : 'Corrección Errónea'}
              </span>
            </div>

            <div className="p-3.5 bg-amber-100/60 rounded-xl border border-amber-200 text-xs text-amber-950 font-medium">
              <strong className="block text-amber-900 mb-0.5 font-bold uppercase text-[10px]">
                Fallo Clínico Detectado en el Informe Inicial:
              </strong>
              {currentCase.reasonedResolution.flawDetected}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold text-[11px]">1. Análisis Clínico y Jerarquía:</strong>
                <p className="text-slate-600 leading-relaxed">{currentCase.reasonedResolution.clinicalAnalysis}</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold text-[11px]">2. Ruta Tabular CIM-10:</strong>
                <p className="text-slate-600 font-mono text-[11px] leading-relaxed">{currentCase.reasonedResolution.cim10Path}</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold text-[11px]">3. Verificación de Reglas (Excluye/7º Carácter):</strong>
                <p className="text-slate-600 leading-relaxed">{currentCase.reasonedResolution.ruleCheck}</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold text-[11px]">4. Justificación de Distractores:</strong>
                <div className="space-y-0.5 text-slate-600 text-[11px]">
                  {Object.entries(currentCase.reasonedResolution.distractorExplanations).map(([k, v]) => (
                    <div key={k}>
                      <span className="font-bold">{k}:</span> {v}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {currentIndex < totalCases - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(totalCases - 1, prev + 1))}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <span>Siguiente Caso</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitAll}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Finalizar y Entregar Auditoría'}</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
