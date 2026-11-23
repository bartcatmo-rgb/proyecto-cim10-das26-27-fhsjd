'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Question, ServiceArea } from '@/types';
import { DISCIPLINE_CATALOG, LEVELS_CONFIG } from '@/lib/cim10/disciplines';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Send,
  HelpCircle,
  Stethoscope,
  Sparkles,
  Timer,
  ShieldAlert,
} from 'lucide-react';
import { useExamLockdown } from '@/lib/hooks/useExamLockdown';

interface TestRunnerProps {
  discipline: ServiceArea;
  level: number;
  questions: Question[];
  isRepaso?: boolean;
  isAdaptive?: boolean;
  examId?: string;
  timeLimitMinutes?: number;
}

export default function TestRunner({
  discipline,
  level,
  questions,
  isRepaso = false,
  isAdaptive = false,
  examId,
  timeLimitMinutes = 0,
}: TestRunnerProps) {
  const router = useRouter();
  const discInfo = DISCIPLINE_CATALOG[discipline] || DISCIPLINE_CATALOG.simulacro_integral;
  const levelInfo = LEVELS_CONFIG[level] || LEVELS_CONFIG[1];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    timeLimitMinutes > 0 ? timeLimitMinutes * 60 : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);
  isSubmittingRef.current = isSubmitting;

  // Anti-Cheat & Web Anti-Capture Lockdown
  const { warningMessage, dismissWarning, blurCount } = useExamLockdown({
    enabled: !isSubmitting,
    examCode: examId || `DISC_${discipline}_LVL_${level}`,
  });

  // Stopwatch / Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      if (timeLimitMinutes > 0) {
        setTimeRemaining((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(timer);
            // Trigger auto-submit when time expires
            if (!isSubmittingRef.current) {
              handleAutoSubmit();
            }
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimitMinutes]);

  // Periodic Live Classroom Heartbeat
  useEffect(() => {
    if (!examId) return;

    const sendHeartbeat = () => {
      fetch('/api/test/live-heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          currentQuestionIndex: currentIndex + 1,
          totalQuestions: questions.length,
          correctCount: 0,
          status: 'in_progress',
        }),
      }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 5000);
    return () => clearInterval(interval);
  }, [examId, currentIndex, questions.length]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">No hay casos clínicos disponibles</h2>
          <p className="text-xs text-slate-500">
            No se han encontrado preguntas cargadas para este nivel o filtro en el catálogo del aula.
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

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const currentAnswer = selectedAnswers[currentQ.id];

  const handleSelectOption = (optId: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optId,
    }));
  };

  const handleAutoSubmit = async () => {
    setIsSubmitting(true);
    const answersPayload = questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: selectedAnswers[q.id] || '',
    }));

    try {
      const res = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discipline,
          level,
          timeSpentSeconds: elapsedSeconds,
          answers: answersPayload,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (examId) {
          fetch('/api/test/live-heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              examId,
              currentQuestionIndex: totalQ,
              totalQuestions: totalQ,
              correctCount: data.result?.correctCount || 0,
              status: 'submitted',
            }),
          }).catch(() => {});
        }
        router.push(`/resultado/${data.result.attemptId}`);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (answeredCount < totalQ) {
      const confirmSubmit = window.confirm(
        `Has respondido ${answeredCount} de ${totalQ} preguntas. ¿Deseas entregar el test de todos modos? Las no respondidas contarán como fallo.`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    setError(null);

    const answersPayload = questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: selectedAnswers[q.id] || '',
    }));

    let attemptCount = 0;
    let savedSuccessfully = false;

    // Retry loop with backoff and local draft preservation
    while (attemptCount < 3 && !savedSuccessfully) {
      try {
        attemptCount++;
        const res = await fetch('/api/test/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            discipline,
            level,
            timeSpentSeconds: elapsedSeconds,
            answers: answersPayload,
          }),
        });

        const data = await res.json();
        if (res.ok && data.result?.attemptId) {
          savedSuccessfully = true;
          try {
            localStorage.removeItem(`draft_attempt_${discipline}_${level}`);
          } catch {}

          if (examId) {
            fetch('/api/test/live-heartbeat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                examId,
                currentQuestionIndex: totalQ,
                totalQuestions: totalQ,
                correctCount: data.result?.correctCount || 0,
                status: 'submitted',
              }),
            }).catch(() => {});
          }

          router.push(`/resultado/${data.result.attemptId}`);
          return;
        } else {
          throw new Error(data.error || 'Error al guardar el intento.');
        }
      } catch (submitErr: any) {
        if (attemptCount < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1500 * attemptCount));
        } else {
          // Preserve draft locally in case of total network disruption
          try {
            localStorage.setItem(
              `draft_attempt_${discipline}_${level}`,
              JSON.stringify({
                discipline,
                level,
                timeSpentSeconds: elapsedSeconds,
                answers: answersPayload,
                timestamp: new Date().toISOString(),
              })
            );
          } catch {}
          setError(
            'Problema de red o caída de conexión. Tus respuestas se han guardado localmente en este navegador. Puedes reintentar la entrega o descargar tu progreso.'
          );
          setIsSubmitting(false);
          return;
        }
      }
    }
  };

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
      
      {/* Test Status Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${discInfo.bgLight}`}>
              {isRepaso ? 'REPASO DE FALLOS' : isAdaptive ? 'MOTOR ADAPTATIVO IA' : discInfo.badge}
            </span>
            <span className="text-xs font-semibold text-slate-700">
              {isRepaso
                ? 'Test de Reentrenamiento'
                : isAdaptive
                ? 'Fórmula 60/25/15 Personalizada'
                : `Nivel ${level}: ${levelInfo.name.split(':')[1] || levelInfo.name}`}
            </span>
          </div>
          <h1 className="text-base font-bold text-slate-900 mt-1">
            {isRepaso
              ? 'Repaso de preguntas falladas anteriormente'
              : isAdaptive
              ? 'Entrenamiento Adaptativo Inteligente'
              : discInfo.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {timeRemaining !== null ? (
            <div
              className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border ${
                timeRemaining < 120
                  ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              <Timer className="w-4 h-4 text-amber-600" />
              <span>Restante: {formatTime(timeRemaining)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Entregando...' : 'Entregar Test'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Progress Pill Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Pregunta {currentIndex + 1} de {totalQ}</span>
          <span>{answeredCount} respondidas ({Math.round((answeredCount / totalQ) * 100)}%)</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-brand-600 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
          />
        </div>

        {/* Quick Nav Grid */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {questions.map((q, idx) => {
            const isAnswered = Boolean(selectedAnswers[q.id]);
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 text-xs font-bold rounded-lg transition-all ${
                  isCurrent
                    ? 'ring-2 ring-brand-700 bg-brand-700 text-white'
                    : isAnswered
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clinical Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Case Header */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-semibold">
              <Stethoscope className="w-3.5 h-3.5 text-brand-600" />
              {currentQ.serviceContext}
            </span>
            {currentQ.patientAge && (
              <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                Edad: {currentQ.patientAge}
              </span>
            )}
            {currentQ.patientGender && (
              <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                Sexo: {currentQ.patientGender}
              </span>
            )}
            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md font-semibold">
              Nivel {currentQ.level}
            </span>
          </div>

          <h2 className="text-lg font-bold text-slate-900">
            {currentQ.caseTitle}
          </h2>
        </div>

        {/* Clinical Scenario Text */}
        <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-sm sm:text-base leading-relaxed">
          <p className="font-sans font-medium">{currentQ.clinicalScenario}</p>
        </div>

        {/* Question Prompt */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Selecciona la codificación principal exacta o secuencia correcta:
          </p>

          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = currentAnswer === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id as 'A' | 'B' | 'C' | 'D')}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50 text-brand-950 shadow-sm ring-1 ring-brand-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-brand-700 text-white'
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
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {currentIndex < totalQ - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(totalQ - 1, prev + 1))}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Entregando...' : 'Finalizar y Calificar'}</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
