'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TestAttempt, AttemptDetail } from '@/types';
import { DISCIPLINE_CATALOG, LEVELS_CONFIG } from '@/lib/cim10/disciplines';
import {
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Filter,
  AlertTriangle,
  Stethoscope,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  attempt: TestAttempt;
  details: AttemptDetail[];
}

export default function AttemptReviewView({ attempt, details }: Props) {
  const [filterMode, setFilterMode] = useState<'all' | 'errors'>('all');
  const discInfo = DISCIPLINE_CATALOG[attempt.discipline] || DISCIPLINE_CATALOG.simulacro_integral;
  const levelInfo = LEVELS_CONFIG[attempt.level] || LEVELS_CONFIG[1];

  const filteredDetails =
    filterMode === 'errors'
      ? details.filter((d) => !d.isCorrect)
      : details;

  const mistakesCount = details.filter((d) => !d.isCorrect).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Result Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${discInfo.bgLight}`}>
                {discInfo.badge}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Nivel {attempt.level}: {levelInfo.name.split(':')[1]}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Resultados de la Evaluación MEAP
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {discInfo.name} · Realizado el {new Date(attempt.createdAt).toLocaleDateString('es-ES')} a las {new Date(attempt.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-medium text-slate-500">Puntuación</span>
              <div
                className={`text-4xl font-black ${
                  attempt.passed ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {attempt.score}%
              </div>
              <span className="text-[11px] text-slate-400">
                Umbral mínimo: {levelInfo.requiredPassPercentage}%
              </span>
            </div>

            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                attempt.passed
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {attempt.passed ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="text-slate-500">Aciertos</span>
            <div className="mt-1 text-lg font-bold text-slate-900">
              {attempt.correctCount} / {attempt.totalQuestions}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="text-slate-500">Tiempo empleado</span>
            <div className="mt-1 text-lg font-bold text-slate-900 flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                {Math.floor(attempt.timeSpentSeconds / 60)}m {attempt.timeSpentSeconds % 60}s
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="text-slate-500">Resultado oficial</span>
            <div className="mt-1">
              <span
                className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                  attempt.passed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {attempt.passed ? 'SUPERADO' : 'NO ALCANZADO'}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="text-slate-500">Progreso de Nivel</span>
            <div className="mt-1 text-xs font-semibold text-slate-800">
              {attempt.passed
                ? 'Desbloqueo consolidado'
                : 'Repasar y reintentar'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Todos los casos ({details.length})</span>
            </button>
            <button
              onClick={() => setFilterMode('errors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterMode === 'errors'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Solo Fallos ({mistakesCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {mistakesCount > 0 && (
              <Link
                href="/test/repaso"
                className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Test de Repaso de Errores</span>
              </Link>
            )}

            <Link
              href="/entrenamiento"
              className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <span>Volver a Entrenamientos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Questions Breakdown with Reasoned Resolution */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          <span>Resolución Razonada por Caso Clínico</span>
        </h2>

        {filteredDetails.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
            No hay casos en este filtro (¡has acertado todos!).
          </div>
        ) : (
          filteredDetails.map((detail, idx) => {
            const q = detail.question;
            const res = q.reasonedResolution;

            return (
              <div
                key={detail.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                  detail.isCorrect ? 'border-slate-200' : 'border-rose-200 ring-1 ring-rose-200'
                }`}
              >
                {/* Header */}
                <div
                  className={`px-6 py-3 border-b flex flex-wrap items-center justify-between text-xs gap-2 ${
                    detail.isCorrect
                      ? 'bg-slate-50 border-slate-100'
                      : 'bg-rose-50/60 border-rose-100'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {detail.isCorrect ? (
                      <span className="flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Acierto · Pregunta #{idx + 1}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-700">
                        <XCircle className="w-4 h-4" />
                        <span>Fallo · Pregunta #{idx + 1}</span>
                      </span>
                    )}
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-700">{q.caseTitle}</span>
                  </div>

                  <div className="text-[11px] font-medium text-slate-500">
                    Ámbito: {q.serviceContext}
                  </div>
                </div>

                {/* Scenario */}
                <div className="p-6 space-y-5">
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                    {q.clinicalScenario}
                  </p>

                  {/* Options review */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt) => {
                      const isCorrect = opt.id === q.correctOptionId;
                      const isUserChoice = opt.id === detail.selectedOptionId;

                      let style = 'bg-slate-50 border-slate-200 text-slate-700';
                      if (isCorrect) {
                        style = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium ring-1 ring-emerald-300';
                      } else if (isUserChoice && !detail.isCorrect) {
                        style = 'bg-rose-50 border-rose-300 text-rose-900 font-medium ring-1 ring-rose-300';
                      }

                      return (
                        <div key={opt.id} className={`p-3 rounded-xl border ${style}`}>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <div className="flex items-center gap-1.5 font-bold">
                              <span>({opt.id})</span>
                              <span className="font-mono text-slate-900 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
                                {opt.code}
                              </span>
                            </div>
                            <div>
                              {isCorrect && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900">
                                  CORRECTA
                                </span>
                              )}
                              {isUserChoice && !isCorrect && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-200 text-rose-900">
                                  TU RESPUESTA
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-[11px] leading-tight">{opt.text}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 4-BLOCK REASONED RESOLUTION */}
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      <span>Resolución Razonada Oficial (Normativa MEAP)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Block 1: Clinical Analysis */}
                      <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-200/60 space-y-1">
                        <span className="font-bold text-teal-900 flex items-center gap-1 text-[11px]">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                          1. Análisis Clínico y Jerarquía:
                        </span>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          {res.clinicalAnalysis}
                        </p>
                      </div>

                      {/* Block 2: CIM-10 Path */}
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                          <Info className="w-3.5 h-3.5 text-slate-600" />
                          2. Ruta en el Catálogo CIM-10:
                        </span>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          {res.cim10Path}
                        </p>
                      </div>

                      {/* Block 3: Rule Check */}
                      <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200/60 space-y-1">
                        <span className="font-bold text-indigo-900 flex items-center gap-1 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                          3. Verificación Normativa (Exclusiones / MEAP):
                        </span>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          {res.ruleCheck}
                        </p>
                      </div>

                      {/* Block 4: Distractor Explanations */}
                      <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-1.5">
                        <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                          4. Análisis de Distractores:
                        </span>
                        <div className="space-y-1 text-[11px] text-slate-700">
                          {Object.entries(res.distractorExplanations).map(([optKey, text]) => (
                            <div key={optKey} className="leading-snug">
                              <strong className="text-slate-900">({optKey}):</strong> {text}
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
