'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Send,
  ArrowRight,
  ShieldAlert,
  Loader2,
  FileCheck2,
  Award,
  Sparkles,
} from 'lucide-react';
import { DISCIPLINE_CATALOG } from '@/lib/cim10/disciplines';
import { ServiceArea } from '@/types';
import { useExamLockdown } from '@/lib/hooks/useExamLockdown';

export default function DirectTestRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const testCode = String(params?.code || '').toUpperCase();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [test, setTest] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);

  // Active exam state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number | null>(null);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);

  // Classroom Anti-Cheat and Web Anti-Capture Lockdown
  const { warningMessage, dismissWarning, blurCount } = useExamLockdown({
    enabled: !submittedResult && !loading && !error && Boolean(test),
    examCode: testCode,
  });

  // Load session and test data
  useEffect(() => {
    async function loadTestSession() {
      try {
        setLoading(true);
        setError(null);

        // Check user session
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          window.location.href = '/';
          return;
        }
        const authData = await authRes.json();
        setUser(authData.user);

        // Fetch test by code
        const testRes = await fetch(`/api/test/managed/${testCode}`);
        if (!testRes.ok) {
          const errData = await testRes.json();
          setError(errData.error || 'No se pudo cargar la prueba.');
          setLoading(false);
          return;
        }

        const data = await testRes.json();
        setTest(data.test);
        setQuestions(data.questions || []);

        if (data.test.timeLimitMinutes > 0) {
          setTimeRemainingSeconds(data.test.timeLimitMinutes * 60);
        }
      } catch (err: any) {
        setError('Error de conexión al cargar la sesión de prueba.');
      } finally {
        setLoading(false);
      }
    }

    if (testCode) {
      loadTestSession();
    }
  }, [testCode]);

  // Clock countdown & elapsed time tracker
  useEffect(() => {
    if (submittedResult || loading || error || !test) return;

    const interval = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);

      if (timeRemainingSeconds !== null) {
        setTimeRemainingSeconds((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemainingSeconds, submittedResult, loading, error, test]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (submittedResult) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleAutoSubmit = () => {
    if (submitting || submittedResult) return;
    submitExamAnswers(true);
  };

  const submitExamAnswers = async (isAutoSubmit = false) => {
    if (submitting || submittedResult) return;
    setSubmitting(true);

    try {
      const answersPayload = questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: selectedAnswers[q.id] || '',
      }));

      let endpoint = '/api/test/submit';
      let bodyData: any = {
        discipline: test.discipline,
        level: test.level,
        timeSpentSeconds,
        answers: answersPayload,
        courseId: test.courseId,
        testId: test.id,
      };

      if (test.testType === 'reverse_coding') {
        endpoint = '/api/test/reverse-submit';
        bodyData = {
          answers: answersPayload,
          timeSpentSeconds,
          testId: test.id,
          courseId: test.courseId,
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la entrega.');
      }

      setSubmittedResult(data.result || data);
    } catch (err: any) {
      alert(`Error al entregar la prueba: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatClock = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Conectando a la prueba convocada...</h2>
        <p className="text-sm text-slate-500 font-mono mt-1">Código: {testCode}</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <main className="flex-1 max-w-xl mx-auto w-full p-6 flex flex-col justify-center text-center">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Acceso a la Convocatoria</h1>
            <p className="text-sm text-slate-600">{error || 'Prueba no encontrada o no disponible.'}</p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/login?redirect=/prueba/${testCode}`}
                className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition shadow-sm text-sm"
              >
                Iniciar Sesión de Alumno
              </Link>
              <Link
                href="/"
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition text-sm"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Submitted view
  if (submittedResult) {
    const isPassed = submittedResult.passed;
    const scoreVal = submittedResult.score;
    const correctVal = submittedResult.correctCount;
    const totalVal = submittedResult.totalQuestions;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <main className="flex-1 max-w-3xl mx-auto w-full p-6 py-10 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              <Award className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Resultado Oficial Guardado</span>
              <h1 className="text-3xl font-black text-slate-900 mt-1">{test.title}</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">Convocatoria: {test.code} · Curso {test.courseId}</p>
            </div>

            <div className="py-6 border-y border-slate-100 grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-slate-500 font-medium">Calificación</div>
                <div className={`text-4xl font-black mt-1 ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {scoreVal} <span className="text-lg font-normal text-slate-400">/ 100</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Aciertos</div>
                <div className="text-4xl font-black text-slate-800 mt-1">
                  {correctVal} <span className="text-lg font-normal text-slate-400">/ {totalVal}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Tiempo Empleado</div>
                <div className="text-4xl font-black text-slate-800 mt-1">
                  {formatClock(timeSpentSeconds)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href="/examenes-realizados"
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm text-sm inline-flex items-center gap-2"
              >
                <FileCheck2 className="w-4 h-4" />
                Ver Resoluciones Razonadas y Repaso
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm"
              >
                Volver al Panel Principal
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col select-none">
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
              Incidencias acumuladas en esta sesión: <strong>{blurCount}</strong>. Todas las acciones quedan registradas en el log docente.
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={dismissWarning}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                Entendido y continuar examen
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Floating Top Bar with Exam details and Countdown Clock */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 px-6 py-3 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-brand-700/80 rounded-lg text-xs font-mono font-bold">
              {test.code}
            </span>
            <div>
              <div className="text-sm font-bold truncate max-w-xs sm:max-w-md">{test.title}</div>
              <div className="text-xs text-slate-400">
                Curso {test.courseId} · {DISCIPLINE_CATALOG[test.discipline as ServiceArea]?.name || test.discipline}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {timeRemainingSeconds !== null && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm ${
                timeRemainingSeconds < 120
                  ? 'bg-red-950/80 border-red-700 text-red-400 animate-pulse'
                  : timeRemainingSeconds < 300
                  ? 'bg-rose-950/80 border-rose-700 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-amber-400'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatClock(timeRemainingSeconds)}</span>
              </div>
            )}

            <button
              onClick={() => submitExamAnswers(false)}
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Entregar Examen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Question Body */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 py-8 space-y-6">
        {/* Progress pill bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <span>Caso {currentIndex + 1} de {totalQuestions}</span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-600">{answeredCount} respondidas</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(selectedAnswers[q.id]);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-brand-600 text-white ring-2 ring-brand-300'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Question Card */}
        {currentQ && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <span className="text-xs uppercase font-bold text-brand-700 tracking-wider">
                {currentQ.serviceContext || 'Ámbito Clínico Asistencial'}
              </span>
              {currentQ.level && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                  Nivel {currentQ.level}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {currentQ.caseTitle}
              </h2>
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-sm leading-relaxed text-slate-700">
                {currentQ.clinicalScenario}
              </div>
            </div>

            {/* If reverse coding case, show current wrong code */}
            {currentQ.currentCoded && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Codificación Previa Asignada (Contiene un error de auditoría clínica):
                </div>
                <div className="font-mono font-bold text-amber-950 text-sm">
                  {currentQ.currentCoded.code} · {currentQ.currentCoded.title}
                </div>
              </div>
            )}

            {/* Options list */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Selecciona la opción de codificación CIM-10 correcta:
              </div>

              {currentQ.options?.map((opt: any) => {
                const isSelected = selectedAnswers[currentQ.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/50 shadow-sm ring-1 ring-brand-500'
                        : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs mt-0.5 ${
                      isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {opt.id}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="font-mono font-bold text-slate-900 text-base">
                        {opt.code}
                      </div>
                      <div className="text-slate-600 text-xs sm:text-sm">
                        {opt.text}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-30"
              >
                &larr; Caso Anterior
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition shadow-sm"
                >
                  Siguiente Caso &rarr;
                </button>
              ) : (
                <button
                  onClick={() => submitExamAnswers(false)}
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm"
                >
                  Entregar y Finalizar
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
