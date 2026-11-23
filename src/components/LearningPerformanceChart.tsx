'use client';

import React, { useEffect, useState } from 'react';
import type { StudentLearningMetrics } from '@/lib/db/topics';

export default function LearningPerformanceChart() {
  const [metrics, setMetrics] = useState<StudentLearningMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/learning-chart');
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3" />
        <p className="text-sm font-medium text-slate-600">Calculando métricas y curva de aprendizaje...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700">
        <p className="font-semibold text-sm">{error || 'Sin datos de rendimiento disponibles'}</p>
        <button
          onClick={fetchMetrics}
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Generate SVG curve dimensions
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingY = 30;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  const points = metrics.chronologicalCurve;
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

  return (
    <div className="space-y-6">
      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Nota Media Global</p>
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
          <p className="text-[11px] text-slate-500 mt-1">MEAP, Auditoría y Kahoot</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Módulos Temáticos</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-950">{metrics.totalTopics}</span>
            <span className="text-xs text-slate-500">temas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">CIE-10-ES y Temarios del Centro</p>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Curva Cronológica de Precisión y Aciertos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Evolución de calificaciones obtenidas en todas las pruebas oficiales</p>
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
              className="w-full h-auto min-w-[550px] select-none"
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
              <svg className="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm font-medium">Aún no has completado ninguna prueba evaluada.</p>
              <p className="text-xs text-slate-400 mt-1">Realiza un examen temático o simulacro MEAP para visualizar tu curva de aprendizaje.</p>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown per Topic & Priority Reinforcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Dominio por Módulo Temático
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
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Áreas de Refuerzo Prioritario (IA Docente)
          </h3>
          <div className="space-y-3">
            {metrics.priorityReinforcements.map((pr, idx) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
