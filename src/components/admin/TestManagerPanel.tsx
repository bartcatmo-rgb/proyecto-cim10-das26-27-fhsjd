'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sliders,
  PlusCircle,
  Play,
  Square,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  Award,
  AlertTriangle,
  Loader2,
  Tv,
  FileText,
  Download,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ManagedTest, TestType, TestStatus, ServiceArea } from '@/types';
import { DISCIPLINE_CATALOG, ALL_SERVICE_AREAS } from '@/lib/cim10/disciplines';

interface Props {
  activeCourseId?: string;
}

export default function TestManagerPanel({ activeCourseId }: Props) {
  const [tests, setTests] = useState<ManagedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [hostOrigin, setHostOrigin] = useState('');

  // Create form modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [testType, setTestType] = useState<TestType>('standard_meap');
  const [discipline, setDiscipline] = useState<ServiceArea>('simulacro_integral');
  const [level, setLevel] = useState(2);
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20);
  const [courseId, setCourseId] = useState(activeCourseId || 'DAS-26-27');
  const [status, setStatus] = useState<TestStatus>('prepared');
  const [submitting, setSubmitting] = useState(false);

  // Answer Key & Classroom Review Modal state
  const [showAnswerKeyModal, setShowAnswerKeyModal] = useState(false);
  const [answerKeyData, setAnswerKeyData] = useState<any | null>(null);
  const [loadingAnswerKey, setLoadingAnswerKey] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Record<number, boolean>>({});

  const handleOpenAnswerKey = async (testId: string) => {
    setShowAnswerKeyModal(true);
    setLoadingAnswerKey(true);
    setAnswerKeyData(null);
    setExpandedKeys({});

    try {
      const res = await fetch(`/api/admin/managed-tests/${testId}/answer-key`);
      const data = await res.json();
      if (res.ok) {
        setAnswerKeyData(data);
      } else {
        alert(data.error || 'No se pudo cargar la plantilla de respuestas.');
      }
    } catch {
      alert('Error al recuperar plantilla de respuestas.');
    } finally {
      setLoadingAnswerKey(false);
    }
  };

  // Dynamic Question Batch state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [batchCount, setBatchCount] = useState(10);
  const [batchDiscipline, setBatchDiscipline] = useState<ServiceArea>('simulacro_integral');
  const [createExamFromBatch, setCreateExamFromBatch] = useState(true);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchMsg, setBatchMsg] = useState<string | null>(null);

  const handleGenerateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setBatchGenerating(true);
    setBatchMsg(null);

    try {
      const res = await fetch('/api/admin/generate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academicYear: courseId,
          batchName: batchName || `Lote_${Date.now().toString(36).toUpperCase()}`,
          count: batchCount,
          discipline: batchDiscipline,
          createManagedExam: createExamFromBatch,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setBatchMsg(`Error: ${data.error}`);
      } else {
        setBatchMsg(data.message);
        fetchTests();
        setTimeout(() => {
          setShowBatchModal(false);
          setBatchMsg(null);
          setBatchName('');
        }, 1500);
      }
    } catch (err: any) {
      setBatchMsg(`Error de red: ${err.message}`);
    } finally {
      setBatchGenerating(false);
    }
  };

  // Custom Teacher Clinical Case state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customDesc, setCustomDesc] = useState('');
  const [customDiscipline, setCustomDiscipline] = useState<ServiceArea>('urgencias');
  const [customLevel, setCustomLevel] = useState(2);
  const [customCode, setCustomCode] = useState('');
  const [customCriteria, setCustomCriteria] = useState('');
  const [customGenerating, setCustomGenerating] = useState(false);
  const [customMsg, setCustomMsg] = useState<string | null>(null);

  const handleCreateCustomCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDesc.trim()) return;
    setCustomGenerating(true);
    setCustomMsg(null);

    try {
      const res = await fetch('/api/admin/create-custom-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicalDescription: customDesc,
          discipline: customDiscipline,
          level: customLevel,
          objectiveCode: customCode,
          normativeCriteria: customCriteria,
          academicYear: courseId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCustomMsg(`Error: ${data.error}`);
      } else {
        const engineLabels: Record<string, string> = {
          'ollama-local': '🤖 IA Local (Ollama)',
          'cloud-ai': '☁️ IA Cloud Estructurada',
          'offline-clinical-engine': '⚡ Motor Clínico Offline Integrado',
        };
        const engineBadge = engineLabels[data.engineUsed] || '⚡ Motor Clínico Offline';
        setCustomMsg(`¡Caso clínico estructurado con éxito! · Motor empleado: ${engineBadge}`);
        fetchTests();
        setTimeout(() => {
          setShowCustomModal(false);
          setCustomMsg(null);
          setCustomDesc('');
          setCustomCode('');
          setCustomCriteria('');
        }, 2200);
      }
    } catch (err: any) {
      setCustomMsg(`Error de red: ${err.message}`);
    } finally {
      setCustomGenerating(false);
    }
  };

  const fetchTests = async (targetCourse?: string) => {
    try {
      setLoading(true);
      const c = targetCourse || courseId;
      const res = await fetch(`/api/admin/managed-tests?courseId=${c}`);
      if (res.ok) {
        const data = await res.json();
        setTests(data.tests || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCourseId) {
      setCourseId(activeCourseId);
      fetchTests(activeCourseId);
    }
  }, [activeCourseId]);

  const handleStatusChange = async (testId: string, nextStatus: TestStatus) => {
    try {
      const res = await fetch('/api/admin/managed-tests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, status: nextStatus }),
      });

      if (res.ok) {
        fetchTests();
      } else {
        const err = await res.json();
        alert(err.error || 'No se pudo actualizar el estado.');
      }
    } catch {
      alert('Error de red al actualizar estado de la prueba.');
    }
  };

  const handleCopyLink = (code: string) => {
    const url = `${hostOrigin}/prueba/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    });
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/managed-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          testType,
          discipline,
          level,
          questionCount,
          timeLimitMinutes,
          courseId,
          status,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setTitle('');
        fetchTests();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al programar prueba.');
      }
    } catch {
      alert('Error de red al crear prueba.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTestTypeLabel = (type: TestType) => {
    switch (type) {
      case 'standard_meap': return 'Casos MEAP Estándar';
      case 'reverse_coding': return 'Codificación Inversa (Auditoría)';
      case 'kahoot_round': return 'Ronda Tipo Kahoot (10-20)';
      case 'adaptive_ai': return 'Examen Adaptativo IA';
      case 'review': return 'Repaso de Errores';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-600" />
            Configurador y Administración de Pruebas Convocadas
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Activa convocatorias en vivo, genera enlaces directos para los alumnos y sincroniza la pizarra digital.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowBatchModal(true)}
            className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            title="Generar nueva batería de casos MEAP y examen para esta convocatoria"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Generar Batería Dinámica</span>
          </button>

          <button
            onClick={() => setShowCustomModal(true)}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            title="Añadir supuesto clínico del docente con IA + respaldo offline"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Crear Caso Docente (IA)</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Prueba Manual</span>
          </button>
        </div>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
          Cargando catálogo de pruebas...
        </div>
      ) : tests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          No hay pruebas programadas actualmente. Crea una nueva prueba para convocar al aula.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map((t) => {
            const isLive = t.status === 'live';
            const isClosed = t.status === 'closed';

            return (
              <div
                key={t.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition flex flex-col justify-between space-y-4 ${
                  isLive ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      {t.code}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isLive
                        ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                        : isClosed
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isLive ? 'En Vivo (Activa)' : isClosed ? 'Cerrada' : 'Preparada'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base leading-snug">
                    {t.title}
                  </h4>

                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 pt-1">
                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md font-bold text-brand-700">
                      {getTestTypeLabel(t.testType)}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md">
                      Curso: <strong>{t.courseId}</strong>
                    </span>
                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md">
                      Casos: <strong>{t.questionCount}</strong>
                    </span>
                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md">
                      Tiempo: <strong>{t.timeLimitMinutes > 0 ? `${t.timeLimitMinutes} min` : 'Sin límite'}</strong>
                    </span>
                  </div>
                </div>

                {/* Direct Link & Lifecycle Controls */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Shareable Link Button */}
                  <button
                    onClick={() => handleCopyLink(t.code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition"
                    title="Copiar enlace directo para alumnos"
                  >
                    {copiedCode === t.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">¡Enlace Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>/prueba/{t.code}</span>
                      </>
                    )}
                  </button>

                  {/* Status buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenAnswerKey(t.id)}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg font-bold transition flex items-center gap-1 text-[11px]"
                      title="Ver plantilla inequívoca de respuestas y resoluciones de 4 bloques para proyección en clase"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Plantilla y Repaso</span>
                    </button>

                    {isLive ? (
                      <button
                        onClick={() => handleStatusChange(t.id, 'closed')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>Cerrar Convocatoria</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(t.id, 'live')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Lanzar en Vivo</span>
                      </button>
                    )}

                    <Link
                      href={`/prueba/${t.code}`}
                      target="_blank"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                      title="Abrir como alumno"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Test */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-brand-600" />
              Programar Nueva Prueba de Aula
            </h3>

            <form onSubmit={handleCreateTest} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título de la Convocatoria:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Examen de Urgencias y Traumatología - Trimestre 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Modalidad de Prueba:</label>
                  <select
                    value={testType}
                    onChange={(e) => {
                      const val = e.target.value as TestType;
                      setTestType(val);
                      if (val === 'kahoot_round') {
                        setQuestionCount(10);
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="standard_meap">Casos MEAP Estándar</option>
                    <option value="reverse_coding">Codificación Inversa (Auditoría)</option>
                    <option value="kahoot_round">Ronda Tipo Kahoot (10-20 preguntas)</option>
                    <option value="adaptive_ai">Adaptativo IA</option>
                    <option value="review">Repaso de Errores</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Curso Académico:</label>
                  <input
                    type="text"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value.toUpperCase())}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ámbito Asistencial:</label>
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value as ServiceArea)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    {ALL_SERVICE_AREAS.map((key) => (
                      <option key={key} value={key}>
                        {DISCIPLINE_CATALOG[key].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dificultad (Nivel 1 al 5):</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Número de Preguntas {testType === 'kahoot_round' ? '(10 a 20)' : ''}:
                  </label>
                  <input
                    type="number"
                    min={testType === 'kahoot_round' ? 10 : 1}
                    max={testType === 'kahoot_round' ? 20 : 50}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Límite de Tiempo (minutos):</label>
                  <input
                    type="number"
                    min={0}
                    max={180}
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Estado Inicial:</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="radio"
                      name="status"
                      checked={status === 'prepared'}
                      onChange={() => setStatus('prepared')}
                    />
                    <span>Preparada (Standby)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-700">
                    <input
                      type="radio"
                      name="status"
                      checked={status === 'live'}
                      onChange={() => setStatus('live')}
                    />
                    <span>Lanzar en Vivo Ahora Mismo</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm"
                >
                  {submitting ? 'Programando...' : 'Guardar Prueba'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 1: Plantilla Inequívoca de Respuestas y Resolución Razonada para Proyección en Clase */}
      {showAnswerKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  Plantilla Oficial de Respuestas & Repaso en Aula
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {answerKeyData ? `${answerKeyData.test.title} (${answerKeyData.test.code})` : 'Cargando plantilla...'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {answerKeyData && (
                  <a
                    href={`/api/admin/managed-tests/${answerKeyData.test.id}/answer-key?format=xlsx`}
                    download
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Excel (.xlsx)</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setShowAnswerKeyModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {loadingAnswerKey ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                <span>Generando plantilla de respuestas y claves diagnósticas...</span>
              </div>
            ) : !answerKeyData ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No se encontraron datos para esta prueba.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
                  <span>Total de preguntas convocadas: <strong>{answerKeyData.totalQuestions}</strong>. Cada pregunta cuenta con <strong>una única respuesta correcta inequívoca</strong>.</span>
                  <span className="text-[11px] font-bold text-indigo-700">Listo para proyectar</span>
                </div>

                <div className="space-y-3">
                  {answerKeyData.answerKey.map((item: any) => {
                    const isExpanded = Boolean(expandedKeys[item.index]);

                    return (
                      <div key={item.index} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                              {item.index}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">{item.caseTitle}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-xs">
                              Clave: {item.correctOptionId} ({item.correctCode})
                            </span>
                            <button
                              type="button"
                              onClick={() => setExpandedKeys((prev) => ({ ...prev, [item.index]: !prev[item.index] }))}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition flex items-center gap-1"
                            >
                              <span>{isExpanded ? 'Ocultar Justificación' : 'Ver 4 Bloques'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                          <strong>Diagnóstico Válido:</strong> {item.correctCode} - {item.correctDescription}
                        </div>

                        {isExpanded && item.reasonedResolution && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                              <span className="font-bold text-brand-700 block text-[11px] uppercase">1. Análisis Clínico</span>
                              <p className="text-slate-700 leading-relaxed text-[11px]">{item.reasonedResolution.clinicalAnalysis}</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                              <span className="font-bold text-teal-700 block text-[11px] uppercase">2. Ruta CIM-10 (Índice y Tabular)</span>
                              <p className="text-slate-700 leading-relaxed text-[11px]">{item.reasonedResolution.cim10Path}</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                              <span className="font-bold text-purple-700 block text-[11px] uppercase">3. Verificación Normativa</span>
                              <p className="text-slate-700 leading-relaxed text-[11px]">{item.reasonedResolution.ruleCheck}</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                              <span className="font-bold text-amber-700 block text-[11px] uppercase">4. Análisis de Distractores</span>
                              <div className="text-[11px] text-slate-700 space-y-0.5">
                                {Object.entries(item.reasonedResolution.distractorExplanations || {}).map(([opt, desc]: any) => (
                                  <div key={opt}><strong>{opt}:</strong> {desc}</div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Generar Nueva Batería Dinámica por Curso / Convocatoria */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Generar Nueva Batería de Casos MEAP / Convocatoria</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Genera un conjunto de casos clínicos inéditos vinculados al año <strong>{courseId}</strong> para evitar repetir supuestos de convocatorias anteriores y prevenir filtraciones.
            </p>

            {batchMsg && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${batchMsg.startsWith('Error') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                {batchMsg}
              </div>
            )}

            <form onSubmit={handleGenerateBatch} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Identificador del Lote / Convocatoria</label>
                <input
                  type="text"
                  placeholder="Ej: Convocatoria_Ordinaria_Enero_2027"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-purple-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ámbito Asistencial</label>
                  <select
                    value={batchDiscipline}
                    onChange={(e) => setBatchDiscipline(e.target.value as ServiceArea)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900"
                  >
                    <option value="simulacro_integral">Multidisciplinar (Todos los ámbitos)</option>
                    {ALL_SERVICE_AREAS.map((a) => (
                      <option key={a} value={a}>{DISCIPLINE_CATALOG[a]?.name || a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número de Preguntas ({batchCount})</label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={batchCount}
                    onChange={(e) => setBatchCount(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-900">
                  <input
                    type="checkbox"
                    checked={createExamFromBatch}
                    onChange={(e) => setCreateExamFromBatch(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Crear automáticamente examen preparado con este lote</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={batchGenerating}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {batchGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{batchGenerating ? 'Generando batería...' : 'Generar Lote en SQLite'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Creación de Caso MEAP Concreto a Petición del Profesor (IA + Respaldo Offline) */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Crear Caso MEAP Personalizado del Profesor</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Introduce un supuesto clínico de tu experiencia asistencial. La plataforma estructurará el caso, generará 4 opciones con una <strong>única respuesta correcta inequívoca</strong> y construirá la <strong>resolución razonada en 4 bloques</strong> (compatible con Ollama local y motor offline).
            </p>

            {customMsg && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${customMsg.startsWith('Error') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                {customMsg}
              </div>
            )}

            <form onSubmit={handleCreateCustomCase} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción del Supuesto Clínico *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ej: Varón de 68 años con EPOC reagudizada por infección respiratoria bacteriana e insuficiencia respiratoria global..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ámbito Asistencial MEAP</label>
                  <select
                    value={customDiscipline}
                    onChange={(e) => setCustomDiscipline(e.target.value as ServiceArea)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900"
                  >
                    {ALL_SERVICE_AREAS.filter(a => a !== 'simulacro_integral').map((a) => (
                      <option key={a} value={a}>{DISCIPLINE_CATALOG[a]?.name || a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nivel de Dificultad (1 a 5)</label>
                  <select
                    value={customLevel}
                    onChange={(e) => setCustomLevel(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  >
                    <option value={1}>Nivel 1: Básico / Unidiagnóstico</option>
                    <option value={2}>Nivel 2: Comorbilidades / Específico</option>
                    <option value={3}>Nivel 3: Normativa Excluye 1 y Jerarquía</option>
                    <option value={4}>Nivel 4: Manifestación-Etiología / Lateralidad</option>
                    <option value={5}>Nivel 5: Experto Clínico / Simulación Compleja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código CIM-10 Objetivo (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: J44.1 o I21.09"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Criterio Normativo a Evaluar (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Nota Excluye 1 entre EPOC y asma"
                    value={customCriteria}
                    onChange={(e) => setCustomCriteria(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={customGenerating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {customGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                  <span>{customGenerating ? 'Estructurando caso...' : 'Generar e Incorporar Caso'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
