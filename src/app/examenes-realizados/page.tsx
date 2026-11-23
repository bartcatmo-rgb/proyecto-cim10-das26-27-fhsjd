'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Award,
  BookOpen,
  ArrowLeft,
  X,
  Loader2,
  ShieldAlert,
  Stethoscope,
  Compass,
  CheckSquare,
} from 'lucide-react';
import { DISCIPLINE_CATALOG } from '@/lib/cim10/disciplines';
import { ServiceArea } from '@/types';

export default function ExamenesRealizadosPage() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<any[]>([]);
  const [courseId, setCourseId] = useState('DAS-26-27');
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [attemptDetails, setAttemptDetails] = useState<any | null>(null);
  const [loadingAttempt, setLoadingAttempt] = useState(false);

  useEffect(() => {
    async function fetchCompletedTests() {
      try {
        setLoading(true);
        const res = await fetch('/api/student/completed-tests');
        if (res.status === 401) {
          window.location.href = '/';
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setTests(data.tests || []);
          if (data.courseId) setCourseId(data.courseId);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    fetchCompletedTests();
  }, []);

  const openAttemptModal = async (attemptId: string) => {
    try {
      setSelectedAttemptId(attemptId);
      setLoadingAttempt(true);
      const res = await fetch(`/api/attempts/${attemptId}`);
      if (res.ok) {
        const data = await res.json();
        setAttemptDetails(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingAttempt(false);
    }
  };

  const closeModal = () => {
    setSelectedAttemptId(null);
    setAttemptDetails(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 sm:p-8 space-y-6">
        {/* Breadcrumb & Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
              <Link href="/" className="hover:text-brand-600 transition">Inicio</Link>
              <span>/</span>
              <span className="text-slate-800">Histórico de Pruebas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <FileCheck2 className="w-8 h-8 text-brand-600" />
              Exámenes y Pruebas del Curso ({courseId})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Consulta las convocatorias oficiales realizadas y revisa las resoluciones razonadas completas de cada caso clínico.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition inline-flex items-center gap-1.5 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Aula
            </Link>
          </div>
        </div>

        {/* Tests List */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Cargando repositorio de pruebas del curso...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">Sin pruebas registradas</h3>
            <p className="text-xs text-slate-500">
              Todavía no has participado en ninguna prueba o examen del curso académico {courseId}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((t) => {
              const hasAttempt = Boolean(t.attemptId);
              const isPassed = t.userPassed;
              const disciplineMeta = DISCIPLINE_CATALOG[t.discipline as ServiceArea];

              return (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 hover:border-brand-300 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {t.code}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'live'
                          ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                          : t.status === 'closed'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {t.status === 'live' ? 'En Curso (Activo)' : t.status === 'closed' ? 'Convocatoria Finalizada' : 'Programada'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {t.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span>Ámbito: <strong className="text-slate-700">{disciplineMeta?.name || t.discipline}</strong></span>
                      <span>·</span>
                      <span>Casos: <strong className="text-slate-700">{t.questionCount} MEAP</strong></span>
                      <span>·</span>
                      <span>Límite: <strong className="text-slate-700">{t.timeLimitMinutes > 0 ? `${t.timeLimitMinutes} min` : 'Sin límite'}</strong></span>
                    </div>
                  </div>

                  {/* Student Attempt Status Card */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    {hasAttempt ? (
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                          isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {t.userScore}
                        </div>
                        <div className="text-xs">
                          <div className={`font-bold ${isPassed ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {isPassed ? 'Aprobado (Apto)' : 'No Apto (Revisar)'}
                          </div>
                          <div className="text-slate-400">
                            {t.attemptedAt ? new Date(t.attemptedAt).toLocaleDateString('es-ES') : 'Realizado'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 font-medium">
                        No has participado aún
                      </div>
                    )}

                    <div>
                      {hasAttempt ? (
                        <button
                          onClick={() => openAttemptModal(t.attemptId)}
                          className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Ver Resolución</span>
                        </button>
                      ) : t.status === 'live' ? (
                        <Link
                          href={`/prueba/${t.code}`}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                        >
                          <span>Entrar a Prueba</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal / Drawer for Reasoned Resolution Review */}
      {selectedAttemptId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Revisión y Resolución Razonada de la Prueba
                  </h3>
                  <p className="text-xs text-slate-500">
                    Criterios oficiales de codificación clínica CIM-10-ES y desglose de distractores
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingAttempt ? (
                <div className="py-20 text-center">
                  <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Cargando desglose de preguntas e informe razonado...</p>
                </div>
              ) : attemptDetails ? (
                <>
                  {/* Summary Header Card */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Calificación</span>
                      <div className="text-2xl font-black text-slate-900 mt-0.5">
                        {attemptDetails.attempt.score} <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Aciertos</span>
                      <div className="text-2xl font-black text-slate-900 mt-0.5">
                        {attemptDetails.attempt.correctCount} / {attemptDetails.attempt.totalQuestions}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Tiempo Empleado</span>
                      <div className="text-2xl font-black text-slate-900 mt-0.5">
                        {Math.floor(attemptDetails.attempt.timeSpentSeconds / 60)}m {attemptDetails.attempt.timeSpentSeconds % 60}s
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Resultado</span>
                      <div className={`text-base font-bold mt-1 ${attemptDetails.attempt.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {attemptDetails.attempt.passed ? 'Aprobado' : 'No Superado'}
                      </div>
                    </div>
                  </div>

                  {/* List of Questions with full 4-block reasoned resolution */}
                  <div className="space-y-6">
                    {attemptDetails.details.map((d: any, idx: number) => {
                      const snapshot = d.questionSnapshot;
                      const isCorrect = d.isCorrect;
                      const resReason = snapshot?.reasonedResolution;

                      return (
                        <div
                          key={d.id || idx}
                          className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${
                            isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
                          }`}
                        >
                          {/* Case Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                            <span className="font-bold text-xs uppercase text-slate-500">
                              Caso Clínico #{idx + 1} · {snapshot?.serviceContext || 'Ámbito Clínico'}
                            </span>
                            <div className="flex items-center gap-2">
                              {isCorrect ? (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Correcta
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Incorrecta
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Case Title and Scenario */}
                          <div>
                            <h4 className="font-bold text-slate-900 text-base sm:text-lg">
                              {snapshot?.caseTitle}
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-2 p-3 bg-white/80 rounded-xl border border-slate-200/60">
                              {snapshot?.clinicalScenario}
                            </p>
                          </div>

                          {/* Selected Option vs Correct Option */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className={`p-3 rounded-xl border ${
                              isCorrect ? 'bg-emerald-100/60 border-emerald-300' : 'bg-rose-100/60 border-rose-300'
                            }`}>
                              <span className="text-slate-500 font-bold block mb-1">Tu Respuesta Marcada:</span>
                              <div className="font-mono font-bold text-slate-900">
                                Opción {d.selectedOptionId || 'Sin responder'}
                              </div>
                            </div>

                            <div className="p-3 rounded-xl border bg-emerald-100/60 border-emerald-300">
                              <span className="text-emerald-800 font-bold block mb-1">Respuesta Oficial Válida:</span>
                              <div className="font-mono font-bold text-emerald-950">
                                Opción {snapshot?.correctOptionId}
                              </div>
                            </div>
                          </div>

                          {/* 4-Block Reasoned Resolution */}
                          {resReason && (
                            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm text-xs">
                              <div className="text-xs uppercase font-black text-brand-700 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                <BookOpen className="w-4 h-4" />
                                Justificación y Resolución Razonada CIM-10
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                                <div className="space-y-1">
                                  <span className="font-bold text-slate-800 flex items-center gap-1">
                                    <Stethoscope className="w-3.5 h-3.5 text-brand-600" />
                                    1. Análisis Clínico:
                                  </span>
                                  <p className="text-slate-600 leading-relaxed">
                                    {resReason.clinicalAnalysis}
                                  </p>
                                </div>

                                <div className="space-y-1">
                                  <span className="font-bold text-slate-800 flex items-center gap-1">
                                    <Compass className="w-3.5 h-3.5 text-brand-600" />
                                    2. Ruta CIM-10:
                                  </span>
                                  <p className="text-slate-600 leading-relaxed font-mono">
                                    {resReason.cim10Path}
                                  </p>
                                </div>

                                <div className="space-y-1">
                                  <span className="font-bold text-slate-800 flex items-center gap-1">
                                    <CheckSquare className="w-3.5 h-3.5 text-brand-600" />
                                    3. Verificación Normativa:
                                  </span>
                                  <p className="text-slate-600 leading-relaxed">
                                    {resReason.ruleCheck}
                                  </p>
                                </div>
                              </div>

                              {/* Distractor Explanations */}
                              {resReason.distractorExplanations && (
                                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                  <span className="font-bold text-slate-700">4. Análisis de Distractores:</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                                    {Object.entries(resReason.distractorExplanations).map(([optId, expl]: [string, any]) => (
                                      <div key={optId} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
                                        <strong className="font-mono text-slate-800">Opción {optId}:</strong> {expl}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  No se pudieron cargar los detalles del intento.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Cerrar Informe
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
