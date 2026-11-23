'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Topic, TopicSummary, TopicQuestion } from '@/lib/db/topics';

interface TopicDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function TopicDetailPage({ params }: TopicDetailPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'temario' | 'examen' | 'inversa' | 'kahoot') || 'temario';

  const [topic, setTopic] = useState<Topic | null>(null);
  const [summaries, setSummaries] = useState<TopicSummary[]>([]);
  const [questions, setQuestions] = useState<TopicQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'temario' | 'examen' | 'inversa' | 'kahoot'>(initialTab);

  // Exam state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState<number | null>(null);
  const [savingAttempt, setSavingAttempt] = useState(false);

  // Kahoot state
  const [kahootIdx, setKahootIdx] = useState(0);
  const [kahootScore, setKahootScore] = useState(0);
  const [kahootStreak, setKahootStreak] = useState(0);
  const [kahootFinished, setKahootFinished] = useState(false);
  const [kahootSelectedOpt, setKahootSelectedOpt] = useState<string | null>(null);
  const [kahootRevealed, setKahootRevealed] = useState(false);

  useEffect(() => {
    fetchTopicData();
  }, [slug]);

  const fetchTopicData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/topics/${slug}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTopic(data.topic);
      setSummaries(data.summaries || []);
      setQuestions(data.questions || []);
    } catch (err: any) {
      setError('No se pudo cargar el temario. Comprueba tu sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSummary = async (summaryId: string, currentCompleted: boolean) => {
    const newStatus = !currentCompleted;
    // Optimistic UI update
    setSummaries((prev) =>
      prev.map((s) => (s.id === summaryId ? { ...s, completed: newStatus } : s))
    );

    try {
      await fetch(`/api/topics/${slug}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryId, completed: newStatus })
      });
    } catch (err) {
      // Revert if error
      setSummaries((prev) =>
        prev.map((s) => (s.id === summaryId ? { ...s, completed: currentCompleted } : s))
      );
    }
  };

  // Exam submission
  const handleSelectAnswer = (qIndex: number, optionId: string) => {
    if (examSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionId }));
  };

  const handleSubmitExam = async () => {
    if (questions.length === 0) return;
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_option_id) {
        correct++;
      }
    });

    const score = Math.round((correct / questions.length) * 100) / 10;
    setExamScore(score);
    setExamSubmitted(true);
    setSavingAttempt(true);

    try {
      await fetch(`/api/topics/${slug}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'exam',
          score,
          totalQuestions: questions.length,
          correctCount: correct
        })
      });
    } catch (err) {
      console.warn('Error saving topic attempt:', err);
    } finally {
      setSavingAttempt(false);
    }
  };

  const handleResetExam = () => {
    setSelectedAnswers({});
    setExamSubmitted(false);
    setExamScore(null);
    setCurrentQuestionIdx(0);
  };

  // Kahoot round logic
  const handleKahootSelect = (optionId: string) => {
    if (kahootRevealed || kahootFinished) return;
    setKahootSelectedOpt(optionId);
    setKahootRevealed(true);

    const currentQ = questions[kahootIdx];
    const isCorrect = currentQ && currentQ.correct_option_id === optionId;

    if (isCorrect) {
      const newStreak = kahootStreak + 1;
      setKahootStreak(newStreak);
      setKahootScore((prev) => prev + 100 + newStreak * 20);
    } else {
      setKahootStreak(0);
    }
  };

  const handleKahootNext = () => {
    setKahootRevealed(false);
    setKahootSelectedOpt(null);

    if (kahootIdx + 1 < questions.length) {
      setKahootIdx((prev) => prev + 1);
    } else {
      setKahootFinished(true);
      // Record kahoot attempt
      const maxScore = questions.length * 100;
      const finalScore = maxScore > 0 ? Math.min(10, Math.round((kahootScore / maxScore) * 100) / 10) : 5.0;
      fetch(`/api/topics/${slug}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'kahoot',
          score: finalScore,
          totalQuestions: questions.length,
          correctCount: Math.round((kahootScore / 100))
        })
      }).catch(console.warn);
    }
  };

  const handleKahootReset = () => {
    setKahootIdx(0);
    setKahootScore(0);
    setKahootStreak(0);
    setKahootFinished(false);
    setKahootSelectedOpt(null);
    setKahootRevealed(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-3" />
          <p className="text-sm font-semibold text-slate-700">Cargando temario clínico...</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
          <p className="text-base font-bold text-red-600 mb-2">Error de Acceso al Temario</p>
          <p className="text-xs text-slate-500 mb-6">{error || 'El temario solicitado no existe o no está publicado.'}</p>
          <Link
            href="/"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
          >
            Volver al Índice General
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = summaries.filter((s) => s.completed).length;
  const progressPct = summaries.length > 0 ? Math.round((completedCount / summaries.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Banner Header */}
      <header className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition mb-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Índice General de Temarios
              </Link>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {topic.title}
                </h1>
                {topic.is_core === 1 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                    ⭐ Troncal
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                {topic.description}
              </p>
            </div>

            {/* Progress Badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 min-w-[200px]">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Progreso del Módulo</span>
                <span className="text-indigo-600">{progressPct}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 text-right">
                {completedCount} de {summaries.length} lecciones completadas
              </p>
            </div>
          </div>

          {/* Submenu Tabs */}
          <nav className="flex space-x-2 mt-6 border-t border-slate-100 pt-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('temario')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'temario'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📖 Temario y Resúmenes ({summaries.length})
            </button>
            <button
              onClick={() => setActiveTab('examen')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'examen'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ✍️ Pruebas y Examen ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('inversa')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'inversa'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🔍 Práctica Inversa / Auditoría
            </button>
            <button
              onClick={() => setActiveTab('kahoot')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'kahoot'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🏆 Kahoot de Clase
            </button>
          </nav>
        </div>
      </header>

      {/* Main Tab Views */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: TEMARIO Y RESÚMENES */}
        {activeTab === 'temario' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Lecciones y Directrices Oficiales</h2>
                <p className="text-xs text-slate-500">Marca cada lección tras su lectura y comprensión clínica</p>
              </div>
            </div>

            {summaries.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
                <p className="text-sm font-medium">No hay resúmenes disponibles para este temario.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {summaries.map((s, idx) => (
                  <div
                    key={s.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                      s.completed ? 'border-emerald-300 ring-1 ring-emerald-100 bg-emerald-50/15' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            Sección {idx + 1}
                          </span>
                          <h3 className="text-base font-bold text-slate-900">{s.section_title}</h3>
                        </div>
                        <p className="text-xs text-slate-700 mt-2.5 leading-relaxed font-normal whitespace-pre-line">
                          {s.summary_content}
                        </p>

                        {/* Key Concepts */}
                        {s.key_concepts && s.key_concepts.length > 0 && (
                          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500 mr-1">Conceptos Clave:</span>
                            {s.key_concepts.map((kc, kIdx) => (
                              <span
                                key={kIdx}
                                className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md border border-slate-200/60"
                              >
                                {kc}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Clinical Rules */}
                        {s.clinical_rules && s.clinical_rules.length > 0 && (
                          <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                            <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                              ⚠️ Reglas y Directrices de Codificación
                            </p>
                            <ul className="list-disc list-inside text-xs text-amber-900/90 space-y-1">
                              {s.clinical_rules.map((cr, cIdx) => (
                                <li key={cIdx}>{cr}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Completed Action Toggle */}
                      <div className="sm:self-start pt-1">
                        <button
                          onClick={() => handleToggleSummary(s.id, Boolean(s.completed))}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            s.completed
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {s.completed ? (
                            <>
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Estudiado</span>
                            </>
                          ) : (
                            <>
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block" />
                              <span>Marcar Estudiado</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRUEBAS Y EXAMEN */}
        {activeTab === 'examen' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Evaluación del Temario</h2>
                  <p className="text-xs text-slate-500">Comprueba tu nivel de dominio respondiendo a las cuestiones tipo test</p>
                </div>
                {examSubmitted && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Calificación Final</p>
                    <p className={`text-2xl font-black ${
                      (examScore || 0) >= 7 ? 'text-emerald-600' : (examScore || 0) >= 5 ? 'text-indigo-600' : 'text-rose-600'
                    }`}>
                      {(examScore || 0).toFixed(1)} / 10
                    </p>
                  </div>
                )}
              </div>

              {questions.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  <p className="text-sm font-medium">No se han registrado preguntas de examen para este temario.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((q, idx) => {
                    const selected = selectedAnswers[idx];
                    const isCorrect = selected === q.correct_option_id;

                    return (
                      <div
                        key={q.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          examSubmitted
                            ? isCorrect
                              ? 'border-emerald-300 bg-emerald-50/20'
                              : 'border-rose-300 bg-rose-50/20'
                            : 'border-slate-200 bg-slate-50/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase">Pregunta {idx + 1} de {questions.length}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            Nivel {q.difficulty_level}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{q.title}</h3>
                        {q.scenario && (
                          <div className="mt-2 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/60 leading-relaxed font-normal">
                            {q.scenario}
                          </div>
                        )}

                        {/* Options */}
                        <div className="mt-4 space-y-2">
                          {q.options.map((opt) => {
                            const isOptionSelected = selected === opt.id;
                            const isOptionCorrect = opt.id === q.correct_option_id;

                            let optStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';
                            if (examSubmitted) {
                              if (isOptionCorrect) {
                                optStyle = 'border-emerald-500 bg-emerald-100/60 text-emerald-950 font-bold';
                              } else if (isOptionSelected && !isOptionCorrect) {
                                optStyle = 'border-rose-500 bg-rose-100/60 text-rose-950 font-semibold';
                              } else {
                                optStyle = 'border-slate-200 bg-white text-slate-400 opacity-60';
                              }
                            } else if (isOptionSelected) {
                              optStyle = 'border-indigo-600 bg-indigo-50 text-indigo-950 font-semibold ring-1 ring-indigo-500';
                            }

                            return (
                              <button
                                key={opt.id}
                                disabled={examSubmitted}
                                onClick={() => handleSelectAnswer(idx, opt.id)}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-start gap-2.5 ${optStyle}`}
                              >
                                <span className="font-mono font-bold">{opt.id})</span>
                                <span className="flex-1">{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation after submission */}
                        {examSubmitted && (
                          <div className="mt-3.5 p-3 rounded-xl bg-white border border-slate-200 text-xs">
                            <p className="font-bold text-slate-800 mb-1">
                              {isCorrect ? '✅ Justificación Correcta:' : '❌ Corrección Clínica / Normativa:'}
                            </p>
                            <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Submit / Reset Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    {!examSubmitted ? (
                      <button
                        onClick={handleSubmitExam}
                        disabled={Object.keys(selectedAnswers).length === 0}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-xs"
                      >
                        Corregir Examen ({Object.keys(selectedAnswers).length}/{questions.length} respondidas)
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleResetExam}
                          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                        >
                          Repetir Examen
                        </button>
                        <span className="text-xs text-emerald-700 font-semibold">
                          💾 Intento registrado en tu expediente
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PRÁCTICA ACTIVA / AUDITORÍA INVERSA */}
        {activeTab === 'inversa' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Taller de Auditoría y Corrección Clínica</h2>
              <p className="text-xs text-slate-500 mb-6">Identifica incongruencias, jerarquías diagnósticas erróneas o reglas de exclusión vulneradas</p>

              {topic.is_core === 1 ? (
                <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-6 text-center space-y-3">
                  <p className="text-sm font-bold text-indigo-950">
                    Módulo Oficial de Codificación Inversa CIE-10-ES
                  </p>
                  <p className="text-xs text-indigo-800/80 max-w-lg mx-auto">
                    El temario troncal incluye la suite integral de 30 casos clínicos auditables con detección de sesgo clínico, notas de exclusión y jerarquía del diagnóstico principal.
                  </p>
                  <Link
                    href="/?mode=reverse"
                    className="inline-block mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    Abrir Taller de Auditoría Clínica Inversa
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.filter((q) => q.question_type === 'reverse_coding').length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <p className="text-sm font-medium">No se han definido casos de auditoría inversa para este temario.</p>
                      <p className="text-xs text-slate-400 mt-1">Puedes practicar en la pestaña de Exámenes o acceder a la suite troncal.</p>
                    </div>
                  ) : (
                    questions
                      .filter((q) => q.question_type === 'reverse_coding')
                      .map((q, idx) => (
                        <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md uppercase">
                            Caso de Auditoría #{idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{q.title}</h4>
                          <p className="text-xs text-slate-700">{q.scenario}</p>
                          <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                            <span className="font-semibold text-slate-700">Resolución razonada: </span>
                            <span className="text-slate-600">{q.explanation}</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: KAHOOT DE CLASE */}
        {activeTab === 'kahoot' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    🏆 Modo Torneo Rápido
                  </h2>
                  <p className="text-xs text-slate-500">Ronda interactiva contrarreloj para aula y competición</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                    Puntuación: {kahootScore} pts
                  </span>
                  {kahootStreak > 1 && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 animate-pulse">
                      🔥 Racha x{kahootStreak}
                    </span>
                  )}
                </div>
              </div>

              {questions.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  <p className="text-sm font-medium">No hay preguntas disponibles para la ronda Kahoot.</p>
                </div>
              ) : kahootFinished ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-3xl">
                    🏆
                  </div>
                  <h3 className="text-xl font-black text-slate-900">¡Ronda Finalizada!</h3>
                  <p className="text-xs text-slate-600">
                    Has conseguido una puntuación final de <span className="font-bold text-indigo-600">{kahootScore} puntos</span>.
                  </p>
                  <button
                    onClick={handleKahootReset}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                  >
                    Jugar Otra Ronda
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Pregunta {kahootIdx + 1} de {questions.length}</span>
                  </div>

                  {/* Question Box */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-inner text-center">
                    <p className="text-base font-bold leading-snug">
                      {questions[kahootIdx]?.title}
                    </p>
                    {questions[kahootIdx]?.scenario && (
                      <p className="text-xs text-slate-300 mt-2 font-normal leading-relaxed">
                        {questions[kahootIdx]?.scenario}
                      </p>
                    )}
                  </div>

                  {/* 4 Colored Option Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {questions[kahootIdx]?.options.map((opt, oIdx) => {
                      const colors = [
                        'bg-red-600 hover:bg-red-700',
                        'bg-blue-600 hover:bg-blue-700',
                        'bg-amber-600 hover:bg-amber-700',
                        'bg-emerald-600 hover:bg-emerald-700'
                      ];
                      const btnColor = colors[oIdx % colors.length];
                      const isCorrect = opt.id === questions[kahootIdx]?.correct_option_id;
                      const isSelected = kahootSelectedOpt === opt.id;

                      let borderClass = 'border-transparent';
                      if (kahootRevealed) {
                        if (isCorrect) borderClass = 'ring-4 ring-emerald-400 ring-offset-2';
                        else if (isSelected) borderClass = 'ring-4 ring-rose-400 opacity-60';
                        else borderClass = 'opacity-40';
                      }

                      return (
                        <button
                          key={opt.id}
                          disabled={kahootRevealed}
                          onClick={() => handleKahootSelect(opt.id)}
                          className={`p-4 rounded-xl text-white text-xs font-bold text-left transition shadow-xs flex items-center gap-2 ${btnColor} ${borderClass}`}
                        >
                          <span className="font-mono text-sm bg-black/20 px-2 py-0.5 rounded">{opt.id}</span>
                          <span className="flex-1">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Step Button */}
                  {kahootRevealed && (
                    <div className="pt-4 flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-700">
                        {kahootSelectedOpt === questions[kahootIdx]?.correct_option_id ? '🎉 ¡Respuesta Correcta!' : '❌ Incorrecta'}
                      </p>
                      <button
                        onClick={handleKahootNext}
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                      >
                        Siguiente Pregunta →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
