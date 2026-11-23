'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Filter,
  Search,
  Calendar,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Download,
  BookOpen,
  Stethoscope,
  X,
  Compass,
  CheckSquare,
} from 'lucide-react';
import { DISCIPLINE_CATALOG, ALL_SERVICE_AREAS } from '@/lib/cim10/disciplines';
import { ServiceArea, AcademicCourse } from '@/types';

interface Props {
  activeCourseId?: string;
}

export default function HistoricalAuditViewer({ activeCourseId }: Props) {
  const [courses, setCourses] = useState<AcademicCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>(activeCourseId || 'DAS-26-27');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    if (activeCourseId) {
      setSelectedCourse(activeCourseId);
    }
  }, [activeCourseId]);

  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [attemptDetails, setAttemptDetails] = useState<any | null>(null);
  const [loadingAttempt, setLoadingAttempt] = useState(false);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCourse) params.append('courseId', selectedCourse);
      if (selectedDiscipline) params.append('discipline', selectedDiscipline);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/admin/history-audit?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
        setSummary(data.summary || null);
        if (data.courses) setCourses(data.courses);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, [selectedCourse, selectedDiscipline, startDate, endDate]);

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
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Filter className="w-4 h-4 text-brand-600" />
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Filtros del Repositorio Histórico de Auditoría
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Promoción / Curso:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
            >
              <option value="">Todos los cursos</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} · {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Ámbito Asistencial:</label>
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
            >
              <option value="">Todas las disciplinas</option>
              {ALL_SERVICE_AREAS.map((key) => (
                <option key={key} value={key}>
                  {DISCIPLINE_CATALOG[key].name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Fecha Desde:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Fecha Hasta:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs text-slate-500 font-medium">Intentos Evaluados</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{summary.totalAttempts}</div>
            <span className="text-[11px] text-slate-400">Total filtrado</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs text-slate-500 font-medium">Nota Media</span>
            <div className="text-2xl font-black text-brand-700 mt-1">{summary.avgScore}%</div>
            <span className="text-[11px] text-emerald-600 font-semibold">Rendimiento</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs text-slate-500 font-medium">Pruebas Aptas</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{summary.passedCount}</div>
            <span className="text-[11px] text-slate-400">Calificación &ge; 70%</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs text-slate-500 font-medium">Tasa de Aprobados</span>
            <div className="text-2xl font-black text-indigo-700 mt-1">{summary.passRate}%</div>
            <span className="text-[11px] text-slate-400">Éxito global</span>
          </div>
        </div>
      )}

      {/* Table of Attempts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Registros Históricos de Intentos ({records.length})
          </h3>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
            Consultando histórico de auditoría...
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No se encontraron registros de auditoría para los filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Alumno</th>
                  <th className="px-5 py-3">DNI/NIE</th>
                  <th className="px-5 py-3">Curso</th>
                  <th className="px-5 py-3">Ámbito Asistencial</th>
                  <th className="px-5 py-3 text-center">Nota</th>
                  <th className="px-5 py-3 text-center">Aciertos</th>
                  <th className="px-5 py-3 text-center">Fecha</th>
                  <th className="px-5 py-3 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => {
                  const isPassed = Boolean(r.passed);
                  const disciplineMeta = DISCIPLINE_CATALOG[r.discipline as ServiceArea];

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-3 font-bold text-slate-900">
                        {r.studentName}
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-500">
                        {r.maskedDni}
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-700">
                        {r.courseId}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {disciplineMeta?.name || r.discipline}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md font-black text-xs ${
                          isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {r.score}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-slate-700 font-bold">
                        {r.correctCount} / {r.totalQuestions}
                      </td>
                      <td className="px-5 py-3 text-center text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => openAttemptModal(r.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-600" />
                          <span>Revisar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for detailed reasoned resolution review */}
      {selectedAttemptId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Auditoría Clínica de Intento ({selectedAttemptId})
                </h3>
                <p className="text-xs text-slate-500">
                  Desglose de respuestas marcadas, códigos correctos y justificación normativa
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingAttempt ? (
                <div className="py-20 text-center">
                  <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Cargando desglose de preguntas...</p>
                </div>
              ) : attemptDetails ? (
                <div className="space-y-4">
                  {attemptDetails.details.map((d: any, idx: number) => {
                    const snap = d.questionSnapshot;
                    const res = snap?.reasonedResolution;

                    return (
                      <div key={d.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-3">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-800">Caso #{idx + 1}: {snap?.caseTitle}</span>
                          <span className={`px-2 py-0.5 rounded ${d.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {d.isCorrect ? 'Acierto' : 'Fallo'}
                          </span>
                        </div>
                        <p className="text-slate-600 italic">{snap?.clinicalScenario}</p>
                        <div className="flex gap-4 font-mono font-bold">
                          <span>Marcada: <strong className="text-slate-900">{d.selectedOptionId}</strong></span>
                          <span>Correcta: <strong className="text-emerald-700">{snap?.correctOptionId}</strong></span>
                        </div>
                        {res && (
                          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                            <div className="font-bold text-brand-800">Resolución Razonada:</div>
                            <div className="text-slate-700">{res.clinicalAnalysis}</div>
                            <div className="text-slate-500 font-mono text-[11px]">{res.cim10Path}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
