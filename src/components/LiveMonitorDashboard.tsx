'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Monitor,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Tv,
  Sliders,
  Award,
  Activity,
  Flame,
} from 'lucide-react';
import { DISCIPLINE_CATALOG } from '@/lib/cim10/disciplines';
import { ServiceArea } from '@/types';

export default function LiveMonitorDashboard() {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMonitorData = async () => {
    try {
      const res = await fetch('/api/admin/live-monitor');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date());
      }
    } catch {
      // silently retry on next cycle
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitorData();
    if (!autoRefresh) return;

    const interval = setInterval(fetchMonitorData, 3000); // 3s polling
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const activeExam = data?.activeExam;
  const sessions = data?.sessions || [];
  const totalConnected = data?.totalConnected || 0;
  const completedCount = data?.completedCount || 0;
  const classAverage = data?.classAverage || 0;
  const errorRadar = data?.errorRadar || {};

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Monitor className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Monitor en Vivo del Aula</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronización 3s
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervisión en tiempo real del progreso, tiempos y patrones de error de los alumnos conectados en el aula.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{autoRefresh ? 'Auto-refresco: Activo (3s)' : 'Pausado'}</span>
          </button>

          <Link
            href="/pizarra"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Tv className="w-4 h-4" />
            <span>Pizarra</span>
          </Link>

          <Link
            href="/admin/pruebas"
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Configurar</span>
          </Link>
        </div>
      </div>

      {/* Active Exam Status Alert */}
      {activeExam ? (
        <div className="bg-gradient-to-r from-brand-900 to-indigo-900 text-white p-6 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Examen Activo en Emisión
            </span>
            <h2 className="text-lg font-bold">{activeExam.title}</h2>
            <div className="flex flex-wrap gap-4 text-xs text-brand-100 pt-1">
              <span>Ámbito: <strong>{DISCIPLINE_CATALOG[activeExam.discipline as ServiceArea]?.name || activeExam.discipline}</strong></span>
              <span>Dificultad: <strong>{activeExam.level === 0 ? 'Adaptativo IA' : `Nivel ${activeExam.level}`}</strong></span>
              <span>Total: <strong>{activeExam.questionCount} casos</strong></span>
              <span>Tiempo: <strong>{activeExam.timeLimitMinutes > 0 ? `${activeExam.timeLimitMinutes} min` : 'Sin límite'}</strong></span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-brand-200 block">Última señal recibida</span>
            <span className="text-xs font-mono font-bold text-emerald-300">
              {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">No hay ningún Examen del Día activo</h3>
              <p className="text-xs text-amber-700">
                Ve a "Configurar" para iniciar una prueba sincronizada para todo el grupo.
              </p>
            </div>
          </div>
          <Link
            href="/admin/pruebas"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Activar Examen Ahora
          </Link>
        </div>
      )}

      {/* Real-time KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Alumnos en Aula</span>
            <Users className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalConnected}</div>
          <p className="text-[11px] text-slate-400">Sesiones activas detectadas</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Tests Entregados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">{completedCount}</div>
          <p className="text-[11px] text-slate-400">
            {totalConnected > 0 ? `${Math.round((completedCount / totalConnected) * 100)}% de entrega` : '0%'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Media del Aula</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">{classAverage}%</div>
          <p className="text-[11px] text-slate-400">Sobre exámenes finalizados</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">En Progreso</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-600">{totalConnected - completedCount}</div>
          <p className="text-[11px] text-slate-400">Respondiendo actualmente</p>
        </div>
      </div>

      {/* Main Grid: Student Session Matrix + Error Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Live Student Sessions Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-600" />
              <span>Matriz de Conexión y Progreso de Alumnos</span>
            </h2>
            <button
              onClick={fetchMonitorData}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              title="Refrescar manualmente"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Esperando a que los alumnos comiencen la prueba...</p>
              <p className="text-[11px] text-slate-400">
                Cada alumno que inicie el test aparecerá aquí automáticamente.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sessions.map((sess: any) => {
                const progressPct = sess.totalQuestions > 0
                  ? Math.round((sess.currentQuestionIndex / sess.totalQuestions) * 100)
                  : 0;
                const isSubmitted = sess.status === 'submitted';

                return (
                  <div key={sess.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-[160px]">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isSubmitted ? 'bg-emerald-500' : 'bg-amber-400 animate-ping'}`} />
                        <span>{sess.userName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        Último latido: {new Date(sess.lastHeartbeat).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 max-w-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>Pregunta {sess.currentQuestionIndex} / {sess.totalQuestions}</span>
                        <span className="font-bold">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isSubmitted ? 'bg-emerald-500' : 'bg-brand-600'
                          }`}
                          style={{ width: `${Math.min(100, progressPct)}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="text-right min-w-[90px]">
                      {isSubmitted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Entregado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" /> En curso
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Class Collective Error Radar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>Radar Colectivo de Errores</span>
            </h3>
            <p className="text-xs text-slate-500">
              Patrones de fallo más frecuentes detectados en la especialidad del examen:
            </p>

            {Object.keys(errorRadar).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Sin fallos registrados aún en esta convocatoria.
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(errorRadar).map(([cat, count]: [string, any]) => {
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                        <span className="capitalize">{cat.replace(/_/g, ' ')}</span>
                        <span className="font-mono font-bold text-rose-600">{count} fallos</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, (count / 20) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Control de Convocatoria
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Todos los intentos quedan persistidos de forma atómica en SQLite (`cim10_centro.db`) y se exportan en cualquier momento desde el Panel de Mantenimiento.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Link
                href="/admin"
                className="w-full text-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors border border-slate-700"
              >
                Ir a Gestión de Usuarios y Backups
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
