'use client';

import React, { useEffect, useState } from 'react';
import type { StudentLearningMetrics } from '@/lib/db/topics';
import { BookOpen, Layers, Award, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

export default function LearningPerformanceChart() {
  const [metrics, setMetrics] = useState<StudentLearningMetrics | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics(selectedSubjectId);
  }, [selectedSubjectId]);

  const fetchMetrics = async (subjectId?: string | null) => {
    try {
      setLoading(true);
      setError(null);
      const url = subjectId
        ? `/api/student/learning-chart?subjectId=${encodeURIComponent(subjectId)}`
        : '/api/student/learning-chart';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setMetrics(data.metrics);
    } catch (err: any) {
      setError('No se pudo cargar la gráfica de rendimiento. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubject = (id: string | null) => {
    setSelectedSubjectId(id);
  };

  if (loading && !metrics) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3" />
        <p className="text-sm font-medium text-slate-600">Calculando métricas y curva de aprendizaje...</p>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700">
        <p className="font-semibold text-sm">{error}</p>
        <button
          onClick={() => fetchMetrics(selectedSubjectId)}
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!metrics) return null;

  // Generate SVG curve dimensions
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingY = 30;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  const points = metrics.chronologicalCurve || [];
  const hasPoints = points.length > 0;

  // Map scores (0-10) to SVG coords
  const coords = points.map((p, idx) => {
    const x = points.length === 1
      ? svgWidth / 2
      : paddingX + (idx / (points.length - 1)) * plotWidth;
    const y = paddingY + plotHeight - (Math.min(10, Math.max(0, p.score)) / 10) * plotHeight;
    return { x, y, ...p };
  });

  const polylineStr = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const areaStr = coords.length > 0
    ? `${coords[0].x},${paddingY + plotHeight} ${polylineStr} ${coords[coords.length - 1].x},${paddingY + plotHeight}`
    : '';

  const passLineY = paddingY + plotHeight - (5.0 / 10) * plotHeight;

  const subjectsList = metrics.subjects || [];
  const activeSubject = subjectsList.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-3.5">
      {/* Subject Filter Bar / Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Vista del Rendimiento Académico:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <button
              onClick={() => handleSelectSubject(null)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                selectedSubjectId === null
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>En Conjunto (Todas las Materias)</span>
            </button>

            {subjectsList.map((subj) => {
              const isSelected = selectedSubjectId === subj.id;
              return (
                <button
                  key={subj.id}
                  onClick={() => handleSelectSubject(subj.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                    isSelected
                      ? 'bg-brand-700 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: subj.color || '#2563eb' }}
                  />
                  <span>{subj.name}</span>
                  {subj.averageScore > 0 && (
                    <span
                      className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-brand-900 text-white'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      {subj.averageScore.toFixed(1)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {activeSubject && (
          <div className="text-xs bg-brand-50 border border-brand-200/80 text-brand-900 font-semibold px-3 py-1.5 rounded-xl self-start sm:self-auto">
            Materia Activa: <strong>{activeSubject.name}</strong> ({activeSubject.code})
          </div>
        )}
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
            {selectedSubjectId ? 'Nota Media en Materia' : 'Nota Media Global'}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-950">
              {metrics.averageScore > 0 ? metrics.averageScore.toFixed(1) : '—'}
            </span>
            <span className="text-xs text-slate-500">/ 10</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics.averageScore >= 7.0 ? '🌟 Rendimiento Notable' : metrics.averageScore >= 5.0 ? '✅ Aprobado' : '⚠️ Refuerzo Requerido'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Temario Estudiado</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-950">{metrics.globalStudyPercentage}%</span>
            <span className="text-xs text-slate-500">
              ({metrics.totalSummariesRead}/{metrics.totalSummariesAvailable} lecciones)
            </span>
          </div>
          <div className="w-full bg-emerald-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${metrics.globalStudyPercentage}%` }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Evaluaciones Totales</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-950">{metrics.totalTestsTaken}</span>
            <span className="text-xs text-slate-500">intentos</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {selectedSubjectId ? 'Pruebas en esta materia' : 'MEAP, Temáticos y Kahoot'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Módulos Temáticos</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-950">{metrics.totalTopics}</span>
            <span className="text-xs text-slate-500">temas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Contenido lectivo registrado</p>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>
                Curva Cronológica de Precisión y Aciertos{' '}
                {selectedSubjectId && activeSubject ? `(${activeSubject.name})` : '(En Conjunto)'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evolución de calificaciones obtenidas en las pruebas evaluadas
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" /> Calificación
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-rose-400 inline-block" /> Umbral Aprobado (5.0)
            </span>
          </div>
        </div>

        <div className="mt-4 w-full overflow-x-auto">
          {hasPoints ? (
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none block"
              style={{ maxHeight: '260px' }}
            >
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 2.5, 5, 7.5, 10].map((val) => {
                const y = paddingY + plotHeight - (val / 10) * plotHeight;
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      fontSize="10"
                      fill="#94a3b8"
                      textAnchor="end"
                      fontWeight="500"
                    >
                      {val.toFixed(val === 2.5 || val === 7.5 ? 1 : 0)}
                    </text>
                  </g>
                );
              })}

              {/* Pass Threshold Line (5.0) */}
              <line
                x1={paddingX}
                y1={passLineY}
                x2={svgWidth - paddingX}
                y2={passLineY}
                stroke="#f43f5e"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />

              {/* Fill Area under curve */}
              {areaStr && <polygon points={areaStr} fill="url(#curveGradient)" />}

              {/* Stroke Line */}
              {polylineStr && (
                <polyline
                  points={polylineStr}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points */}
              {coords.map((c, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={c.score >= 5 ? 4.5 : 5}
                    fill={c.score >= 5 ? '#4f46e5' : '#e11d48'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-transform hover:scale-125"
                  />
                  {/* Score Label above point */}
                  <text
                    x={c.x}
                    y={c.y - 8}
                    fontSize="10"
                    fontWeight="700"
                    fill={c.score >= 5 ? '#3730a3' : '#be123c'}
                    textAnchor="middle"
                  >
                    {c.score.toFixed(1)}
                  </text>
                  {/* Date label under X axis */}
                  <text
                    x={c.x}
                    y={paddingY + plotHeight + 15}
                    fontSize="9"
                    fill="#64748b"
                    textAnchor="middle"
                  >
                    {c.date.slice(5)}
                  </text>
                </g>
              ))}
            </svg>
          ) : (
            <div className="py-12 text-center text-slate-500">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">Aún no hay pruebas completadas en esta selección.</p>
              <p className="text-xs text-slate-400 mt-1">
                Realiza un examen temático o simulacro para visualizar tu curva de aprendizaje.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown per Topic & Priority Reinforcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Dominio por Módulo Temático</span>
          </h3>
          <div className="space-y-3">
            {metrics.topicsPerformance.map((tp) => (
              <div key={tp.slug} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 line-clamp-1 flex-1 pr-2">{tp.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                    tp.status === 'mastered' ? 'bg-emerald-100 text-emerald-800' :
                    tp.status === 'need_reinforcement' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {tp.status === 'mastered' ? 'Consolidado' : tp.status === 'need_reinforcement' ? 'Refuerzo' : 'En progreso'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Estudiado: {tp.studyPercentage}%</span>
                  <span>
                    Nota media: {tp.attemptsCount > 0 ? `${tp.averageScore}/10 (${tp.attemptsCount} test)` : 'Sin exámenes'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      tp.studyPercentage >= 80 ? 'bg-emerald-500' : tp.studyPercentage >= 40 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${tp.studyPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Reinforcement Suggestions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Áreas de Refuerzo Prioritario (IA Docente)</span>
          </h3>
          <div className="space-y-3">
            {metrics.priorityReinforcements.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                No hay áreas críticas pendientes de refuerzo en esta materia. ¡Excelente avance!
              </div>
            ) : (
              metrics.priorityReinforcements.map((pr, idx) => (
                <div key={idx} className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block" />
                    {pr.topicTitle}
                  </p>
                  <p className="text-xs text-amber-900/90 mt-1">{pr.reason}</p>
                  <div className="mt-2 text-[11px] text-indigo-900 bg-indigo-50/80 px-2.5 py-1.5 rounded-lg border border-indigo-100 font-medium">
                    💡 <span className="font-semibold">Recomendación:</span> {pr.recommendation}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
